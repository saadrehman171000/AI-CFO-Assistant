"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Enhanced fetch with retry logic and better error handling
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries} to:`, url);

      // Add longer timeout for file uploads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If successful, return immediately
      if (response.ok) {
        console.log(`Upload successful on attempt ${attempt}`);
        return response;
      }

      // If it's a client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        console.log(`Client error ${response.status}, not retrying`);
        return response;
      }

      // For server errors (5xx), retry
      throw new Error(`Server error: ${response.status} ${response.statusText}`);

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Upload attempt ${attempt} failed:`, lastError.message);

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

interface UploadResponse {
  success: boolean;
  message: string;
  reportId?: string;
}

export default function SimpleFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (fileType && ["csv", "pdf", "xlsx"].includes(fileType)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a CSV, PDF, or Excel (.xlsx) file.");
        toast({
          title: "Invalid file type",
          description: "Please select a CSV, PDF, or Excel (.xlsx) file.",
          variant: "destructive",
        });
      }
    }
  };

  const checkForDuplicates = async (file: File): Promise<boolean> => {
    setIsCheckingDuplicate(true);
    try {
      const response = await fetch("/api/check-duplicate-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        console.warn("Duplicate check failed, proceeding with upload");
        return false;
      }

      const result = await response.json();
      return result.hasDuplicates;
    } catch (error) {
      console.warn("Duplicate check error:", error);
      return false; // Allow upload if check fails
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setError(null);

    // Check for duplicates first
    const isDuplicate = await checkForDuplicates(selectedFile);
    if (isDuplicate) {
      const errorMessage = `File "${selectedFile.name}" has already been uploaded. Please select a different file.`;
      setError(errorMessage);
      toast({
        title: "Duplicate File Detected",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    // Get the user ID from Clerk
    const userId = user?.id;

    // Build URL with user_id parameter
    const uploadUrl = new URL(`${BASE_URL}/upload-financial-document`);
    if (userId) {
      uploadUrl.searchParams.append("user_id", userId);
    }
    uploadUrl.searchParams.append("store_in_vector_db", "true");

    try {
      console.log("Uploading to:", uploadUrl.toString());
      console.log("User ID:", userId);
      console.log("File size:", selectedFile.size, "bytes");

      // Step 1: Send file to Flask backend for analysis with retry logic
      const response = await fetchWithRetry(uploadUrl.toString(), {
        method: "POST",
        body: formData,
      }, 3);

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // If we can't parse error as JSON, use status text
        }
        throw new Error(errorMessage);
      }

      // Step 2: Parse the response from Flask backend
      const analysisResult = await response.json();

      // Step 3: Store the analysis data in our database
      try {
        const storeResponse = await fetch("/api/upload-financial-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: analysisResult.file_info.filename,
            fileType: analysisResult.file_info.file_type,
            fileSizeMb: analysisResult.file_info.file_size_mb,
            analysisData: analysisResult,
          }),
        });

        if (!storeResponse.ok) {
          console.error(
            "Failed to store analysis data in database, but will continue"
          );
        }
      } catch (storeError) {
        console.error("Error storing analysis data:", storeError);
        // Continue even if storing fails - we'll still redirect to dashboard
      }

      // Display success message
      toast({
        title: "Upload Successful",
        description: "Your file has been uploaded and analyzed successfully",
      });

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "An error occurred during upload.";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for common issues with better error messages
        if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
          errorMessage = `Connection failed to backend server at ${BASE_URL}. The server might be starting up - this usually resolves in a few seconds.`;
        } else if (error.message.includes("AbortError") || error.message.includes("timeout")) {
          errorMessage = "Upload timed out. Please try again - large files may take longer to process.";
        } else if (error.message.includes("NetworkError") || error.message.includes("CORS")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("Server error")) {
          errorMessage = "Server temporarily unavailable. Please try again in a moment.";
        }
      }

      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50/50 hover:border-slate-400 transition-colors">
        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Financial Document
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Simply upload your financial document for AI-powered analysis
            </p>

            <Label htmlFor="file" className="cursor-pointer">
              <span className="text-base font-medium text-gray-900 block mb-2">
                {selectedFile
                  ? selectedFile.name
                  : "Choose your financial document"}
              </span>
              <Input
                id="file"
                type="file"
                accept=".csv,.pdf,.xlsx"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />
              {selectedFile ? (
                <div className="mt-2 flex items-center justify-center text-emerald-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>
                    File selected: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              )}
            </Label>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Supported formats: Excel (.xlsx), CSV, PDF</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading || isCheckingDuplicate}
        className="w-full mt-6 h-12 text-base font-medium"
      >
        {isCheckingDuplicate ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Checking for duplicates...</span>
          </>
        ) : isUploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            <span>Upload Document</span>
          </>
        )}
      </Button>
    </div>
  );
}

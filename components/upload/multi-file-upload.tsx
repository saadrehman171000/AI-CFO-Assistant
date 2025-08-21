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
  X,
  File,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface FileWithPreview extends File {
  preview?: string;
}

export default function MultiFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileWithPreview[] = [];
    setError(null);

    // Check for maximum file count
    if (selectedFiles.length + files.length > 10) {
      setError("Maximum 10 files allowed.");
      toast({
        title: "Too many files",
        description: "Maximum 10 files allowed.",
        variant: "destructive",
      });
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.name.split(".").pop()?.toLowerCase();

      if (fileType && ["csv", "pdf", "xlsx", "xls"].includes(fileType)) {
        // Check file size (10MB limit)
        if (file.size <= 10 * 1024 * 1024) {
          newFiles.push(file);
        } else {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB limit.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: `${file.name}: Please select CSV, PDF, or Excel (.xlsx/.xls) files.`,
          variant: "destructive",
        });
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      console.log(
        "Uploading multiple files to:",
        `${BASE_URL}/analyze-multiple-files`
      );

      // Step 1: Send files to Flask backend for analysis
      const response = await fetch(`${BASE_URL}/analyze-multiple-files`, {
        method: "POST",
        body: formData,
      });

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
      const analysisResults = await response.json();

      // Generate a unique group ID for this batch
      const groupId = new Date().toISOString();

      // Step 3: Store the analysis data in our database
      try {
        const filesData = Object.entries(analysisResults.results).map(
          ([filename, data]: [string, any]) => ({
            fileName: filename,
            fileType: data.file_info.file_type,
            fileSizeMb: data.file_info.file_size_mb,
            analysisData: data,
          })
        );

        const storeResponse = await fetch("/api/multi-file-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId,
            files: filesData,
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
        description: `${selectedFiles.length} files have been uploaded and analyzed successfully`,
      });

      // Reset form
      setSelectedFiles([]);
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

        // Check for common issues
        if (error.message.includes("fetch")) {
          errorMessage = `Could not connect to backend server at ${BASE_URL}. Please check if the server is running.`;
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("CORS")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
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
    <div className="max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center py-3 sm:py-4 md:py-6">
          <CardTitle className="text-xl sm:text-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span>Upload Multiple Financial Documents</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Upload up to 10 financial documents for combined AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 sm:p-6 md:p-8 text-center hover:border-blue-400 transition-colors">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>

              <div>
                <Label htmlFor="multi-file" className="cursor-pointer">
                  <span className="text-base sm:text-lg font-medium text-gray-900 block mb-2">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} files selected`
                      : "Choose multiple financial documents"}
                  </span>
                  <Input
                    id="multi-file"
                    type="file"
                    accept=".csv,.pdf,.xlsx,.xls"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                  />
                  <Button
                    variant="outline"
                    className="mt-2 text-xs sm:text-sm py-1 sm:py-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Browse Files
                  </Button>
                </Label>
              </div>

              <div className="text-xs sm:text-sm text-gray-500">
                <p>Supported formats: Excel (.xlsx, .xls), CSV, PDF</p>
                <p>Maximum file size: 10MB per file, up to 10 files</p>
              </div>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 mt-3 sm:mt-4">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Selected Files
              </h3>
              <div className="max-h-40 sm:max-h-48 md:max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-md border mb-2"
                  >
                    <div className="flex items-center min-w-0 flex-1 pr-2">
                      <File className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-500 h-7 w-7 p-0 flex-shrink-0"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="mt-3 sm:mt-4 text-xs sm:text-sm py-2 px-3"
            >
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="w-full h-10 sm:h-12 text-sm sm:text-base md:text-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span>
                  Uploading {selectedFiles.length}{" "}
                  {selectedFiles.length === 1 ? "file" : "files"}...
                </span>
              </>
            ) : (
              <>
                <Upload className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                <span>
                  Upload {selectedFiles.length > 0 ? selectedFiles.length : ""}{" "}
                  Documents
                </span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

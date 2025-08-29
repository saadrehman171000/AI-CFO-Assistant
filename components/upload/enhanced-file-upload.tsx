"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  MapPin,
  X,
  File,
  Files,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface CompanyData {
  company: {
    id: string;
    name: string;
    branches: Branch[];
  } | null;
  isCompanyAdmin: boolean;
}

interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  uploadDate: string;
  branchId?: string;
  companyId?: string;
  branch?: Branch;
}

interface FileWithPreview extends File {
  preview?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function EnhancedFileUpload() {
  const router = useRouter();
  const { user } = useUser();

  // Single file upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Multi-file upload states
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [multiSelectedBranch, setMultiSelectedBranch] = useState<string>('');
  const [isMultiUploading, setIsMultiUploading] = useState(false);

  // Common states
  const [uploadedAnalysis, setUploadedAnalysis] = useState<AnalysisResult | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCompanyData();
    loadAnalyses();
  }, []);

  const checkCompanyData = async () => {
    try {
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompanyData(data);
      }
    } catch (error) {
      console.error('Error checking company data:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (fileType && ["csv", "pdf", "xlsx"].includes(fileType)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV, PDF, Excel (.xlsx) file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check if company user has selected a branch
    if (companyData?.company && !selectedBranch) {
      toast({
        title: "Branch required",
        description: "Please select a branch for this financial document.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    // Add branch and company info if available
    if (companyData?.company) {
      formData.append("companyId", companyData.company.id);
      if (selectedBranch) {
        formData.append("branchId", selectedBranch);
      }
    }

    try {
      const response = await fetch("/api/financial-analyses", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        setUploadedAnalysis(result.analysis);
        toast({
          title: "Upload successful",
          description: "Your financial document has been analyzed successfully. Redirecting to dashboard...",
        });
        // Reset form
        setSelectedFile(null);
        setSelectedBranch('');
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Reload analyses list
        loadAnalyses();
        
        // Redirect to the dashboard with the analysis ID
        setTimeout(() => {
          router.push(`/dashboard?analysisId=${result.analysis.id}`);
        }, 1500); // Short delay to show the success message
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Multi-file upload functions
  const handleMultiFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileWithPreview[] = [];

    // Check for maximum file count
    if (selectedFiles.length + files.length > 10) {
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
        // Check file size (50MB limit)
        if (file.size <= 50 * 1024 * 1024) {
          newFiles.push(file);
        } else {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 50MB limit.`,
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
    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const checkForDuplicates = async (files: FileWithPreview[]): Promise<string[]> => {
    setIsCheckingDuplicates(true);
    try {
      const response = await fetch("/api/check-duplicate-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: files.map(file => ({ name: file.name, size: file.size })),
        }),
      });

      if (!response.ok) {
        console.warn("Duplicate check failed, proceeding with upload");
        return [];
      }

      const result = await response.json();
      return result.duplicates || [];
    } catch (error) {
      console.warn("Duplicate check error:", error);
      return []; // Allow upload if check fails
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleMultiUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check if company user has selected a branch
    if (companyData?.company && !multiSelectedBranch) {
      toast({
        title: "Branch required",
        description: "Please select a branch for these financial documents.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates first
    const duplicates = await checkForDuplicates(selectedFiles);
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Files Detected",
        description: `${duplicates.length} file(s) already uploaded: ${duplicates.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsMultiUploading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    // Get the user ID from Clerk
    const userId = user?.id;

    // Build URL with user_id parameter for backend
    const uploadUrl = new URL(`${BASE_URL}/analyze-multiple-files`);
    if (userId) {
      uploadUrl.searchParams.append("user_id", userId);
    }
    uploadUrl.searchParams.append("store_in_vector_db", "true");

    try {
      console.log("Uploading multiple files to:", uploadUrl.toString());

      // Step 1: Send files to Flask backend for combined analysis
      const response = await fetch(uploadUrl.toString(), {
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

      // Step 3: Store the combined analysis data in our database
      try {
        // Create combined filename
        const combinedFileName = selectedFiles.map(f => f.name.split('.')[0]).join('_') + '_combined';

        const storeResponse = await fetch("/api/multi-file-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: combinedFileName,
            fileNames: selectedFiles.map(f => f.name),
            analysisData: analysisResults,
            companyId: companyData?.company?.id,
            branchId: multiSelectedBranch || null,
          }),
        });

        if (!storeResponse.ok) {
          console.error("Failed to store analysis data in database, but will continue");
        } else {
          const storeResult = await storeResponse.json();
          setUploadedAnalysis(storeResult.analysis);
        }
      } catch (storeError) {
        console.error("Error storing analysis data:", storeError);
        // Continue even if storing fails - we'll still redirect to dashboard
      }

      // Display success message
      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} files have been uploaded and analyzed together successfully. Redirecting to dashboard...`,
      });

      // Reset form
      setSelectedFiles([]);
      setMultiSelectedBranch('');
      if (multiFileInputRef.current) {
        multiFileInputRef.current.value = "";
      }

      // Reload analyses list
      loadAnalyses();

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
          errorMessage = "Upload timed out. Please try again - multiple files may take longer to process.";
        } else if (error.message.includes("NetworkError") || error.message.includes("CORS")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("Server error")) {
          errorMessage = "Server temporarily unavailable. Please try again in a moment.";
        }
      }

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMultiUploading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this analysis? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(analysisId);
    try {
      const response = await fetch("/api/financial-analyses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisId }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Analysis deleted",
          description: "The analysis has been successfully deleted.",
        });
        // Remove from local state
        setAnalyses(analyses.filter((a) => a.id !== analysisId));
        if (uploadedAnalysis?.id === analysisId) {
          setUploadedAnalysis(null);
        }
      } else {
        throw new Error(result.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the analysis.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const loadAnalyses = async () => {
    setIsLoadingAnalyses(true);
    try {
      const response = await fetch("/api/financial-analyses", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        setAnalyses(result.analyses || []);
      }
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  const formatFileSize = (sizeInMB: number | undefined) => {
    if (sizeInMB === undefined || sizeInMB === null) {
      return '0 KB';
    }
    return sizeInMB < 1 
      ? `${(sizeInMB * 1024).toFixed(0)} KB`
      : `${sizeInMB.toFixed(1)} MB`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Financial Documents
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your financial documents to get comprehensive AI-powered analysis, 
          insights, and store them for intelligent chatbot queries.
        </p>
      </div>

      {/* Company Info */}
      {companyData?.company && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-lg text-blue-900">
                  {companyData.company.name}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {companyData.company.branches.length} branch{companyData.company.branches.length !== 1 ? 'es' : ''} available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Upload Form with Tabs */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>Upload Financial Documents</span>
          </CardTitle>
          <CardDescription className="text-base">
            Upload single or multiple financial documents for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                Single File
              </TabsTrigger>
              <TabsTrigger value="multiple" className="flex items-center gap-2">
                <Files className="h-4 w-4" />
                Multiple Files
              </TabsTrigger>
            </TabsList>

            {/* Single File Upload */}
            <TabsContent value="single" className="space-y-6">
              {/* Branch Selection for Company Users */}
              {companyData?.company && companyData.company.branches.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Select Branch *
                  </Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose which branch this document belongs to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companyData.company.branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{branch.name} - {branch.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedBranch && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Document will be assigned to this branch</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file" className="text-sm font-medium">
                  Select File
                </Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.pdf,.xlsx,.xls"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="h-11 cursor-pointer"
                  />
                  {selectedFile && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: CSV, PDF, Excel (.xlsx, .xls) (max 50MB)
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || (!!companyData?.company && !selectedBranch)}
                className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Upload className="mr-3 h-5 w-5" />
                    Upload & Analyze Document
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Multiple Files Upload */}
            <TabsContent value="multiple" className="space-y-6">
              {/* Branch Selection for Company Users */}
              {companyData?.company && companyData.company.branches.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="multi-branch" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Select Branch *
                  </Label>
                  <Select value={multiSelectedBranch} onValueChange={setMultiSelectedBranch}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose which branch these documents belong to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companyData.company.branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{branch.name} - {branch.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {multiSelectedBranch && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Documents will be assigned to this branch</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="multi-file" className="text-sm font-medium">
                  Select Multiple Files
                </Label>
                <div className="relative">
                  <Input
                    id="multi-file"
                    type="file"
                    accept=".csv,.pdf,.xlsx,.xls"
                    onChange={handleMultiFileSelect}
                    ref={multiFileInputRef}
                    className="h-11 cursor-pointer"
                    multiple
                  />
                  {selectedFiles.length > 0 && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported formats: CSV, PDF, Excel (.xlsx, .xls) | Max 10 files, 50MB each
                </p>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Selected Files ({selectedFiles.length})
                  </Label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-white">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center min-w-0 flex-1 pr-2">
                          <File className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
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
                          className="text-gray-500 hover:text-red-500 h-8 w-8 p-0 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleMultiUpload}
                disabled={selectedFiles.length === 0 || isMultiUploading || isCheckingDuplicates || (!!companyData?.company && !multiSelectedBranch)}
                className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
              >
                {isCheckingDuplicates ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Checking for duplicates...
                  </>
                ) : isMultiUploading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Analyzing {selectedFiles.length} files together...
                  </>
                ) : (
                  <>
                    <Upload className="mr-3 h-5 w-5" />
                    Upload & Analyze {selectedFiles.length > 0 ? selectedFiles.length : ""} Documents Together
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

     

     
    </div>
  );
}

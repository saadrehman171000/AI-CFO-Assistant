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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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

export default function EnhancedFileUpload() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAnalysis, setUploadedAnalysis] = useState<AnalysisResult | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      {/* Upload Form */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>Upload New Document</span>
          </CardTitle>
          <CardDescription className="text-base">
            Upload your financial documents to get AI-powered analysis and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>

     

     
    </div>
  );
}

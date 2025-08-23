"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
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
  AlertCircle,
  Loader2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface FileInfo {
  filename: string;
  file_type: string;
  file_size_mb: number;
}

interface FinancialAnalysisResponse {
  file_info: FileInfo;
  analysis: {
    profit_and_loss: any;
    balance_sheet: any;
    cash_flow_statement: any;
    financial_ratios: any;
    key_kpis: any;
    cash_flow_trends: any;
    ar_aging: any;
    ap_aging: any;
    key_insights: string[];
    ai_powered_insights: any;
    executive_summary: any;
    cash_flow_analysis: any;
    working_capital_management: any;
    what_if_scenarios: any;
    strategic_recommendations: any;
    executive_dashboard_kpis: any;
    key_insights_summary: string[];
  };
}

interface FinancialDocumentUploadProps {
  onAnalysisComplete?: (analysis: FinancialAnalysisResponse) => void;
}

export default function FinancialDocumentUpload({
  onAnalysisComplete,
}: FinancialDocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<FinancialAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (fileType && ["csv", "pdf", "xlsx"].includes(fileType)) {
        setSelectedFile(file);
        setAnalysisResult(null); // Clear previous results
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV, PDF, or Excel (.xlsx) file.",
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
      console.log("File:", selectedFile.name, selectedFile.size, "bytes");
      console.log("User ID:", userId);

      const response = await fetch(uploadUrl.toString(), {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        // Try to get detailed error message from response
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

      const result: FinancialAnalysisResponse = await response.json();
      console.log("Analysis result received:", result.file_info);

      setAnalysisResult(result);
      onAnalysisComplete?.(result);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${result.file_info.filename}`,
      });

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "An error occurred during upload and analysis.";
      let errorTitle = "Upload failed";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for common issues
        if (error.message.includes("fetch")) {
          errorTitle = "Connection failed";
          errorMessage = `Could not connect to backend server at ${BASE_URL}. Please check if the server is running and CORS is configured.`;
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("CORS")
        ) {
          errorTitle = "Network Error";
          errorMessage =
            "CORS or network issue. Please check if your backend allows requests from this origin.";
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Form */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>Upload Financial Document</span>
          </CardTitle>
          <CardDescription className="text-base">
            Simply upload your financial document and get instant AI-powered
            analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <Label htmlFor="file" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-900">
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
                  </Label>
                  {selectedFile && (
                    <div className="mt-2 flex items-center justify-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm">
                        File selected:{" "}
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <p>Supported formats: Excel (.xlsx), CSV, PDF</p>
                  <p>Maximum file size: 10MB</p>
                </div>

                {!selectedFile && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Analyzing Financial Document...
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

      {/* Analysis Results Summary */}
      {analysisResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Financial Analysis Complete</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              {analysisResult.file_info.filename} (
              {analysisResult.file_info.file_type}) -{" "}
              {analysisResult.file_info.file_size_mb}MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(
                    analysisResult.analysis.profit_and_loss.revenue_analysis
                      .total_revenue
                  )}
                </div>
                <div className="text-sm text-green-700">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(
                    Math.abs(
                      analysisResult.analysis.profit_and_loss.cost_structure
                        .total_expenses
                    )
                  )}
                </div>
                <div className="text-sm text-red-700">Total Expenses</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div
                  className={`text-xl font-bold ${
                    analysisResult.analysis.profit_and_loss
                      .profitability_metrics.net_income >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    analysisResult.analysis.profit_and_loss
                      .profitability_metrics.net_income
                  )}
                </div>
                <div className="text-sm text-gray-700">Net Income</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-xl font-bold text-blue-600">
                  {
                    analysisResult.analysis.executive_summary
                      .business_health_score
                  }
                </div>
                <div className="text-sm text-blue-700">Health Score</div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3 text-green-800">
                Key Insights
              </h4>
              <div className="space-y-2">
                {analysisResult.analysis.key_insights_summary
                  .slice(0, 3)
                  .map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{insight}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Critical Alerts */}
            {analysisResult.analysis.executive_summary.critical_alerts.length >
              0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Critical Alerts:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResult.analysis.executive_summary.critical_alerts
                      .slice(0, 2)
                      .map((alert: string, index: number) => (
                        <li key={index} className="text-sm">
                          {alert}
                        </li>
                      ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, MapPin } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface FinancialAnalysis {
  id: string;
  fileName: string;
  reportType: string;
  createdAt: string;
  year?: number;
  month?: number;
}

interface BranchUploadSelectorProps {
  onSelectionChange: (branchId: string | null, analysisId: string | null) => void;
  className?: string;
  title?: string;
  description?: string;
  showAllBranchesOption?: boolean;
  initialBranchId?: string | null;
  initialAnalysisId?: string | null;
}

export default function BranchUploadSelector({
  onSelectionChange,
  className = "",
  title = "Select Branch & Upload",
  description = "Choose a branch and specific financial analysis",
  showAllBranchesOption = false,
  initialBranchId = null,
  initialAnalysisId = null,
}: BranchUploadSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(initialBranchId);
  const [analyses, setAnalyses] = useState<FinancialAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(initialAnalysisId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  // Sync with initial values when they change
  useEffect(() => {
    setSelectedBranchId(initialBranchId);
    setSelectedAnalysisId(initialAnalysisId);
  }, [initialBranchId, initialAnalysisId]);

  useEffect(() => {
    if (selectedBranchId) {
      fetchAnalyses(selectedBranchId);
    } else {
      setAnalyses([]);
      setSelectedAnalysisId(null);
    }
  }, [selectedBranchId]);

  // Note: onSelectionChange is now called directly in the onValueChange handlers to prevent multiple calls

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/company/branches");
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchAnalyses = async (branchId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/financial-analyses?branchId=${branchId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
        // Auto-select the latest analysis if available
        if (data.analyses && data.analyses.length > 0) {
          setSelectedAnalysisId(data.analyses[0].id);
        } else {
          setSelectedAnalysisId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching analyses:", error);
      setAnalyses([]);
      setSelectedAnalysisId(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Branch</label>
          <Select
            value={selectedBranchId || ""}
            onValueChange={(value) => {
              const newBranchId = value === "all" ? null : value;
              console.log('Branch selector: Branch changed to:', newBranchId);
              setSelectedBranchId(newBranchId);
              setSelectedAnalysisId(null);
              onSelectionChange(newBranchId, null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a branch..." />
            </SelectTrigger>
            <SelectContent>
              {showAllBranchesOption && (
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    All Branches
                  </div>
                </SelectItem>
              )}
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {branch.location}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload/Analysis Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Financial Analysis
          </label>
          <Select
            value={selectedAnalysisId || ""}
            onValueChange={(value) => {
              console.log('Branch selector: Analysis changed to:', value);
              setSelectedAnalysisId(value);
              onSelectionChange(selectedBranchId, value);
            }}
            disabled={!selectedBranchId || loading}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  !selectedBranchId 
                    ? "Select a branch first..."
                    : loading 
                    ? "Loading analyses..."
                    : analyses.length === 0
                    ? "No analyses available"
                    : "Select an analysis..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {analyses.map((analysis) => (
                <SelectItem key={analysis.id} value={analysis.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{analysis.fileName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{analysis.reportType}</span>
                        <span>•</span>
                        <span>{formatDate(analysis.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection Summary */}
        {(selectedBranch || selectedAnalysis) && (
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-medium text-gray-700">Current Selection</div>
            <div className="space-y-1">
              {selectedBranch && (
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <MapPin className="h-3 w-3" />
                  {selectedBranch.name}
                </Badge>
              )}
              {selectedAnalysis && (
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <FileText className="h-3 w-3" />
                  {selectedAnalysis.fileName}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* No data available message */}
        {selectedBranchId && !loading && analyses.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No financial analyses found for this branch.</p>
            <p className="text-xs">Upload a financial document to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

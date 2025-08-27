"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import ComprehensiveFinancialDashboard from "./comprehensive-financial-dashboard";
import BranchUploadSelector from "@/components/company/branch-upload-selector";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Eye,
  FileText,
  Calendar,
  Users,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie,
} from "recharts";

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashFlowFromOperations: number;
  cashFlowFromInvesting: number;
  cashFlowFromFinancing: number;
  netCashFlow: number;
  arDays: number;
  apDays: number;
  ebitda: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquityRatio: number;
}

interface AIInsight {
  type: "trend" | "anomaly" | "recommendation" | "summary";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  impact: string;
  suggestion?: string;
}

interface FileInfo {
  filename: string;
  file_type: string;
  file_size_mb: number;
}

interface FinancialAnalysisData {
  file_info: FileInfo;
  analysis: {
    profit_and_loss: {
      total_revenue: number;
      total_expenses: number;
      gross_profit: number;
      net_income: number;
      revenue_breakdown: any;
      expense_breakdown: any;
      revenue_analysis: any;
      cost_structure: any;
      profitability_metrics: any;
    };
    balance_sheet: {
      total_assets: number;
      total_liabilities: number;
      total_equity: number;
      current_assets: number;
      current_liabilities: number;
      cash: number;
      accounts_receivable: number;
      accounts_payable: number;
      assets: any;
      liabilities: any;
      equity: any;
    };
    cash_flow_statement: {
      operating_cash_flow: number;
      investing_cash_flow: number;
      financing_cash_flow: number;
      net_cash_change: number;
      beginning_cash: number;
      ending_cash: number;
    };
    financial_ratios: {
      profitability_ratios: any;
      liquidity_ratios: any;
      efficiency_ratios: any;
      leverage_ratios: any;
    };
    key_kpis: any;
    cash_flow_trends: any;
    ar_aging: any;
    ap_aging: any;
    key_insights: string[];
    ai_powered_insights: {
      trend_analysis: any[];
      anomaly_detection: any[];
      pattern_recognition: any[];
      predictive_insights: any[];
      predictive_alerts: any[];
      performance_benchmarking: any;
    };
    executive_summary: {
      business_health_score: number;
      financial_strength: string;
      key_performance_indicators: any;
      critical_alerts: string[];
    };
    cash_flow_analysis: any;
    working_capital_management: any;
    what_if_scenarios: any;
    strategic_recommendations: any;
    executive_dashboard_kpis: any;
    key_insights_summary: string[];
  };
}

interface DashboardData {
  analysisData: FinancialAnalysisData | null;
  analysisHistory: FinancialAnalysisData[];
  // Legacy fields maintained for backward compatibility
  sheetType: string;
  summary: {
    totalDebits?: number;
    totalCredits?: number;
    imbalance?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    totalRevenue?: number;
    totalExpenses?: number;
    grossProfit?: number;
    operatingIncome?: number;
    netProfit?: number;
    grossMargin?: number;
    netMargin?: number;
    topAccounts?: Array<{
      name: string;
      debit?: number;
      credit?: number;
      amount?: number;
      category?: string;
    }>;
    cashFlowOperating?: number;
    cashFlowInvesting?: number;
    cashFlowFinancing?: number;
    netCashFlow?: number;
  };
  accounts: any[];
  insights: any[];
  trends: any;
  topAccounts: any;
  reportInfo?: any;
}

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [currentAnalysisData, setCurrentAnalysisData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let analysisData = null;
      let analysisHistory = [];

      // If a specific analysis is selected, fetch that data
      if (selectedAnalysisId) {
        const analysisResponse = await fetch(
          `/api/analysis-data?analysisId=${selectedAnalysisId}`
        );

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();
          if (analysisResult.success && analysisResult.analysisData) {
            analysisData = analysisResult.analysisData;
            setCurrentAnalysisData(analysisResult.analysisData);
          }
        }
      }
      // If no specific analysis selected, fetch latest for the branch or company
      else {
        const endpoint = selectedBranchId
          ? `/api/financial-analyses?branchId=${selectedBranchId}&latest=true`
          : "/api/financial-analyses?latest=true";

        const analysisResponse = await fetch(endpoint);

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();
          if (analysisResult.success && analysisResult.analysis) {
            // Now fetch the actual analysis data
            const dataResponse = await fetch(
              `/api/analysis-data?analysisId=${analysisResult.analysis.id}`
            );
            if (dataResponse.ok) {
              const dataResult = await dataResponse.json();
              if (dataResult.success && dataResult.analysisData) {
                analysisData = dataResult.analysisData;
                setCurrentAnalysisData(dataResult.analysisData);
              }
            }
          }
        }
      }

      // Fetch analysis history for the selected branch
      if (selectedBranchId) {
        try {
          const historyResponse = await fetch(
            `/api/financial-analyses?branchId=${selectedBranchId}`
          );
          if (historyResponse.ok) {
            const historyResult = await historyResponse.json();
            if (historyResult.success && historyResult.analyses) {
              analysisHistory = historyResult.analyses;
            }
          }
        } catch (historyError) {
          console.error("Error fetching analysis history:", historyError);
        }
      }

      if (analysisData) {
        // Use only the data from the financial analysis endpoint
        setDashboardData({
          analysisData,
          analysisHistory,
          sheetType: "",
          summary: {
            totalRevenue:
              analysisData?.analysis?.profit_and_loss?.revenue_analysis
                ?.total_revenue || 0,
            totalExpenses:
              analysisData?.analysis?.profit_and_loss?.cost_structure
                ?.total_expenses || 0,
            netProfit:
              analysisData?.analysis?.profit_and_loss?.profitability_metrics
                ?.net_income || 0,
            grossMargin:
              analysisData?.analysis?.profit_and_loss?.profitability_metrics
                ?.margins?.gross_margin || 0,
            netMargin:
              analysisData?.analysis?.profit_and_loss?.profitability_metrics
                ?.margins?.net_margin || 0,
            totalAssets:
              analysisData?.analysis?.balance_sheet?.assets?.total_assets || 0,
            totalLiabilities:
              analysisData?.analysis?.balance_sheet?.liabilities
                ?.total_liabilities || 0,
            totalEquity:
              analysisData?.analysis?.balance_sheet?.equity?.total_equity || 0,
            cashFlowOperating:
              analysisData?.analysis?.cash_flow_analysis?.operating_activities
                ?.net_cash_from_operations || 0,
            cashFlowInvesting:
              analysisData?.analysis?.cash_flow_analysis?.investing_activities
                ?.net_investing_cash_flow || 0,
            cashFlowFinancing:
              analysisData?.analysis?.cash_flow_analysis?.financing_activities
                ?.net_financing_cash_flow || 0,
            netCashFlow:
              analysisData?.analysis?.cash_flow_analysis?.cash_position
                ?.net_change_in_cash || 0,
          },
          accounts: [],
          insights:
            analysisData?.analysis?.key_insights_summary?.map(
              (insight: any, index: number) => ({
                type:
                  index % 4 === 0
                    ? "trend"
                    : index % 4 === 1
                    ? "anomaly"
                    : index % 4 === 2
                    ? "recommendation"
                    : "summary",
                title: `Insight ${index + 1}`,
                description: insight,
                severity:
                  index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low",
                impact: "Impacts financial health and decision-making.",
                suggestion:
                  index % 2 === 0
                    ? "Consider reviewing related data points for more context."
                    : undefined,
              })
            ) || [],
          trends: {
            revenue: [],
            expenses: [],
            profit: [],
            months: [],
          },
          topAccounts: {
            revenue: [],
            expenses: [],
            assets: [],
            liabilities: [],
          },
          reportInfo: {
            latestReport: {
              fileName: analysisData?.file_info?.filename || "Budget_March.xlsx",
              reportType: "PROFIT_LOSS",
              totalRecords:
                analysisData?.analysis?.key_insights_summary?.length || 0,
            },
            totalReports: 1,
          },
        });
      } else {
        // No data available
        setError(
          "No financial analysis data available. Please upload a file first."
        );
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBranchId, selectedAnalysisId]); // Re-fetch when selection changes

  const handleSelectionChange = (branchId: string | null, analysisId: string | null) => {
    // Clear current data immediately to prevent glitching
    setCurrentAnalysisData(null);
    setSelectedBranchId(branchId);
    setSelectedAnalysisId(analysisId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUpIcon className="h-4 w-4 text-blue-500" />;
      case "anomaly":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "summary":
        return <Eye className="h-4 w-4 text-green-500" />;
      default:
        return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTrendIcon = (value: number, previousValue?: number) => {
    if (!previousValue) return <MinusIcon className="h-4 w-4 text-gray-500" />;
    if (value > previousValue)
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (value < previousValue)
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
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
    return `${value.toFixed(1)}%`;
  };

  const filteredInsights =
    dashboardData?.insights.filter(
      (insight) =>
        selectedInsightType === "all" || insight.type === selectedInsightType
    ) || [];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 sm:pb-2">
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-48 sm:h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-48 sm:h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10 rounded-2xl"></div>
        <div className="relative bg-red-50/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-200">
          <Alert variant="destructive" className="bg-transparent border-0 p-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            No Financial Data Available
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload your first financial document to see AI-powered insights and
            analytics.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <a href="/upload">Upload Document</a>
          </Button>
        </div>
      </div>
    );
  }

  // Check if we have comprehensive analysis data - show it with the comprehensive dashboard
  if (dashboardData?.analysisData) {
    return (
      <div className="space-y-6">
        {/* Render the comprehensive financial dashboard with shared state */}
        <ComprehensiveFinancialDashboard
          analysisData={currentAnalysisData}
          showSelector={true}
          selectedBranchId={selectedBranchId}
          selectedAnalysisId={selectedAnalysisId}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    );
  }

  // Legacy dashboard rendering
  const { summary, insights, trends, accounts, reportInfo, topAccounts } =
    dashboardData || {};

  // Define default values for potentially missing properties
  const extendedSummary = {
    ...summary,
    // Add properties that might not exist in summary with TypeScript safety
    currentRatio: 0,
    debtToEquityRatio: 0,
    quickRatio: 0,
    ebitda: 0,
    arDays: 0,
    apDays: 0,
    // Conditionally override with actual values if they exist
    ...(summary as any),
  };

  // Prepare chart data
  const chartData = trends?.months?.map((month: string, index: number) => ({
    month,
    revenue: trends?.revenue?.[index] || 0,
    expenses: trends?.expenses?.[index] || 0,
    profit: trends?.profit?.[index] || 0,
  })) || [];

  // Prepare pie chart data for expense breakdown
  const expenseBreakdown = accounts
    ?.filter((account) => account?.category === "EXPENSE")
    ?.slice(0, 5)
    ?.map((account, index) => ({
      name: account?.name || `Account ${index + 1}`,
      value: Math.abs(account?.amount || 0),
      color: ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"][index % 5],
    })) || [];

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Branch & Upload Selector */}
      <BranchUploadSelector
        onSelectionChange={handleSelectionChange}
        title="Select Data Source"
        description="Choose a branch and financial analysis to view dashboard data"
        showAllBranchesOption={true}
      />

      {/* Clean Professional Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Financial Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                AI-powered insights and analytics for your financial data
              </p>
            </div>
          </div>
          <Button
            onClick={refreshDashboard}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Report Info */}
      {reportInfo && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Latest Report Analysis
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Financial document analysis summary
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div
                className="text-sm font-semibold text-slate-700 truncate"
                title={reportInfo?.latestReport?.fileName}
              >
                {reportInfo?.latestReport?.fileName || 'Unknown File'}
              </div>
              <div className="text-xs text-gray-500 mt-1">File Name</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-semibold text-slate-700">
                {reportInfo?.latestReport?.reportType?.replace("_", " ") || 'Unknown Type'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Report Type</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-semibold text-slate-700">
                {reportInfo?.latestReport?.totalRecords || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Records Parsed</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-semibold text-slate-700">
                {reportInfo?.totalReports || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total Reports</div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                  {formatCurrency(summary?.totalRevenue || 0)}
                </p>
                {summary?.grossMargin && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Gross Margin: {formatPercentage(summary.grossMargin)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                  {formatCurrency(Math.abs(summary?.totalExpenses || 0))}
                </p>
                {summary?.netMargin && (
                  <p className="text-xs text-red-600 mt-1">
                    Net Margin: {formatPercentage(summary.netMargin)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Profit</p>
                <p
                  className={`text-lg sm:text-2xl font-semibold truncate ${(summary?.netProfit || 0) >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                    }`}
                >
                  {formatCurrency(summary?.netProfit || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(summary?.netProfit || 0) >= 0 ? "Profit" : "Loss"}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                  {formatCurrency(summary?.totalAssets || 0)}
                </p>
                {summary?.topAccounts && (
                  <p className="text-xs text-slate-600 mt-1">
                    {summary.topAccounts.length} Accounts
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Financial Trends Chart */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Financial Trends</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Revenue, expenses, and profit over time
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={50} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Expense Breakdown</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Top expense categories by amount
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Accounts with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            <div>
              <CardTitle className="text-lg">Top Accounts by Category</CardTitle>
              <CardDescription>
                Highest value accounts in each financial category
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-2 mt-4">
              {topAccounts?.revenue?.map((account: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-gray-700">
                    {account?.accountName || 'Unknown Account'}
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    {formatCurrency(Number(account?.amount || 0))}
                  </span>
                </div>
              )) || []}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-2 mt-4">
              {topAccounts?.expenses?.map((account: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-gray-700">
                    {account?.accountName || 'Unknown Account'}
                  </span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(Number(account?.amount || 0))}
                  </span>
                </div>
              )) || []}
            </TabsContent>

            <TabsContent value="assets" className="space-y-2 mt-4">
              {topAccounts?.assets?.map((account: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-gray-700">
                    {account?.accountName || 'Unknown Account'}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {formatCurrency(Number(account?.amount || 0))}
                  </span>
                </div>
              )) || []}
            </TabsContent>

            <TabsContent value="liabilities" className="space-y-2 mt-4">
              {topAccounts?.liabilities?.map((account: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-gray-700">
                    {account?.accountName || 'Unknown Account'}
                  </span>
                  <span className="text-orange-600 font-semibold">
                    {formatCurrency(Number(account?.amount || 0))}
                  </span>
                </div>
              )) || []}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-slate-600" />
              <div>
                <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
                <CardDescription>
                  Intelligent analysis of your financial data with actionable recommendations
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={selectedInsightType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedInsightType("all")}
            >
              All ({insights?.length || 0})
            </Button>
            <Button
              variant={selectedInsightType === "trend" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedInsightType("trend")}
            >
              Trends ({insights?.filter((i) => i.type === "trend")?.length || 0})
            </Button>
            <Button
              variant={selectedInsightType === "anomaly" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedInsightType("anomaly")}
            >
              Anomalies ({insights?.filter((i) => i.type === "anomaly")?.length || 0})
            </Button>
            <Button
              variant={selectedInsightType === "recommendation" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedInsightType("recommendation")}
            >
              Recommendations ({insights?.filter((i) => i.type === "recommendation")?.length || 0})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getInsightIcon(insight?.type || 'summary')}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {insight?.title || 'Insight'}
                      </h4>
                      <Badge variant={getSeverityColor(insight?.severity || 'low')}>
                        {insight?.severity || 'low'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {insight?.description || 'No description available'}
                    </p>
                    <p className="text-sm font-medium mb-2">
                      <span className="text-slate-700">Impact:</span>{" "}
                      {insight?.impact || 'No impact data available'}
                    </p>
                    {insight?.suggestion && (
                      <p className="text-sm">
                        <span className="text-slate-700 font-medium">
                          Suggestion:
                        </span>{" "}
                        {insight.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-slate-600" />
              <div>
                <CardTitle className="text-lg">Cash Flow Analysis</CardTitle>
                <CardDescription>
                  Operating, investing & financing activities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-gray-700">
                Operations:
              </span>
              <span
                className={`font-semibold ${(summary?.cashFlowOperating || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {formatCurrency(summary?.cashFlowOperating || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-gray-700">
                Investing:
              </span>
              <span
                className={`font-semibold ${(summary?.cashFlowInvesting || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {formatCurrency(summary?.cashFlowInvesting || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border border-slate-300">
              <span className="text-sm font-bold text-gray-800">
                Net Cash Flow:
              </span>
              <span
                className={`font-bold text-lg ${(summary?.netCashFlow || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {formatCurrency(summary?.netCashFlow || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-slate-600" />
              <div>
                <CardTitle className="text-lg">Financial Ratios</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-gray-700">
                Current Ratio:
              </span>
              <span className="font-semibold text-emerald-600">
                {extendedSummary?.currentRatio?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-gray-700">
                Debt/Equity:
              </span>
              <span className="font-semibold text-red-600">
                {extendedSummary?.debtToEquityRatio?.toFixed(2) || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border border-slate-300">
              <span className="text-sm font-bold text-gray-800">
                Quick Ratio:
              </span>
              <span className="font-bold text-lg text-blue-600">
                {extendedSummary?.quickRatio?.toFixed(2) || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-slate-600" />
              <div>
                <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
                <CardDescription>
                  Business health metrics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-gray-700">
                EBITDA:
              </span>
              <span className="font-semibold text-slate-700">
                {formatCurrency(extendedSummary?.ebitda || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-gray-700">
                AR Days:
              </span>
              <span className="font-semibold text-slate-700">
                {extendedSummary?.arDays || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border border-slate-300">
              <span className="text-sm font-bold text-gray-800">
                AP Days:
              </span>
              <span className="font-bold text-lg text-slate-700">
                {extendedSummary?.apDays || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div >
    </div>
  );
}

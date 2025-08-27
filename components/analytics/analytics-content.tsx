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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Filter,
  Download,
  Share2,
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
  Pie,
  Cell,
  AreaChart,
  Area,
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

interface AnalyticsData {
  metrics: FinancialMetrics;
  insights: AIInsight[];
  trends: {
    revenue: number[];
    expenses: number[];
    profit: number[];
    months: string[];
  };
  topAccounts: {
    revenue: Array<{
      accountName: string;
      amount: number;
      dataType: string;
    }>;
    expenses: Array<{
      accountName: string;
      amount: number;
      dataType: string;
    }>;
    assets: Array<{
      accountName: string;
      amount: number;
      dataType: string;
    }>;
    liabilities: Array<{
      accountName: string;
      amount: number;
      dataType: string;
    }>;
  };
  reportInfo?: {
    latestReport: {
      id: string;
      fileName: string;
      reportType: string;
      year: number;
      month: number;
      uploadDate: string;
      totalRecords: number;
    };
    totalReports: number;
    totalRecords: number;
  };
}

export default function AnalyticsContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedReportType, setSelectedReportType] = useState("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  // Helper function to safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = 0): any => {
    try {
      if (!obj || typeof obj !== 'object') return defaultValue;
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result === undefined || result === null || typeof result !== 'object') return defaultValue;
        result = result[key];
      }
      return result === undefined || result === null ? defaultValue : result;
    } catch (e) {
      return defaultValue;
    }
  };

  // Helper function to safely get string values
  const safeString = (value: any, defaultValue: string = ''): string => {
    return value != null && typeof value === 'string' ? value : defaultValue;
  };

  // Helper function to safely get number values
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return !isNaN(num) && isFinite(num) ? num : defaultValue;
  };

  // Helper function to safely get array values
  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) ? arr : [];
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let analysisResult = null;

      // If a specific analysis is selected, fetch that data
      if (selectedAnalysisId && typeof selectedAnalysisId === 'string') {
        try {
          const analysisResponse = await fetch(
            `/api/analysis-data?analysisId=${encodeURIComponent(selectedAnalysisId)}`
          );

          if (analysisResponse.ok) {
            const result = await analysisResponse.json();
            if (result?.success && result?.analysisData) {
              analysisResult = result.analysisData;
            } else {
              console.warn('Invalid API response structure:', result);
            }
          } else {
            console.warn(`API request failed with status: ${analysisResponse.status}`);
          }
        } catch (fetchError) {
          console.error('Error fetching specific analysis:', fetchError);
        }
      }
      // If no specific analysis selected, fetch latest for the branch or company
      else {
        try {
          const endpoint = selectedBranchId && typeof selectedBranchId === 'string'
            ? `/api/financial-analyses?branchId=${encodeURIComponent(selectedBranchId)}&latest=true`
            : "/api/financial-analyses?latest=true";

          const analysisResponse = await fetch(endpoint);

          if (analysisResponse.ok) {
            const result = await analysisResponse.json();
            if (result?.success && result?.analysis?.id) {
            // Now fetch the actual analysis data
              try {
                const dataResponse = await fetch(
                  `/api/analysis-data?analysisId=${encodeURIComponent(result.analysis.id)}`
                );
                if (dataResponse.ok) {
                  const dataResult = await dataResponse.json();
                  if (dataResult?.success && dataResult?.analysisData) {
                    analysisResult = dataResult.analysisData;
                  } else {
                    console.warn('Invalid analysis data response:', dataResult);
                  }
                } else {
                  console.warn(`Analysis data request failed with status: ${dataResponse.status}`);
                }
              } catch (dataFetchError) {
                console.error('Error fetching analysis data:', dataFetchError);
              }
            } else {
              console.warn('No valid analysis found in response:', result);
            }
          } else {
            console.warn(`Analysis list request failed with status: ${analysisResponse.status}`);
          }
        } catch (fetchError) {
          console.error('Error fetching latest analysis:', fetchError);
        }
      }

      // Check if we have the Flask backend format (file_info and analysis structure)
      if (
        analysisResult?.file_info &&
        analysisResult?.analysis
      ) {
        // Transform the Flask backend data into the format expected by the analytics component with null safety
        const transformedData: AnalyticsData = {
          metrics: {
            totalRevenue: safeNumber(
              safeGet(analysisResult, 'analysis.profit_and_loss.revenue_analysis.total_revenue')
            ),
            totalExpenses: safeNumber(
              safeGet(analysisResult, 'analysis.profit_and_loss.cost_structure.total_expenses')
            ),
            netProfit: safeNumber(
              safeGet(analysisResult, 'analysis.profit_and_loss.profitability_metrics.net_income')
            ),
            grossMargin: safeNumber(
              safeGet(analysisResult, 'analysis.profit_and_loss.profitability_metrics.margins.gross_margin')
            ),
            netMargin: safeNumber(
              safeGet(analysisResult, 'analysis.profit_and_loss.profitability_metrics.margins.net_margin')
            ),
            totalAssets: safeNumber(
              safeGet(analysisResult, 'analysis.balance_sheet.assets.total_assets')
            ),
            totalLiabilities: safeNumber(
              safeGet(analysisResult, 'analysis.balance_sheet.liabilities.total_liabilities')
            ),
            totalEquity: safeNumber(
              safeGet(analysisResult, 'analysis.balance_sheet.equity.total_equity')
            ),
            cashFlowFromOperations: safeNumber(
              safeGet(analysisResult, 'analysis.cash_flow_analysis.operating_activities.net_cash_from_operations')
            ),
            cashFlowFromInvesting: safeNumber(
              safeGet(analysisResult, 'analysis.cash_flow_analysis.investing_activities.net_investing_cash_flow')
            ),
            cashFlowFromFinancing: safeNumber(
              safeGet(analysisResult, 'analysis.cash_flow_analysis.financing_activities.net_financing_cash_flow')
            ),
            netCashFlow: safeNumber(
              safeGet(analysisResult, 'analysis.cash_flow_analysis.cash_position.net_change_in_cash')
            ),
            arDays: safeNumber(
              safeGet(analysisResult, 'analysis.working_capital_management.cash_conversion_cycle.days_sales_outstanding')
            ),
            apDays: safeNumber(
              safeGet(analysisResult, 'analysis.working_capital_management.cash_conversion_cycle.days_payable_outstanding')
            ),
            ebitda: safeNumber(
              safeGet(analysisResult, 'analysis.profit_and_loss.profitability_metrics.ebitda')
            ),
            currentRatio: safeNumber(
              safeGet(analysisResult, 'analysis.financial_ratios.liquidity_ratios.current_ratio')
            ),
            quickRatio: safeNumber(
              safeGet(analysisResult, 'analysis.financial_ratios.liquidity_ratios.quick_ratio')
            ),
            debtToEquityRatio: safeNumber(
              safeGet(analysisResult, 'analysis.financial_ratios.leverage_ratios.debt_to_equity')
            ),
          },
          // Transform insights from key_insights_summary with null safety
          insights: safeArray(
            safeGet(analysisResult, 'analysis.key_insights_summary', [])
          ).map((insight: any, index: number) => ({
            type: (index % 4 === 0
              ? "trend"
              : index % 4 === 1
                ? "anomaly"
                : index % 4 === 2
                  ? "recommendation"
                  : "summary") as "trend" | "anomaly" | "recommendation" | "summary",
            title: `Insight ${index + 1}`,
            description: safeString(insight, 'No insight available'),
            severity: (index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low") as "high" | "medium" | "low",
            impact: "Impacts financial performance and decision-making",
            suggestion: index % 2 === 0
              ? "Review this area for potential optimization"
              : undefined,
          })),
          // Generate trends data from available metrics with null safety
          trends: {
            revenue: [safeNumber(safeGet(analysisResult, 'analysis.profit_and_loss.revenue_analysis.total_revenue'), 0)],
            expenses: [safeNumber(safeGet(analysisResult, 'analysis.profit_and_loss.cost_structure.total_expenses'), 0)],
            profit: [safeNumber(safeGet(analysisResult, 'analysis.profit_and_loss.profitability_metrics.net_income'), 0)],
            months: ["Current"],
          },
          // Create empty top accounts since we don't have them in the same format
          topAccounts: {
            revenue: [],
            expenses: [],
            assets: [],
            liabilities: [],
          },
          reportInfo: {
            latestReport: {
              id: "1",
              fileName: safeString(analysisResult?.file_info?.filename, 'Unknown File'),
              reportType: "PROFIT_LOSS",
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              uploadDate: new Date().toISOString(),
              totalRecords: safeArray(
                safeGet(analysisResult, 'analysis.key_insights_summary', [])
              ).length,
            },
            totalReports: 1,
            totalRecords: safeArray(
              safeGet(analysisResult, 'analysis.key_insights_summary', [])
            ).length,
          },
        };

        setAnalyticsData(transformedData);
      } else if (analysisResult?.success && analysisResult?.data) {
        // Backward compatibility with old format
        setAnalyticsData(analysisResult.data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching analytics data");
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  useEffect(() => {
    // Only fetch if we have valid selection or if it's the initial load
    if (selectedBranchId !== null || selectedAnalysisId !== null || analyticsData === null) {
      fetchAnalyticsData();
    }
  }, [selectedBranchId, selectedAnalysisId]); // Re-fetch when selection changes

  const handleSelectionChange = (branchId: string | null, analysisId: string | null) => {
    // Validate inputs and prevent unnecessary re-renders if values haven't changed
    const safeBranchId = branchId && typeof branchId === 'string' ? branchId : null;
    const safeAnalysisId = analysisId && typeof analysisId === 'string' ? analysisId : null;

    if (selectedBranchId !== safeBranchId || selectedAnalysisId !== safeAnalysisId) {
      console.log('Analytics: Selection changed:', { branchId: safeBranchId, analysisId: safeAnalysisId });
      setSelectedBranchId(safeBranchId);
      setSelectedAnalysisId(safeAnalysisId);
      // Clear any previous errors when selection changes
      setError(null);
    }
  };

  const getSeverityColor = (severity: string | null | undefined) => {
    const safeSeverity = safeString(severity).toLowerCase();
    switch (safeSeverity) {
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

  const getInsightIcon = (type: string | null | undefined) => {
    const safeType = safeString(type).toLowerCase();
    switch (safeType) {
      case "trend":
        return <TrendingUp className="h-4 w-4" />;
      case "anomaly":
        return <AlertTriangle className="h-4 w-4" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />;
      case "summary":
        return <Eye className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = safeNumber(amount, 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const formatPercentage = (value: number | null | undefined) => {
    const safeValue = safeNumber(value, 0);
    return `${safeValue.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-3 sm:p-4 pb-2">
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-48 sm:h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-48 sm:h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            No Analytics Data Available
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Upload your first financial report to see detailed analytics and
            insights.
          </p>
          <Button className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, insights, trends, topAccounts, reportInfo } = analyticsData;

  // Prepare data for charts with null safety
  const trendData = safeArray(trends?.months).map((month, index) => ({
    month: safeString(month, `Period ${index + 1}`),
    revenue: safeNumber(safeArray(trends?.revenue)[index], 0),
    expenses: safeNumber(safeArray(trends?.expenses)[index], 0),
    profit: safeNumber(safeArray(trends?.profit)[index], 0),
  }));

  const pieChartData = [
    { name: "Revenue", value: safeNumber(metrics?.totalRevenue, 0), color: "#10b981" },
    { name: "Expenses", value: safeNumber(metrics?.totalExpenses, 0), color: "#ef4444" },
    { name: "Assets", value: safeNumber(metrics?.totalAssets, 0), color: "#3b82f6" },
    {
      name: "Liabilities",
      value: safeNumber(metrics?.totalLiabilities, 0),
      color: "#f59e0b",
    },
  ].filter((item) => safeNumber(item?.value, 0) > 0);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Branch & Upload Selector */}
      <BranchUploadSelector
        onSelectionChange={handleSelectionChange}
        title="Select Analytics Data Source"
        description="Choose a branch and financial analysis to view detailed analytics"
        showAllBranchesOption={true}
      />

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Financial Analytics
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Deep dive into your financial performance with AI-powered insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={refreshAnalytics}
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
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-600 mb-2 truncate">
              {formatCurrency(safeNumber(metrics?.totalRevenue, 0))}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Revenue Growth
            </p>
            <p className="text-xs text-emerald-600 font-medium">
              Gross Margin: {formatPercentage(safeNumber(metrics?.grossMargin, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-red-600 mb-2 truncate">
              {formatCurrency(safeNumber(metrics?.totalExpenses, 0))}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Expense Ratio
            </p>
            <p className="text-xs text-red-600 font-medium">
              Net Margin: {formatPercentage(safeNumber(metrics?.netMargin, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </div>
            <div
              className={`text-lg sm:text-2xl font-bold mb-2 truncate ${
                safeNumber(metrics?.netProfit, 0) >= 0
                ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(safeNumber(metrics?.netProfit, 0))}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Profitability
            </p>
            <p className="text-xs text-blue-600 font-medium">
              {safeNumber(metrics?.netProfit, 0) >= 0 ? "Positive" : "Negative"} Net Income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-2 truncate">
              {safeNumber(metrics?.currentRatio, 0) > 0 ? safeNumber(metrics?.currentRatio, 0).toFixed(2) : "N/A"}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Financial Health
            </p>
            <p className="text-xs text-purple-600 font-medium">Current Ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Trend Analysis */}
        <Card>
          <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Financial Trends Analysis</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Revenue, expenses, and profit trends over time
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={50} />
                  <Tooltip
                    formatter={(value) => formatCurrency(safeNumber(value, 0))}
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
            </div>
          </CardContent>
        </Card>

        {/* Composition Analysis */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Financial Composition</CardTitle>
                <CardDescription>
                  Breakdown of key financial components
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${safeString(name, 'Unknown')} ${(safeNumber(percent, 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {safeArray(pieChartData).map((entry, index) => {
                      if (!entry) return null;
                      return (
                        <Cell key={`cell-${index}`} fill={safeString(entry?.color, '#8884d8')} />
                      );
                    }).filter(Boolean)}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(safeNumber(value, 0))}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Cash Flow Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Operating Cash Flow
              </span>
              <Badge
                variant={
                  safeNumber(metrics?.cashFlowFromOperations, 0) >= 0
                    ? "default"
                    : "destructive"
                }
              >
                {formatCurrency(safeNumber(metrics?.cashFlowFromOperations, 0))}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Investing Cash Flow
              </span>
              <Badge
                variant={
                  safeNumber(metrics?.cashFlowFromInvesting, 0) >= 0
                    ? "default"
                    : "destructive"
                }
              >
                {formatCurrency(safeNumber(metrics?.cashFlowFromInvesting, 0))}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Net Cash Flow
              </span>
              <Badge
                variant={safeNumber(metrics?.netCashFlow, 0) >= 0 ? "default" : "destructive"}
              >
                {formatCurrency(safeNumber(metrics?.netCashFlow, 0))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Ratios */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Financial Ratios</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Current Ratio
              </span>
              <Badge
                variant={safeNumber(metrics?.currentRatio, 0) > 1 ? "default" : "destructive"}
              >
                {safeNumber(metrics?.currentRatio, 0) > 0 ? safeNumber(metrics?.currentRatio, 0).toFixed(2) : "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Debt/Equity
              </span>
              <Badge
                variant={
                  safeNumber(metrics?.debtToEquityRatio, 0) < 1 ? "default" : "destructive"
                }
              >
                {safeNumber(metrics?.debtToEquityRatio, 0) > 0 ? safeNumber(metrics?.debtToEquityRatio, 0).toFixed(2) : "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Quick Ratio
              </span>
              <Badge
                variant={safeNumber(metrics?.quickRatio, 0) > 1 ? "default" : "destructive"}
              >
                {safeNumber(metrics?.quickRatio, 0) > 0 ? safeNumber(metrics?.quickRatio, 0).toFixed(2) : "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                EBITDA
              </span>
              <Badge variant="default">
                {formatCurrency(safeNumber(metrics?.ebitda, 0))}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                AR Days
              </span>
              <Badge
                variant={safeNumber(metrics?.arDays, 0) < 30 && safeNumber(metrics?.arDays, 0) > 0 ? "default" : "destructive"}
              >
                {safeNumber(metrics?.arDays, 0) > 0 ? safeNumber(metrics?.arDays, 0) : "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                AP Days
              </span>
              <Badge
                variant={safeNumber(metrics?.apDays, 0) < 45 && safeNumber(metrics?.apDays, 0) > 0 ? "default" : "destructive"}
              >
                {safeNumber(metrics?.apDays, 0) > 0 ? safeNumber(metrics?.apDays, 0) : "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg">AI-Powered Financial Insights</CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations based on your financial data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeArray(insights).map((insight, index) => {
              if (!insight) return null;
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getInsightIcon(insight?.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {safeString(insight?.title, 'Unknown Insight')}
                        </h4>
                        <Badge variant={getSeverityColor(insight?.severity)}>
                          {safeString(insight?.severity, 'unknown')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                        {safeString(insight?.description, 'No description available')}
                      </p>
                      <p className="text-sm font-medium mb-2 line-clamp-2">
                        <span className="text-blue-600">Impact:</span>{" "}
                        {safeString(insight?.impact, 'Impact not specified')}
                      </p>
                      {insight?.suggestion && (
                        <p className="text-sm line-clamp-2">
                          <span className="text-emerald-600 font-medium">
                            Suggestion:
                          </span>{" "}
                          {safeString(insight.suggestion, 'No suggestion available')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </CardContent>
      </Card>

      {/* Top Accounts Analysis */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Account Analysis</CardTitle>
          <CardDescription>Top performing accounts by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-2">
              {topAccounts.revenue.map((account, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(Number(account.amount))}
                  </span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-2">
              {topAccounts.expenses.map((account, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(Number(account.amount))}
                  </span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="assets" className="space-y-2">
              {topAccounts.assets.map((account, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                  <span className="text-blue-600 font-semibold">
                    {formatCurrency(Number(account.amount))}
                  </span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="liabilities" className="space-y-2">
              {topAccounts.liabilities.map((account, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium">{account.accountName}</span>
                  </div>
                  <span className="text-orange-600 font-semibold">
                    {formatCurrency(Number(account.amount))}
                  </span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card> */}

      {/* Action Buttons */}
      {/* <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline" size="lg">
          <Share2 className="h-4 w-4 mr-2" />
          Share Analysis
        </Button>
        <Button size="lg">
          <Target className="h-4 w-4 mr-2" />
          Set Goals
        </Button>
      </div> */}
    </div>
  );
}

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the latest financial analysis using the new unified endpoint
      const analysisResponse = await fetch(
        "/api/financial-analysis?latest=true"
      );
      let analysisData = null;
      let analysisHistory = [];

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        // Direct response without success wrapper
        if (analysisResult.file_info && analysisResult.analysis) {
          analysisData = analysisResult;
        } else if (analysisResult.success && analysisResult.data) {
          // Backward compatibility with wrapped response
          analysisData = analysisResult.data;
        }

        // Also fetch analysis history if available using the unified endpoint
        try {
          const historyResponse = await fetch(
            "/api/financial-analysis?all=true"
          );
          if (historyResponse.ok) {
            const historyResult = await historyResponse.json();
            if (Array.isArray(historyResult)) {
              // Direct array response from the all=true parameter
              analysisHistory = historyResult;
            } else if (historyResult.data) {
              // Handle wrapped data response
              analysisHistory = historyResult.data;
            }
          }
        } catch (historyError) {
          console.error("Error fetching history:", historyError);
          // Non-critical, can continue without history
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
              analysisData.analysis.profit_and_loss.revenue_analysis
                ?.total_revenue || 0,
            totalExpenses:
              analysisData.analysis.profit_and_loss.cost_structure
                ?.total_expenses || 0,
            netProfit:
              analysisData.analysis.profit_and_loss.profitability_metrics
                ?.net_income || 0,
            grossMargin:
              analysisData.analysis.profit_and_loss.profitability_metrics
                ?.margins?.gross_margin || 0,
            netMargin:
              analysisData.analysis.profit_and_loss.profitability_metrics
                ?.margins?.net_margin || 0,
            totalAssets:
              analysisData.analysis.balance_sheet?.assets?.total_assets || 0,
            totalLiabilities:
              analysisData.analysis.balance_sheet?.liabilities
                ?.total_liabilities || 0,
            totalEquity:
              analysisData.analysis.balance_sheet?.equity?.total_equity || 0,
            cashFlowOperating:
              analysisData.analysis.cash_flow_analysis?.operating_activities
                ?.net_cash_from_operations || 0,
            cashFlowInvesting:
              analysisData.analysis.cash_flow_analysis?.investing_activities
                ?.net_investing_cash_flow || 0,
            cashFlowFinancing:
              analysisData.analysis.cash_flow_analysis?.financing_activities
                ?.net_financing_cash_flow || 0,
            netCashFlow:
              analysisData.analysis.cash_flow_analysis?.cash_position
                ?.net_change_in_cash || 0,
          },
          accounts: [],
          insights:
            analysisData.analysis.key_insights_summary?.map(
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
              fileName: analysisData.file_info?.filename || "Budget_March.xlsx",
              reportType: "PROFIT_LOSS",
              totalRecords:
                analysisData.analysis.key_insights_summary?.length || 0,
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
  }, []);

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
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
            Upload your first financial document to see AI-powered insights and analytics.
          </p>
          <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <a href="/upload">Upload Document</a>
          </Button>
        </div>
      </div>
    );
  }

  // Check if we have comprehensive analysis data
  if (dashboardData.analysisData) {
    return (
      <div className="space-y-6">
        {/* Render the comprehensive financial dashboard without duplicate header */}
        <ComprehensiveFinancialDashboard
          analysisData={dashboardData.analysisData}
        />
      </div>
    );
  }

  // Legacy dashboard rendering
  const { summary, insights, trends, accounts, reportInfo, topAccounts } =
    dashboardData;

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
  const chartData = trends.months.map((month: string, index: number) => ({
    month,
    revenue: trends.revenue[index] || 0,
    expenses: trends.expenses[index] || 0,
    profit: trends.profit[index] || 0,
  }));

  // Prepare pie chart data for expense breakdown
  const expenseBreakdown = accounts
    .filter((account) => account.category === "EXPENSE")
    .slice(0, 5)
    .map((account, index) => ({
      name: account.name,
      value: Math.abs(account.amount || 0),
      color: ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"][index % 5],
    }));

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Financial Dashboard
                </h1>
                <p className="text-gray-600 mt-1">AI-powered insights and analytics for your financial data</p>
              </div>
            </div>
            <Button 
              onClick={refreshDashboard} 
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Report Info */}
      {reportInfo && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Latest Report Analysis</h3>
                <p className="text-sm text-gray-600">AI-powered financial insights</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div
                  className="text-lg font-bold text-blue-600 truncate"
                  title={reportInfo.latestReport.fileName}
                >
                  {reportInfo.latestReport.fileName}
                </div>
                <div className="text-sm text-gray-600">File Name</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">
                  {reportInfo.latestReport.reportType.replace("_", " ")}
                </div>
                <div className="text-sm text-gray-600">Report Type</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-lg font-bold text-purple-600">
                  {reportInfo.latestReport.totalRecords}
                </div>
                <div className="text-sm text-gray-600">Records Parsed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-lg font-bold text-orange-600">
                  {reportInfo.totalReports}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            {summary.grossMargin && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                Gross Margin: {formatPercentage(summary.grossMargin)}
              </p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.abs(summary.totalExpenses || 0))}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
            {summary.netMargin && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                Net Margin: {formatPercentage(summary.netMargin)}
              </p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div
              className={`text-2xl font-bold ${
                (summary.netProfit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(summary.netProfit || 0)}
            </div>
            <div className="text-sm text-gray-600">Net Profit</div>
            <p className="text-xs text-gray-500 mt-1">
              {(summary.netProfit || 0) >= 0 ? "Profit" : "Loss"}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.totalAssets || 0)}
            </div>
            <div className="text-sm text-gray-600">Total Assets</div>
            {summary.topAccounts && (
              <p className="text-xs text-purple-600 mt-1 font-medium">
                {summary.topAccounts.length} Accounts
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trends Chart */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Financial Trends</h3>
                  <p className="text-sm text-gray-600">Revenue, expenses, and profit over time</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Expense Breakdown</h3>
                  <p className="text-sm text-gray-600">Top expense categories by amount</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
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
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Top Accounts with Tabs */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Accounts by Category</h3>
                <p className="text-sm text-gray-600">Highest value accounts in each financial category</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 rounded-md transition-all duration-200">
                  Revenue
                </TabsTrigger>
                <TabsTrigger value="expenses" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 rounded-md transition-all duration-200">
                  Expenses
                </TabsTrigger>
                <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 rounded-md transition-all duration-200">
                  Assets
                </TabsTrigger>
                <TabsTrigger value="liabilities" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 rounded-md transition-all duration-200">
                  Liabilities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-2 mt-4">
                {topAccounts.revenue.map((account: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-800">{account.accountName}</span>
                    </div>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(Number(account.amount))}
                    </span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="expenses" className="space-y-2 mt-4">
                {topAccounts.expenses.map((account: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-800">{account.accountName}</span>
                    </div>
                    <span className="text-red-600 font-semibold">
                      {formatCurrency(Number(account.amount))}
                    </span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="assets" className="space-y-2 mt-4">
                {topAccounts.assets.map((account: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-800">{account.accountName}</span>
                    </div>
                    <span className="text-blue-600 font-semibold">
                      {formatCurrency(Number(account.amount))}
                    </span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="liabilities" className="space-y-2 mt-4">
                {topAccounts.liabilities.map((account: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-800">{account.accountName}</span>
                    </div>
                    <span className="text-orange-600 font-semibold">
                      {formatCurrency(Number(account.amount))}
                    </span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Enhanced AI Insights with Filtering */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 opacity-10 rounded-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-yellow-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI-Powered Insights</h3>
                <p className="text-sm text-gray-600">Intelligent analysis of your financial data with actionable recommendations</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedInsightType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedInsightType("all")}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
              >
                All ({insights.length})
              </Button>
              <Button
                variant={selectedInsightType === "trend" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedInsightType("trend")}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
              >
                Trends ({insights.filter((i) => i.type === "trend").length})
              </Button>
              <Button
                variant={
                  selectedInsightType === "anomaly" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedInsightType("anomaly")}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
              >
                Anomalies ({insights.filter((i) => i.type === "anomaly").length})
              </Button>
              <Button
                variant={
                  selectedInsightType === "recommendation" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedInsightType("recommendation")}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
              >
                Recommendations (
                {insights.filter((i) => i.type === "recommendation").length})
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <Badge variant={getSeverityColor(insight.severity)}>
                          {insight.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {insight.description}
                      </p>
                      <p className="text-sm font-medium mb-2">
                        <span className="text-blue-600">Impact:</span>{" "}
                        {insight.impact}
                      </p>
                      {insight.suggestion && (
                        <p className="text-sm">
                          <span className="text-green-600 font-medium">
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
          </div>
        </div>
      </div>

      {/* Enhanced Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cash Flow Analysis</h3>
                  <p className="text-sm text-gray-600">Operating, investing & financing activities</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Operations:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span
                    className={`font-semibold ${
                      (summary.cashFlowOperating || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(summary.cashFlowOperating || 0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Investing:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span
                    className={`font-semibold ${
                      (summary.cashFlowInvesting || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(summary.cashFlowInvesting || 0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-100 rounded-xl border border-blue-200">
                <span className="text-sm font-bold text-gray-800">Net Cash Flow:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  <span
                    className={`font-bold text-lg ${
                      (summary.netCashFlow || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(summary.netCashFlow || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Financial Ratios</h3>
                  <p className="text-sm text-gray-600">Key performance indicators</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Current Ratio:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-600">
                    {extendedSummary.currentRatio?.toFixed(2) || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Debt/Equity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-semibold text-emerald-600">
                    {extendedSummary.debtToEquityRatio?.toFixed(2) || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-xl border border-green-200">
                <span className="text-sm font-bold text-gray-800">Quick Ratio:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg text-green-600">
                    {extendedSummary.quickRatio?.toFixed(2) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Key Performance Indicators</h3>
                  <p className="text-sm text-gray-600">Business health metrics</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">EBITDA:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(extendedSummary.ebitda || 0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">AR Days:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="font-semibold text-pink-600">
                    {extendedSummary.arDays || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-100 rounded-xl border border-purple-200">
                <span className="text-sm font-bold text-gray-800">AP Days:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg text-purple-600">
                    {extendedSummary.apDays || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

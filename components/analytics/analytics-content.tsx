"use client";

import { useState, useEffect } from "react";
import { useActiveFile } from "@/components/contexts/active-file-context";
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
  const { activeFileData, activeFile } = useActiveFile();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedReportType, setSelectedReportType] = useState("all");

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use active file data if available, otherwise fetch latest
      let analysisResult;
      if (activeFileData) {
        analysisResult = activeFileData;
      } else {
        const response = await fetch("/api/financial-analysis?latest=true");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        analysisResult = await response.json();
      }

      // Check if we have the Flask backend format (file_info and analysis structure)
      if (
        analysisResult &&
        analysisResult.file_info &&
        analysisResult.analysis
      ) {
        // Transform the Flask backend data into the format expected by the analytics component
        const transformedData: AnalyticsData = {
          metrics: {
            totalRevenue:
              analysisResult.analysis.profit_and_loss.revenue_analysis
                ?.total_revenue || 0,
            totalExpenses:
              analysisResult.analysis.profit_and_loss.cost_structure
                ?.total_expenses || 0,
            netProfit:
              analysisResult.analysis.profit_and_loss.profitability_metrics
                ?.net_income || 0,
            grossMargin:
              analysisResult.analysis.profit_and_loss.profitability_metrics
                ?.margins?.gross_margin || 0,
            netMargin:
              analysisResult.analysis.profit_and_loss.profitability_metrics
                ?.margins?.net_margin || 0,
            totalAssets:
              analysisResult.analysis.balance_sheet?.assets?.total_assets || 0,
            totalLiabilities:
              analysisResult.analysis.balance_sheet?.liabilities
                ?.total_liabilities || 0,
            totalEquity:
              analysisResult.analysis.balance_sheet?.equity?.total_equity || 0,
            cashFlowFromOperations:
              analysisResult.analysis.cash_flow_analysis?.operating_activities
                ?.net_cash_from_operations || 0,
            cashFlowFromInvesting:
              analysisResult.analysis.cash_flow_analysis?.investing_activities
                ?.net_investing_cash_flow || 0,
            cashFlowFromFinancing:
              analysisResult.analysis.cash_flow_analysis?.financing_activities
                ?.net_financing_cash_flow || 0,
            netCashFlow:
              analysisResult.analysis.cash_flow_analysis?.cash_position
                ?.net_change_in_cash || 0,
            arDays:
              analysisResult.analysis.working_capital_management
                ?.cash_conversion_cycle?.days_sales_outstanding || 0,
            apDays:
              analysisResult.analysis.working_capital_management
                ?.cash_conversion_cycle?.days_payable_outstanding || 0,
            ebitda:
              analysisResult.analysis.profit_and_loss.profitability_metrics
                ?.ebitda || 0,
            currentRatio:
              analysisResult.analysis.financial_ratios?.liquidity_ratios
                ?.current_ratio || 0,
            quickRatio:
              analysisResult.analysis.financial_ratios?.liquidity_ratios
                ?.quick_ratio || 0,
            debtToEquityRatio:
              analysisResult.analysis.financial_ratios?.leverage_ratios
                ?.debt_to_equity || 0,
          },
          // Transform insights from key_insights_summary
          insights:
            analysisResult.analysis.key_insights_summary?.map(
              (insight: string, index: number) => ({
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
                impact: "Impacts financial performance and decision-making",
                suggestion:
                  index % 2 === 0
                    ? "Review this area for potential optimization"
                    : undefined,
              })
            ) || [],
          // Mock trends data since it's not provided in the same structure
          trends: {
            revenue: [213200],
            expenses: [342360],
            profit: [-234160],
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
              fileName: analysisResult.file_info.filename,
              reportType: "PROFIT_LOSS",
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              uploadDate: new Date().toISOString(),
              totalRecords:
                analysisResult.analysis.key_insights_summary?.length || 0,
            },
            totalReports: 1,
            totalRecords:
              analysisResult.analysis.key_insights_summary?.length || 0,
          },
        };

        setAnalyticsData(transformedData);
      } else if (analysisResult.success && analysisResult.data) {
        // Backward compatibility with old format
        setAnalyticsData(analysisResult.data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
    fetchAnalyticsData();
  }, [activeFileData]); // Re-fetch when active file changes

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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
      <div className="p-6 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No Analytics Data Available
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload your first financial report to see detailed analytics and
            insights.
          </p>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, insights, trends, topAccounts, reportInfo } = analyticsData;

  // Prepare data for charts
  const trendData = trends.months.map((month, index) => ({
    month,
    revenue: trends.revenue[index] || 0,
    expenses: trends.expenses[index] || 0,
    profit: trends.profit[index] || 0,
  }));

  const pieChartData = [
    { name: "Revenue", value: metrics.totalRevenue || 0, color: "#10b981" },
    { name: "Expenses", value: metrics.totalExpenses || 0, color: "#ef4444" },
    { name: "Assets", value: metrics.totalAssets || 0, color: "#3b82f6" },
    {
      name: "Liabilities",
      value: metrics.totalLiabilities || 0,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Financial Analytics
              </h1>
              <p className="text-sm text-gray-600 mt-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-2">
              {formatCurrency(metrics.totalRevenue || 0)}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Revenue Growth
            </p>
            <p className="text-xs text-emerald-600 font-medium">
              Gross Margin: {formatPercentage(metrics.grossMargin || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {formatCurrency(metrics.totalExpenses || 0)}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Expense Ratio
            </p>
            <p className="text-xs text-red-600 font-medium">
              Net Margin: {formatPercentage(metrics.netMargin || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div
              className={`text-2xl font-bold mb-2 ${
                (metrics.netProfit || 0) >= 0
                ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(metrics.netProfit || 0)}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Profitability
            </p>
            <p className="text-xs text-blue-600 font-medium">
              {(metrics.netProfit || 0) >= 0 ? "Positive" : "Negative"} Net Income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {metrics.currentRatio?.toFixed(2) || "N/A"}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Financial Health
            </p>
            <p className="text-xs text-purple-600 font-medium">Current Ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Financial Trends Analysis</CardTitle>
                <CardDescription>
                  Revenue, expenses, and profit trends over time
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={60} />
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
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
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
                  metrics.cashFlowFromOperations >= 0
                    ? "default"
                    : "destructive"
                }
              >
                {formatCurrency(metrics.cashFlowFromOperations || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Investing Cash Flow
              </span>
              <Badge
                variant={
                  metrics.cashFlowFromInvesting >= 0
                    ? "default"
                    : "destructive"
                }
              >
                {formatCurrency(metrics.cashFlowFromInvesting || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Net Cash Flow
              </span>
              <Badge
                variant={metrics.netCashFlow >= 0 ? "default" : "destructive"}
              >
                {formatCurrency(metrics.netCashFlow || 0)}
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
                variant={metrics.currentRatio > 1 ? "default" : "destructive"}
              >
                {metrics.currentRatio?.toFixed(2) || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Debt/Equity
              </span>
              <Badge
                variant={
                  metrics.debtToEquityRatio < 1 ? "default" : "destructive"
                }
              >
                {metrics.debtToEquityRatio?.toFixed(2) || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Quick Ratio
              </span>
              <Badge
                variant={metrics.quickRatio > 1 ? "default" : "destructive"}
              >
                {metrics.quickRatio?.toFixed(2) || "N/A"}
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
                {formatCurrency(metrics.ebitda || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                AR Days
              </span>
              <Badge
                variant={metrics.arDays < 30 ? "default" : "destructive"}
              >
                {metrics.arDays || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                AP Days
              </span>
              <Badge
                variant={metrics.apDays < 45 ? "default" : "destructive"}
              >
                {metrics.apDays || "N/A"}
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
            {insights.map((insight, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {insight.title}
                      </h4>
                      <Badge variant={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                      {insight.description}
                    </p>
                    <p className="text-sm font-medium mb-2 line-clamp-2">
                      <span className="text-blue-600">Impact:</span>{" "}
                      {insight.impact}
                    </p>
                    {insight.suggestion && (
                      <p className="text-sm line-clamp-2">
                        <span className="text-emerald-600 font-medium">
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

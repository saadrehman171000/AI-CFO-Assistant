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

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new unified API endpoint with latest=true parameter
      const response = await fetch("/api/financial-analysis?latest=true");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const analysisResult = await response.json();

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
      <div className="space-y-6 p-10">
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
      <div className="p-10">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-red-50/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-200">
            <Alert variant="destructive" className="bg-transparent border-0 p-0">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-10 text-center">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-blue-200">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                No Analytics Data Available
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Upload your first financial report to see detailed analytics and insights.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload Report
              </Button>
            </div>
          </div>
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
    <div className="space-y-6 p-10">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Analytics
                </h1>
                <p className="text-gray-600">
                  Deep dive into your financial performance with AI-powered insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={refreshAnalytics} 
                disabled={refreshing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatCurrency(metrics.totalRevenue || 0)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Revenue Growth</p>
            <p className="text-xs text-green-600 font-medium">
              Gross Margin: {formatPercentage(metrics.grossMargin || 0)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {formatCurrency(metrics.totalExpenses || 0)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Expense Ratio</p>
            <p className="text-xs text-red-600 font-medium">
              Net Margin: {formatPercentage(metrics.netMargin || 0)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div
              className={`text-2xl font-bold mb-2 ${
                (metrics.netProfit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(metrics.netProfit || 0)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Profitability</p>
            <p className="text-xs text-blue-600 font-medium">
              {(metrics.netProfit || 0) >= 0 ? "Positive" : "Negative"} Net Income
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {metrics.currentRatio?.toFixed(2) || "N/A"}
            </div>
            <p className="text-sm text-gray-600 mb-1">Financial Health</p>
            <p className="text-xs text-purple-600 font-medium">Current Ratio</p>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Trend Analysis */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Financial Trends Analysis</h3>
                  <p className="text-sm text-gray-600">Revenue, expenses, and profit trends over time</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
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

        {/* Enhanced Composition Analysis */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Financial Composition</h3>
                  <p className="text-sm text-gray-600">Breakdown of key financial components</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
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

      {/* Enhanced Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Cash Flow Analysis */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cash Flow Analysis</h3>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Operating Cash Flow</span>
                <Badge
                  variant={
                    metrics.cashFlowFromOperations >= 0
                      ? "default"
                      : "destructive"
                  }
                  className="bg-white border border-blue-200 text-blue-700"
                >
                  {formatCurrency(metrics.cashFlowFromOperations || 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Investing Cash Flow</span>
                <Badge
                  variant={
                    metrics.cashFlowFromInvesting >= 0 ? "default" : "destructive"
                  }
                  className="bg-white border border-blue-200 text-blue-700"
                >
                  {formatCurrency(metrics.cashFlowFromInvesting || 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Net Cash Flow</span>
                <Badge
                  variant={metrics.netCashFlow >= 0 ? "default" : "destructive"}
                  className="bg-white border border-blue-200 text-blue-700"
                >
                  {formatCurrency(metrics.netCashFlow || 0)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Financial Ratios */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Financial Ratios</h3>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Current Ratio</span>
                <Badge
                  variant={metrics.currentRatio > 1 ? "default" : "destructive"}
                  className="bg-white border border-green-200 text-green-700"
                >
                  {metrics.currentRatio?.toFixed(2) || "N/A"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Debt/Equity</span>
                <Badge
                  variant={
                    metrics.debtToEquityRatio < 1 ? "default" : "destructive"
                  }
                  className="bg-white border border-green-200 text-green-700"
                >
                  {metrics.debtToEquityRatio?.toFixed(2) || "N/A"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Quick Ratio</span>
                <Badge
                  variant={metrics.quickRatio > 1 ? "default" : "destructive"}
                  className="bg-white border border-green-200 text-green-700"
                >
                  {metrics.quickRatio?.toFixed(2) || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Metrics */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200 hover:shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-orange-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">EBITDA</span>
                <Badge variant="default" className="bg-white border border-orange-200 text-orange-700">
                  {formatCurrency(metrics.ebitda || 0)}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">AR Days</span>
                <Badge variant={metrics.arDays < 30 ? "default" : "destructive"} className="bg-white border border-orange-200 text-orange-700">
                  {metrics.arDays || "N/A"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">AP Days</span>
                <Badge variant={metrics.apDays < 45 ? "default" : "destructive"} className="bg-white border border-orange-200 text-orange-700">
                  {metrics.apDays || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Insights */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 opacity-10 rounded-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200 hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-yellow-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI-Powered Financial Insights</h3>
                <p className="text-sm text-gray-600">Intelligent analysis and recommendations based on your financial data</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl border border-yellow-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-orange-50 opacity-50"></div>
                  <div className="relative p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <Badge 
                            variant={getSeverityColor(insight.severity)}
                            className="bg-white border border-yellow-200 text-yellow-700"
                          >
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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

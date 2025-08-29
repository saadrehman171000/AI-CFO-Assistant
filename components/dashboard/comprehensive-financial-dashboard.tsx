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
import { Progress } from "@/components/ui/progress";
import BranchUploadSelector from "@/components/company/branch-upload-selector";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  FileText,
  Calendar,
  Users,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Eye,
  Calendar as CalendarIcon,
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

interface FinancialAnalysisData {
  file_info: {
    filename: string;
    file_type: string;
    file_size_mb: number;
  };
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
    strategic_recommendations: {
      immediate_actions_0_30_days: any[];
      short_term_improvements_1_6_months: any[];
      long_term_strategic_initiatives_6_24_months: any[];
      growth_opportunities: any[];
      risk_mitigation_strategies: any[];
    };
    executive_dashboard_kpis: any;
    key_insights_summary: string[];
  };
}

interface ComprehensiveFinancialDashboardProps {
  analysisData?: FinancialAnalysisData;
  showSelector?: boolean;
  selectedBranchId?: string | null;
  selectedAnalysisId?: string | null;
  onSelectionChange?: (branchId: string | null, analysisId: string | null) => void;
}

export default function ComprehensiveFinancialDashboard({
  analysisData,
  showSelector = false,
  selectedBranchId,
  selectedAnalysisId,
  onSelectionChange,
}: ComprehensiveFinancialDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Use analysisData directly from props
  const currentAnalysisData = analysisData;

  // Fix for nested analysis data structure - normalize it
  // TypeScript fix: use type assertion to handle nested analysis structure
  const analysis = (currentAnalysisData?.analysis as any)?.analysis || currentAnalysisData?.analysis;
  
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

  // Helper function to safely check if an array exists and has items
  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) ? arr : [];
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

  // Component state for selections (additional to props)
  const [internalSelectedBranchId, setInternalSelectedBranchId] = useState<string | null>(selectedBranchId || null);
  const [internalSelectedAnalysisId, setInternalSelectedAnalysisId] = useState<string | null>(selectedAnalysisId || null);
  
  // Keep internal state in sync with props
  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setInternalSelectedBranchId(selectedBranchId);
    }
    if (selectedAnalysisId !== undefined) {
      setInternalSelectedAnalysisId(selectedAnalysisId);
    }
  }, [selectedBranchId, selectedAnalysisId]);
  
  const handleSelectionChange = (branchId: string | null, analysisId: string | null) => {
    // Update internal state first
    setInternalSelectedBranchId(branchId);
    setInternalSelectedAnalysisId(analysisId);
    
    // Use the parent's onSelectionChange if provided
    if (onSelectionChange) {
      onSelectionChange(branchId, analysisId);
    }
  };

  // Add error handling for potentially missing data
  if (!currentAnalysisData && !showSelector) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-10 w-10 text-blue-600" />
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Financial Dashboard
            </h3>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Upload your financial documents to view comprehensive analysis, insights, and interactive dashboards.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <a href="/upload">
                <FileText className="w-5 h-5 mr-2" />
                Upload Financial Data
              </a>
            </Button>

            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-100 rounded-full mx-auto mb-2"></div>
                Excel & CSV
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-100 rounded-full mx-auto mb-2"></div>
                PDF Reports
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-100 rounded-full mx-auto mb-2"></div>
                AI Analysis
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    const safeValue = safeNumber(value);
    if (safeValue === 0 && value == null) return "N/A";
    return `${(safeValue * 100).toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number | null | undefined) => {
    const safeScore = safeNumber(score, 0);
    if (safeScore >= 80) return "text-green-600 bg-green-100";
    if (safeScore >= 60) return "text-yellow-600 bg-yellow-100";
    if (safeScore >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getSeverityColor = (severity: string | null | undefined) => {
    const safeSeverity = safeString(severity).toLowerCase();
    switch (safeSeverity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (direction: string | null | undefined) => {
    const safeDirection = safeString(direction).toLowerCase();
    switch (safeDirection) {
      case "increasing":
      case "improving":
      case "positive":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case "decreasing":
      case "declining":
      case "negative":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string | null | undefined) => {
    const safePriority = safeString(priority).toLowerCase();
    switch (safePriority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Prepare chart data for revenue trends
  const revenueData = analysis ? [
    {
      name: "Primary",
      value: safeGet(analysis, 'profit_and_loss.revenue_analysis.revenue_streams.primary_revenue', 0),
    },
    {
      name: "Secondary",
      value: safeGet(analysis, 'profit_and_loss.revenue_analysis.revenue_streams.secondary_revenue', 0),
    },
    {
      name: "Recurring",
      value: safeGet(analysis, 'profit_and_loss.revenue_analysis.revenue_streams.recurring_revenue', 0),
    },
    {
      name: "One-time",
      value: safeGet(analysis, 'profit_and_loss.revenue_analysis.revenue_streams.one_time_revenue', 0),
    },
  ].filter((item) => safeNumber(item?.value, 0) > 0) : [];

  // Prepare expense breakdown data
  const expenseData = analysis ? [
    {
      name: "Direct Costs",
      value: safeGet(analysis, 'profit_and_loss.cost_structure.cost_categories.direct_costs', 0),
    },
    {
      name: "Operating",
      value: safeGet(analysis, 'profit_and_loss.cost_structure.cost_categories.operating_expenses', 0),
    },
    {
      name: "Administrative",
      value: safeGet(analysis, 'profit_and_loss.cost_structure.cost_categories.administrative_costs', 0),
    },
    {
      name: "Financing",
      value: safeGet(analysis, 'profit_and_loss.cost_structure.cost_categories.financing_costs', 0),
    },
  ].filter((item) => safeNumber(item?.value, 0) > 0) : [];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  // If no analysis data and selector is not shown, show error  
  if (!currentAnalysisData && !showSelector) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Analysis Selected
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Please select a financial analysis from the dropdown above, or upload a new document to get started.
            </p>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <a href="/upload">
                <FileText className="w-4 h-4 mr-2" />
                Upload Document
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {showSelector && (
        <BranchUploadSelector
          onSelectionChange={handleSelectionChange}
          title="Select Data Source"
          description="Choose a branch and financial analysis to view dashboard data"
          showAllBranchesOption={true}
          initialBranchId={internalSelectedBranchId}
          initialAnalysisId={internalSelectedAnalysisId}
        />
      )}

      {loading && !currentAnalysisData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading financial analysis...</p>
          </div>
        </div>
      )}

      {showSelector && !currentAnalysisData && !loading && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analysis Selected
          </h3>
          <p className="text-muted-foreground">
            Please select a branch and financial analysis to view the dashboard.
          </p>
        </div>
      )}

      {currentAnalysisData && analysis && (
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Financial Analysis Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                AI-Powered Financial Analysis & Insights
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                    Comprehensive analysis of {safeString(currentAnalysisData?.file_info?.filename, 'Unknown File')}
              </p>
            </div>
          </div>
          <div className="text-center px-4 py-3 sm:px-6 sm:py-4 rounded-lg bg-emerald-50 border border-emerald-200 w-full sm:w-auto">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                  {safeNumber(analysis?.executive_summary?.business_health_score, 0)}
            </div>
            <div className="text-xs sm:text-sm font-medium text-emerald-600">Health Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-semibold text-emerald-600 truncate">
                  {formatCurrency(
                    safeGet(analysis, 'profit_and_loss.revenue_analysis.total_revenue', 0)
                  )}
                </p>
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
                <p className="text-lg sm:text-2xl font-semibold text-red-600 truncate">
                  {formatCurrency(
                    Math.abs(
                      safeGet(analysis, 'profit_and_loss.cost_structure.total_expenses', 0)
                    )
                  )}
                </p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Income</p>
                <p
                      className={`text-lg sm:text-2xl font-semibold truncate ${safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.net_income', 0)) >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                    }`}
                >
                  {formatCurrency(
                    safeGet(analysis, 'profit_and_loss.profitability_metrics.net_income', 0)
                  )}
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Margin</p>
                <p className="text-lg sm:text-2xl font-semibold text-slate-700">
                  {formatPercentage(
                    safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.net_margin', 0)
                  )}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      )}

      {/* Critical Alerts */}
      {currentAnalysisData && analysis && safeArray(analysis?.executive_summary?.critical_alerts).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              Critical Alerts Requiring Immediate Attention:
            </div>
            <ul className="list-disc list-inside space-y-1">
              {safeArray(analysis?.executive_summary?.critical_alerts).map(
                (alert: any, index: number) => (
                  <li key={index} className="text-sm">
                    {safeString(alert, 'Alert information unavailable')}
                  </li>
                )
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {currentAnalysisData && analysis && (
      <div className="bg-white rounded-lg border border-gray-200">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="border-b border-gray-200 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 min-w-[320px] md:min-w-0">
                {[
                  { value: "overview", label: "Overview" },
                  { value: "profitability", label: "P&L" },
                  {
                    value: "balance-sheet",
                    label: "Balance Sheet",
                    short: "Balance",
                  },
                  {
                    value: "monthly",
                    label: "Monthly Analysis",
                    short: "Monthly",
                    disabled: !analysis?.monthly_analysis,
                  },
                  {
                    value: "cash-flow",
                    label: "Cash Flow",
                    short: "Cash",
                    disabled: !analysis?.cash_flow_analysis,
                  },
                  {
                    value: "insights",
                    label: "AI Insights",
                    short: "AI",
                    disabled: !analysis?.ai_powered_insights,
                  },
                  {
                    value: "scenarios",
                    label: "Scenarios",
                    short: "Scenarios",
                    disabled: !analysis?.what_if_scenarios,
                  },
                  {
                    value: "recommendations",
                    label: "Actions",
                    short: "Actions",
                    disabled: !analysis?.strategic_recommendations,
                  },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={tab.disabled}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="inline md:hidden">
                      {tab.short || tab.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-6 p-4 sm:p-6"
          >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Revenue Breakdown */}
                <Card className="overflow-hidden">
                  <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">
                      Revenue Streams
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Breakdown of revenue sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6 pb-4">
                    {revenueData.length > 0 ? (
                      <div className="h-[200px] sm:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={revenueData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => {
                                // On small screens, only show percentage
                                const isMobile = window.innerWidth < 640;
                                return isMobile
                                  ? `${((percent || 0) * 100).toFixed(0)}%`
                                  : `${name} (${((percent || 0) * 100).toFixed(
                                      0
                                    )}%)`;
                              }}
                              outerRadius={window.innerWidth < 640 ? 60 : 80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {revenueData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) =>
                                formatCurrency(Number(value))
                              }
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[180px] sm:h-[250px] text-center p-2 sm:p-4">
                        <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mb-2 sm:mb-3" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-500">
                          No revenue data available
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Revenue breakdown information is not present in the
                          uploaded file
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card className="overflow-hidden">
                  <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">
                      Cost Structure
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Breakdown of expense categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6 pb-4">
                    {expenseData.length > 0 ? (
                      <div className="h-[200px] sm:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={expenseData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => {
                                // On small screens, only show percentage
                                const isMobile = window.innerWidth < 640;
                                return isMobile
                                  ? `${((percent || 0) * 100).toFixed(0)}%`
                                  : `${name} (${((percent || 0) * 100).toFixed(
                                      0
                                    )}%)`;
                              }}
                              outerRadius={window.innerWidth < 640 ? 60 : 80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {expenseData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) =>
                                formatCurrency(Number(value))
                              }
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[180px] sm:h-[250px] text-center p-2 sm:p-4">
                        <TrendingDown className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mb-2 sm:mb-3" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-500">
                          No expense data available
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Cost structure information is not present in the
                          uploaded file
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                          EBITDA
                        </p>
                        <p className="text-base sm:text-xl lg:text-2xl font-bold truncate max-w-[140px] sm:max-w-full">
                          {formatCurrency(
                            safeGet(analysis, 'profit_and_loss.profitability_metrics.ebitda', 0)
                          )}
                        </p>
                      </div>
                      <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Gross Margin
                        </p>
                        <p className="text-base sm:text-xl lg:text-2xl font-bold">
                          {formatPercentage(
                            analysis.profit_and_loss?.profitability_metrics
                              ?.margins?.gross_margin || 0
                          )}
                        </p>
                      </div>
                      <Target className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Op. Margin
                        </p>
                                                  <p
                          className={`text-base sm:text-xl lg:text-2xl font-bold ${
                            safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.operating_margin', 0)) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(
                            safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.operating_margin', 0)
                          )}
                        </p>
                      </div>
                      <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Cash Flow
                        </p>
                        <p
                          className={`text-base sm:text-xl lg:text-2xl font-bold truncate max-w-[140px] sm:max-w-full ${
                            safeNumber(analysis?.cash_flow_analysis?.operating_activities
                              ?.net_cash_from_operations, 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            safeGet(analysis, 'cash_flow_analysis.operating_activities.net_cash_from_operations', 0)
                          )}
                        </p>
                      </div>
                      <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Profitability Metrics</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">Gross Profit:</span>
                    <span className="font-bold text-green-600 text-xs sm:text-sm">
                        {formatCurrency(
                          analysis.profit_and_loss?.profitability_metrics
                            ?.gross_profit || 0
                        )}
                      </span>
                    </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">Operating Profit:</span>
                                                <span
                      className={`font-bold text-xs sm:text-sm ${
                          safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.operating_profit', 0)) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          safeGet(analysis, 'profit_and_loss.profitability_metrics.operating_profit', 0)
                        )}
                      </span>
                    </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">EBITDA:</span>
                      <span
                      className={`font-bold text-xs sm:text-sm ${
                          safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.ebitda', 0)) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          safeGet(analysis, 'profit_and_loss.profitability_metrics.ebitda', 0)
                        )}
                      </span>
                    </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">Net Income:</span>
                      <span
                      className={`font-bold text-xs sm:text-sm ${
                          safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.net_income', 0)) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          safeGet(analysis, 'profit_and_loss.profitability_metrics.net_income', 0)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Margin Analysis</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                      <div>
                      <div className="flex justify-between text-xs sm:text-sm">
                          <span>Gross Margin</span>
                          <span>
                            {formatPercentage(
                              safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.gross_margin', 0)
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.gross_margin', 0)) * 100
                          )}
                        className="h-1.5 sm:h-2 mt-1 sm:mt-2"
                        />
                      </div>

                      <div>
                      <div className="flex justify-between text-xs sm:text-sm">
                          <span>Operating Margin</span>
                          <span>
                            {formatPercentage(
                              safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.operating_margin', 0)
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.operating_margin', 0)) * 100
                          )}
                        className="h-1.5 sm:h-2 mt-1 sm:mt-2"
                        />
                      </div>

                      <div>
                      <div className="flex justify-between text-xs sm:text-sm">
                          <span>EBITDA Margin</span>
                          <span>
                            {formatPercentage(
                              safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.ebitda_margin', 0)
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.ebitda_margin', 0)) * 100
                          )}
                        className="h-1.5 sm:h-2 mt-1 sm:mt-2"
                        />
                      </div>

                      <div>
                      <div className="flex justify-between text-xs sm:text-sm">
                          <span>Net Margin</span>
                          <span>
                            {formatPercentage(
                              safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.net_margin', 0)
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            safeNumber(safeGet(analysis, 'profit_and_loss.profitability_metrics.margins.net_margin', 0)) * 100
                          )}
                        className="h-1.5 sm:h-2 mt-1 sm:mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance-sheet" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {(safeNumber(analysis?.balance_sheet?.assets?.total_assets, 0) > 0 ||
                safeNumber(analysis?.balance_sheet?.liabilities?.total_liabilities, 0) > 0 ||
                safeNumber(analysis?.balance_sheet?.equity?.total_equity, 0) > 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Current Assets:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.assets.current_assets.total_current', 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Non-Current Assets:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.assets.non_current_assets.total_non_current', 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm sm:text-lg border-t pt-2 sm:pt-3">
                        <span>Total Assets:</span>
                        <span>
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.assets.total_assets', 0)
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Current Liabilities:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.liabilities.current_liabilities.total_current', 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Long-term Liabilities:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.liabilities.long_term_liabilities.total_long_term', 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm sm:text-lg border-t pt-2 sm:pt-3">
                        <span>Total Liabilities:</span>
                        <span>
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.liabilities.total_liabilities', 0)
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">Equity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Owner Equity:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.equity.owner_equity', 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm">Retained Earnings:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.equity.retained_earnings', 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm sm:text-lg border-t pt-2 sm:pt-3">
                        <span>Total Equity:</span>
                        <span>
                          {formatCurrency(
                            safeGet(analysis, 'balance_sheet.equity.total_equity', 0)
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center p-4 sm:p-6">
                    <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
                      No Balance Sheet Data Available
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                      The uploaded financial document does not contain balance
                      sheet information or all values are zero. This could be
                      because the document is a Profit & Loss statement only.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

          {/* Monthly Analysis Tab */}
          <TabsContent value="monthly" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {analysis?.monthly_analysis && safeArray(analysis?.monthly_analysis?.months_detected).length > 0 ? (
              <div className="space-y-6">
                {/* Monthly Overview */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Monthly Overview</CardTitle>
                    <CardDescription>
                        Monthly financial data for {safeArray(analysis?.monthly_analysis?.per_month_metrics).length} of {safeArray(analysis?.monthly_analysis?.months_detected).length} periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Month</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Revenue</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Expenses</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Net Income</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Net Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {safeArray(analysis?.monthly_analysis?.per_month_metrics).map((month: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{safeString(month?.month, 'Unknown Month')}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-900">
                                  {formatCurrency(safeNumber(month?.revenue, 0))}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-900">
                                  {formatCurrency(safeNumber(month?.expenses, 0))}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                                  <span className={safeNumber(month?.net_income, 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(safeNumber(month?.net_income, 0))}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                  <span className={safeNumber(month?.key_ratios?.net_margin, 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatPercentage(safeNumber(month?.key_ratios?.net_margin, 0))}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      {safeArray(analysis?.monthly_analysis?.per_month_metrics).length < safeArray(analysis?.monthly_analysis?.months_detected).length && (
                      <div className="px-4 py-3 text-sm bg-blue-50 text-blue-700 border-t border-blue-100">
                        <p className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
                            Note: Data is only available for {safeArray(analysis?.monthly_analysis?.per_month_metrics).length} of {safeArray(analysis?.monthly_analysis?.months_detected).length} detected months.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Monthly Analysis Details */}
                  {safeArray(analysis?.monthly_analysis?.per_month_metrics).length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">Monthly Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        {safeArray(analysis?.monthly_analysis?.per_month_metrics).map((month: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-white">
                          <div className="flex flex-wrap justify-between items-center mb-3">
                              <h3 className="text-lg font-medium text-slate-800">{safeString(month?.month, 'Unknown Month')}</h3>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                Net Margin: {formatPercentage(safeNumber(month?.key_ratios?.net_margin, 0))}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                            <div className="flex flex-col p-3 bg-slate-50 rounded-md">
                              <span className="text-sm text-slate-600">Revenue</span>
                                <span className="text-lg font-semibold text-emerald-600">{formatCurrency(safeNumber(month?.revenue, 0))}</span>
                            </div>
                            <div className="flex flex-col p-3 bg-slate-50 rounded-md">
                              <span className="text-sm text-slate-600">Expenses</span>
                                <span className="text-lg font-semibold text-red-600">{formatCurrency(safeNumber(month?.expenses, 0))}</span>
                            </div>
                            <div className="flex flex-col p-3 bg-slate-50 rounded-md">
                              <span className="text-sm text-slate-600">Net Income</span>
                                <span className={`text-lg font-semibold ${safeNumber(month?.net_income, 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                  {formatCurrency(safeNumber(month?.net_income, 0))}
                              </span>
                            </div>
                          </div>
                            {safeArray(month?.anomalies_detected).length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-slate-800 mb-1">Anomalies Detected:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                  {safeArray(month?.anomalies_detected).map((anomaly: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-600">{safeString(anomaly, 'Unknown anomaly')}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                            {safeArray(month?.month_specific_recommendations).length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-slate-800 mb-1">Recommendations:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                  {safeArray(month?.month_specific_recommendations).map((rec: string, i: number) => (
                                    <li key={i} className="text-sm text-blue-600">{safeString(rec, 'No recommendation available')}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                {/* Monthly Revenue Chart */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Monthly Revenue Trend</CardTitle>
                    {analysis.monthly_analysis.per_month_metrics?.length === 1 && (
                        <CardDescription>
                          Showing data for {safeString(safeArray(analysis?.monthly_analysis?.per_month_metrics)[0]?.month, 'Unknown Month')}
                        </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                      {safeArray(analysis?.monthly_analysis?.per_month_metrics).length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                              data={safeArray(analysis?.monthly_analysis?.per_month_metrics).map((month: any) => ({
                                name: safeString(month?.month, 'Unknown').split(' ')[0], // Just get the month name
                                revenue: safeNumber(month?.revenue, 0),
                                expenses: safeNumber(month?.expenses, 0)
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                                angle={safeArray(analysis?.monthly_analysis?.per_month_metrics).length > 6 ? -45 : 0}
                                textAnchor={safeArray(analysis?.monthly_analysis?.per_month_metrics).length > 6 ? "end" : "middle"}
                              tick={{ fontSize: 12 }}
                              height={60}
                            />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
                            />
                            <Tooltip 
                              formatter={(value) => formatCurrency(Number(value))}
                            />
                            <Bar dataKey="revenue" name="Revenue" fill="#10b981" />
                            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                        <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                          No monthly metrics data available for chart visualization.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Seasonal Patterns */}
                  {safeArray(analysis?.monthly_analysis?.seasonal_patterns).length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        Seasonal Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        {safeArray(analysis?.monthly_analysis?.seasonal_patterns).map((pattern: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm">{safeString(pattern?.description, 'No description available')}</span>
                              <Badge variant={safeString(pattern?.pattern_type) === "revenue" ? "default" : "destructive"}>
                                {safeString(pattern?.pattern_type, 'Unknown')}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                              Affected Months: {safeArray(pattern?.affected_months).join(", ") || 'None specified'}
                          </div>
                          <div className="text-sm text-blue-600">
                              Recommendation: {safeString(pattern?.recommendation, 'No recommendation available')}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                {/* Month-over-Month Changes */}
                  {safeArray(analysis?.monthly_analysis?.month_over_month_comparison).length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Month-over-Month Comparisons
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        {safeArray(analysis?.monthly_analysis?.month_over_month_comparison).map((comparison: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">
                                {safeString(comparison?.current_month, 'Unknown')} vs {safeString(comparison?.previous_month, 'Unknown')}
                            </span>
                            <div className="flex items-center">
                                {safeString(comparison?.trend) === "increasing" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : safeString(comparison?.trend) === "decreasing" ? (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              ) : (
                                <MinusIcon className="h-4 w-4 text-gray-500" />
                              )}
                              <Badge 
                                  className={safeString(comparison?.trend) === "increasing" ? "bg-green-100 text-green-800" :
                                    safeString(comparison?.trend) === "decreasing" ? "bg-red-100 text-red-800" : 
                                  "bg-gray-100 text-gray-800"}
                              >
                                  {safeNumber(comparison?.change_percentage, 0)}%
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                              Metric: {safeString(comparison?.metric, 'unknown').toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                              Change: {formatCurrency(safeNumber(comparison?.change_amount, 0))}
                          </div>
                          <div className="text-sm text-blue-600">
                              {safeString(comparison?.insight, 'No insight available')}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center p-4 sm:p-6">
                  <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
                    No Monthly Data Available
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                    The uploaded financial document does not contain monthly breakdown information.
                    Try uploading a file with multi-month data for time-based analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cash-flow" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Operating Activities</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Net Cash from Operations:</span>
                      <span
                      className={`font-semibold text-xs sm:text-sm ${
                          safeNumber(analysis?.cash_flow_analysis?.operating_activities
                            ?.net_cash_from_operations, 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.operating_activities.net_cash_from_operations', 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Cash Conversion Efficiency:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                        {formatPercentage(
                          safeGet(analysis, 'cash_flow_analysis.operating_activities.cash_conversion_efficiency', 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Operating Cash Margin:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                        {formatPercentage(
                          safeGet(analysis, 'cash_flow_analysis.operating_activities.operating_cash_margin', 0)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Investing Activities</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Capital Expenditures:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.investing_activities.capital_expenditures', 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Asset Disposals:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.investing_activities.asset_disposals', 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                    <span className="text-xs sm:text-sm">Net Investing Cash Flow:</span>
                      <span
                      className={`text-xs sm:text-sm ${
                          safeNumber(analysis?.cash_flow_analysis?.investing_activities
                            ?.net_investing_cash_flow, 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.investing_activities.net_investing_cash_flow', 0)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Cash Position</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Beginning Cash:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.cash_position.beginning_cash', 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Ending Cash:</span>
                    <span className="font-semibold text-xs sm:text-sm">
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.cash_position.ending_cash', 0)
                        )}
                      </span>
                    </div>
                  <div className="flex justify-between font-bold text-sm sm:text-lg border-t pt-2 sm:pt-3">
                      <span>Free Cash Flow:</span>
                      <span
                        className={`${
                          safeNumber(analysis?.cash_flow_analysis?.cash_position
                            ?.free_cash_flow, 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          safeGet(analysis, 'cash_flow_analysis.cash_position.free_cash_flow', 0)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Trend Analysis */}
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      Trend Analysis
                    </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {safeArray(analysis?.ai_powered_insights?.trend_analysis).map(
                      (trend: any, index: number) => (
                        <div key={index} className="p-3 sm:p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs sm:text-sm">
                              {safeString(trend?.metric, 'unknown').replace("_", " ").toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {getTrendIcon(trend?.trend_direction)}
                              <Badge
                                className={getSeverityColor(
                                  trend?.trend_strength
                                )}
                              >
                                {safeString(trend?.trend_strength, 'Unknown')}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            Forecast:{" "}
                            {formatCurrency(safeNumber(trend?.forecast_next_period, 0))}
                          </p>
                          <div className="text-xs text-gray-500">
                            Confidence:{" "}
                            {(safeNumber(trend?.statistical_confidence, 0) * 100).toFixed(0)}%
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                {/* Anomaly Detection */}
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      Anomaly Detection
                    </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {safeArray(analysis?.ai_powered_insights?.anomaly_detection).map(
                      (anomaly: any, index: number) => (
                        <div key={index} className="p-3 sm:p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs sm:text-sm">
                              {safeString(anomaly?.metric, 'unknown').replace("_", " ").toUpperCase()}
                            </span>
                            <Badge
                              className={getSeverityColor(anomaly?.severity)}
                            >
                              {safeString(anomaly?.severity, 'Unknown')}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            {safeString(anomaly?.root_cause_hypothesis, 'No hypothesis available')}
                          </p>
                          <div className="text-xs text-blue-600">
                            Recommendation: {safeString(anomaly?.recommended_investigation, 'No recommendation available')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Deviation: {safeNumber(anomaly?.deviation_percentage, 0)}%
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Predictive Alerts */}
              <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    Predictive Alerts
                  </CardTitle>
                </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {safeArray(analysis?.ai_powered_insights?.predictive_alerts).map(
                      (alert: any, index: number) => (
                        <div key={index} className="p-3 sm:p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs sm:text-sm">
                              {safeString(alert?.alert_type, 'unknown').replace("_", " ").toUpperCase()}
                            </span>
                            <Badge
                              className={getSeverityColor(alert?.alert_level)}
                            >
                              {safeString(alert?.alert_level, 'Unknown')}
                            </Badge>
                          </div>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div>
                              Forecast:{" "}
                              {safeString(alert?.forecast_horizon, 'unknown').replace("_", " ")}
                            </div>
                            <div>
                              Probability:{" "}
                              {(safeNumber(alert?.probability, 0) * 100).toFixed(0)}%
                            </div>
                            <div>
                              Impact: {formatCurrency(safeNumber(alert?.potential_impact, 0))}
                            </div>
                            <div className="text-blue-600">
                              Actions: {safeArray(alert?.preventive_actions).join(", ") || 'No actions specified'}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Revenue Impact Analysis */}
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Revenue Impact Scenarios</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold mb-2 text-sm sm:text-base">
                        Baseline Scenario
                      </div>
                    <div className="text-xs sm:text-sm space-y-1">
                        <div>
                          Revenue:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.baseline_scenario.revenue', 0)
                          )}
                        </div>
                        <div>
                          Net Income:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.baseline_scenario.net_income', 0)
                          )}
                        </div>
                        <div>
                          Cash Flow:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.baseline_scenario.cash_flow', 0)
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="p-2 sm:p-3 bg-red-50 rounded-lg">
                    <div className="font-semibold mb-2 text-sm sm:text-base">
                        Revenue Decrease 20%
                      </div>
                    <div className="text-xs sm:text-sm space-y-1">
                        <div>
                          Revenue:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.revenue_decrease_20_percent.revenue', 0)
                          )}
                        </div>
                        <div>
                          Net Income:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.revenue_decrease_20_percent.net_income', 0)
                          )}
                        </div>
                        <div>
                          Impact:{" "}
                          <span className="text-red-600 font-semibold">
                            {safeString(safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.revenue_decrease_20_percent.impact_assessment'), 'No impact assessment available')}
                          </span>
                        </div>
                      </div>
                    </div>

                  <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold mb-2 text-sm sm:text-base">
                        Revenue Increase 20%
                      </div>
                    <div className="text-xs sm:text-sm space-y-1">
                        <div>
                          Revenue:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.revenue_increase_20_percent.revenue', 0)
                          )}
                        </div>
                        <div>
                          Net Income:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.revenue_increase_20_percent.net_income', 0)
                          )}
                        </div>
                        <div>
                          Cash Flow:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.revenue_impact_analysis.revenue_increase_20_percent.cash_flow', 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Optimization Scenarios */}
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Cost Optimization Scenarios</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold mb-2 text-sm sm:text-base">
                        Fixed Cost Reduction 15%
                      </div>
                    <div className="text-xs sm:text-sm space-y-1">
                        <div>
                          Cost Savings:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.cost_optimization_scenarios.fixed_cost_reduction_15_percent.cost_savings', 0)
                          )}
                        </div>
                        <div>
                          Net Income Impact:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.cost_optimization_scenarios.fixed_cost_reduction_15_percent.net_income_impact', 0)
                          )}
                        </div>
                        <div>
                          Feasibility:{" "}
                          <span className="text-green-600 font-semibold">
                            {safeString(safeGet(analysis, 'what_if_scenarios.cost_optimization_scenarios.fixed_cost_reduction_15_percent.feasibility'), 'Unknown feasibility')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold mb-2">
                        Variable Cost Optimization 10%
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          Cost Savings:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.cost_optimization_scenarios.variable_cost_optimization_10_percent.cost_savings', 0)
                          )}
                        </div>
                        <div>
                          Margin Improvement:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.cost_optimization_scenarios.variable_cost_optimization_10_percent.margin_improvement', 0)
                          )}
                        </div>
                        <div>
                          Implementation:{" "}
                          <span className="text-blue-600 font-semibold">
                            {safeString(safeGet(analysis, 'what_if_scenarios.cost_optimization_scenarios.variable_cost_optimization_10_percent.implementation_difficulty'), 'Unknown difficulty')}
                          </span>
                        </div>
                      </div>
                    </div>

                  <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg">
                    <div className="font-semibold mb-2 text-sm sm:text-base">
                        Break-even Analysis
                      </div>
                    <div className="text-xs sm:text-sm space-y-1">
                        <div>
                          Break-even Revenue:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.cash_flow_stress_testing.break_even_analysis.break_even_revenue', 0)
                          )}
                        </div>
                        <div>
                          Margin of Safety:{" "}
                          {formatCurrency(
                            safeGet(analysis, 'what_if_scenarios.cash_flow_stress_testing.break_even_analysis.margin_of_safety', 0)
                          )}
                        </div>
                        <div>
                          Operating Leverage:{" "}
                          {safeNumber(safeGet(analysis, 'what_if_scenarios.cash_flow_stress_testing.break_even_analysis.operating_leverage'), 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Immediate Actions */}
                <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      Immediate Actions (0-30 Days)
                    </CardTitle>
                  </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                      {safeArray(analysis?.strategic_recommendations?.immediate_actions_0_30_days).map(
                        (action: any, index: number) => (
                          <div key={index} className="p-3 sm:p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {getPriorityIcon(action?.priority)}
                                <span className="font-semibold text-xs sm:text-sm">
                                  {safeString(action?.action, 'No action specified')}
                                </span>
                              </div>
                              <Badge
                                className={getSeverityColor(action?.priority)}
                              >
                                {safeString(action?.priority, 'Unknown')}
                              </Badge>
                            </div>
                            <div className="text-xs sm:text-sm space-y-1">
                              <div>
                                Expected Impact:{" "}
                                {formatCurrency(safeNumber(action?.expected_impact, 0))}
                              </div>
                              <div>
                                Implementation Cost:{" "}
                                {formatCurrency(safeNumber(action?.implementation_cost, 0))}
                              </div>
                              <div className="text-blue-600">
                                Success Metrics:{" "}
                                {safeArray(action?.success_metrics).join(", ") || 'No metrics specified'}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Short-term Improvements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      Short-term Improvements (1-6 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {safeArray(analysis?.strategic_recommendations?.short_term_improvements_1_6_months).map(
                        (improvement: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-semibold mb-2">
                              {safeString(improvement?.initiative, 'No initiative specified')}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                Business Case: {safeString(improvement?.business_case, 'No business case provided')}
                              </div>
                              <div>
                                Investment Required:{" "}
                                {formatCurrency(
                                  safeNumber(improvement?.investment_required, 0)
                                )}
                              </div>
                              <div>
                                Expected ROI: {safeNumber(improvement?.expected_roi, 0)}x
                              </div>
                              <div className="text-red-600">
                                Risk Factors:{" "}
                                {safeArray(improvement?.risk_factors).join(", ") || 'No risk factors specified'}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Growth Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {safeArray(analysis?.strategic_recommendations?.growth_opportunities).map(
                        (opportunity: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-semibold mb-2">
                              {safeString(opportunity?.opportunity_type, 'unknown')
                                .replace("_", " ")
                                .toUpperCase()}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                Revenue Potential:{" "}
                                {formatCurrency(safeNumber(opportunity?.revenue_potential, 0))}
                              </div>
                              <div>
                                Investment Required:{" "}
                                {formatCurrency(
                                  safeNumber(opportunity?.investment_required, 0)
                                )}
                              </div>
                              <div>
                                Timeline to Impact:{" "}
                                {safeString(opportunity?.timeline_to_impact, 'Not specified')}
                              </div>
                              <div>
                                Feasibility Score:{" "}
                                {(safeNumber(opportunity?.feasibility_score, 0) * 100).toFixed(
                                  0
                                )}
                                %
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

    </div>
  );
}

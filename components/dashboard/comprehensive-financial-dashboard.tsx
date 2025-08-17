"use client";

import { useState } from "react";
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
  analysisData: FinancialAnalysisData;
}

export default function ComprehensiveFinancialDashboard({
  analysisData,
}: ComprehensiveFinancialDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { analysis } = analysisData;

  // Add error handling for potentially missing data
  if (!analysis) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load financial analysis data. The data structure may be
            incomplete.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    if (typeof value !== "number") return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
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

  const getTrendIcon = (direction: string) => {
    switch (direction?.toLowerCase()) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
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
  const revenueData = [
    {
      name: "Primary",
      value:
        analysis.profit_and_loss.revenue_analysis?.revenue_streams
          ?.primary_revenue || 0,
    },
    {
      name: "Secondary",
      value:
        analysis.profit_and_loss.revenue_analysis?.revenue_streams
          ?.secondary_revenue || 0,
    },
    {
      name: "Recurring",
      value:
        analysis.profit_and_loss.revenue_analysis?.revenue_streams
          ?.recurring_revenue || 0,
    },
    {
      name: "One-time",
      value:
        analysis.profit_and_loss.revenue_analysis?.revenue_streams
          ?.one_time_revenue || 0,
    },
  ].filter((item) => item.value > 0);

  // Prepare expense breakdown data
  const expenseData = [
    {
      name: "Direct Costs",
      value:
        analysis.profit_and_loss.cost_structure?.cost_categories
          ?.direct_costs || 0,
    },
    {
      name: "Operating",
      value:
        analysis.profit_and_loss.cost_structure?.cost_categories
          ?.operating_expenses || 0,
    },
    {
      name: "Administrative",
      value:
        analysis.profit_and_loss.cost_structure?.cost_categories
          ?.administrative_costs || 0,
    },
    {
      name: "Financing",
      value:
        analysis.profit_and_loss.cost_structure?.cost_categories
          ?.financing_costs || 0,
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Executive Summary */}
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
                  Financial Analysis Dashboard
                </h1>
                <p className="text-gray-600 mt-1">AI-Powered Financial Analysis & Insights</p>
                <p className="text-sm text-gray-500 mt-1">
                  Comprehensive analysis of {analysisData.file_info.filename}
                </p>
              </div>
            </div>
            <div className="text-center px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl font-bold">
                {analysis.executive_summary?.business_health_score || 0}
              </div>
              <div className="text-sm font-medium">Health Score</div>
              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {formatCurrency(
                analysis.profit_and_loss.revenue_analysis?.total_revenue || 0
              )}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
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
              {formatCurrency(
                Math.abs(
                  analysis.profit_and_loss.cost_structure?.total_expenses || 0
                )
              )}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
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
                analysis.profit_and_loss?.profitability_metrics?.net_income >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(
                analysis.profit_and_loss.profitability_metrics?.net_income ||
                  0
              )}
            </div>
            <div className="text-sm text-gray-600">Net Income</div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(
                analysis.profit_and_loss.profitability_metrics?.margins
                  ?.net_margin || 0
              )}
            </div>
            <div className="text-sm text-gray-600">Net Margin</div>
          </div>
        </div>
      </div>

      {/* Enhanced Critical Alerts */}
      {analysis.executive_summary?.critical_alerts?.length > 0 && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10 rounded-2xl"></div>
          <div className="relative bg-red-50/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-2 text-lg text-red-800">
                  Critical Alerts Requiring Immediate Attention:
                </div>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  {analysis.executive_summary?.critical_alerts?.map(
                    (alert, index) => (
                      <li key={index} className="text-sm">
                        {alert}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Main Content Tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-60"></div>
        <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/30">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-7 bg-transparent border-0 p-0 h-auto">
              {[
                { value: "overview", label: "Overview" },
                { value: "profitability", label: "P&L" },
                { value: "balance-sheet", label: "Balance Sheet" },
                { value: "cash-flow", label: "Cash Flow", disabled: !analysis.cash_flow_analysis },
                { value: "insights", label: "AI Insights", disabled: !analysis.ai_powered_insights },
                { value: "scenarios", label: "Scenarios", disabled: !analysis.what_if_scenarios },
                { value: "recommendations", label: "Actions", disabled: !analysis.strategic_recommendations }
              ].map((tab, index) => (
                <button
                  key={tab.value}
                  onClick={() => !tab.disabled && setSelectedTab(tab.value)}
                  disabled={tab.disabled}
                  className={`relative flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    selectedTab === tab.value
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl scale-105"
                      : tab.disabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 shadow-lg hover:shadow-xl"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {selectedTab === tab.value && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                    <span>{tab.label}</span>
                  </div>
                  {selectedTab === tab.value && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rotate-45"></div>
                  )}
                </button>
              ))}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Streams</CardTitle>
                    <CardDescription>Breakdown of revenue sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={revenueData}
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
                            {revenueData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[250px] text-center p-4">
                        <DollarSign className="h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-500">
                          No revenue data available
                        </h3>
                        <p className="text-sm text-gray-400">
                          Revenue breakdown information is not present in the
                          uploaded file
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Structure</CardTitle>
                    <CardDescription>
                      Breakdown of expense categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {expenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={expenseData}
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
                            {expenseData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[250px] text-center p-4">
                        <TrendingDown className="h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-500">
                          No expense data available
                        </h3>
                        <p className="text-sm text-gray-400">
                          Cost structure information is not present in the uploaded
                          file
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          EBITDA
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            analysis.profit_and_loss?.profitability_metrics
                              ?.ebitda || 0
                          )}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Gross Margin
                        </p>
                        <p className="text-2xl font-bold">
                          {formatPercentage(
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.gross_margin || 0
                          )}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Operating Margin
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.operating_margin >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercentage(
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.operating_margin || 0
                          )}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Cash Flow
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            analysis.cash_flow_analysis?.operating_activities
                              ?.net_cash_from_operations >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            analysis.cash_flow_analysis?.operating_activities
                              ?.net_cash_from_operations || 0
                          )}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profitability Tab */}
            <TabsContent value="profitability" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profitability Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Gross Profit:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(
                          analysis.profit_and_loss?.profitability_metrics
                            ?.gross_profit || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Operating Profit:</span>
                      <span
                        className={`font-bold ${
                          analysis.profit_and_loss?.profitability_metrics
                            ?.operating_profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          analysis.profit_and_loss?.profitability_metrics
                            ?.operating_profit || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>EBITDA:</span>
                      <span
                        className={`font-bold ${
                          analysis.profit_and_loss?.profitability_metrics?.ebitda >=
                          0
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          analysis.profit_and_loss?.profitability_metrics?.ebitda ||
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Net Income:</span>
                      <span
                        className={`font-bold ${
                          analysis.profit_and_loss?.profitability_metrics
                            ?.net_income >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          analysis.profit_and_loss?.profitability_metrics
                            ?.net_income || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Margin Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Gross Margin</span>
                          <span>
                            {formatPercentage(
                              analysis.profit_and_loss?.profitability_metrics
                                ?.margins?.gross_margin || 0
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.gross_margin || 0 * 100
                          )}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Operating Margin</span>
                          <span>
                            {formatPercentage(
                              analysis.profit_and_loss?.profitability_metrics
                                ?.margins?.operating_margin || 0
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.operating_margin || 0 * 100
                          )}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span>EBITDA Margin</span>
                          <span>
                            {formatPercentage(
                              analysis.profit_and_loss?.profitability_metrics
                                ?.margins?.ebitda_margin || 0
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.ebitda_margin || 0 * 100
                          )}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Net Margin</span>
                          <span>
                            {formatPercentage(
                              analysis.profit_and_loss?.profitability_metrics
                                ?.margins?.net_margin || 0
                            )}
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            0,
                            analysis.profit_and_loss?.profitability_metrics?.margins
                              ?.net_margin || 0 * 100
                          )}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Balance Sheet Tab */}
            <TabsContent value="balance-sheet" className="space-y-6">
              {analysis.balance_sheet?.assets?.total_assets ||
              analysis.balance_sheet?.liabilities?.total_liabilities ||
              analysis.balance_sheet?.equity?.total_equity ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Current Assets:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analysis.balance_sheet?.assets?.current_assets
                              ?.total_current || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Non-Current Assets:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analysis.balance_sheet?.assets?.non_current_assets
                              ?.total_non_current || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-3">
                        <span>Total Assets:</span>
                        <span>
                          {formatCurrency(
                            analysis.balance_sheet?.assets?.total_assets || 0
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Current Liabilities:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analysis.balance_sheet?.liabilities?.current_liabilities
                              ?.total_current || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Long-term Liabilities:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analysis.balance_sheet?.liabilities
                              ?.long_term_liabilities?.total_long_term || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-3">
                        <span>Total Liabilities:</span>
                        <span>
                          {formatCurrency(
                            analysis.balance_sheet?.liabilities
                              ?.total_liabilities || 0
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Equity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Owner Equity:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analysis.balance_sheet?.equity?.owner_equity || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retained Earnings:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            analysis.balance_sheet?.equity?.retained_earnings || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-3">
                        <span>Total Equity:</span>
                        <span>
                          {formatCurrency(
                            analysis.balance_sheet?.equity?.total_equity || 0
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Balance Sheet Data Available
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      The uploaded financial document does not contain balance sheet
                      information or all values are zero. This could be because the
                      document is a Profit & Loss statement only.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cash Flow Tab */}
            <TabsContent value="cash-flow" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Operating Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Net Cash from Operations:</span>
                      <span
                        className={`font-semibold ${
                          analysis.cash_flow_analysis?.operating_activities
                            ?.net_cash_from_operations >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          analysis.cash_flow_analysis?.operating_activities
                            ?.net_cash_from_operations || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash Conversion Efficiency:</span>
                      <span className="font-semibold">
                        {formatPercentage(
                          analysis.cash_flow_analysis?.operating_activities
                            ?.cash_conversion_efficiency || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Cash Margin:</span>
                      <span className="font-semibold">
                        {formatPercentage(
                          analysis.cash_flow_analysis?.operating_activities
                            ?.operating_cash_margin || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investing Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Capital Expenditures:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          analysis.cash_flow_analysis?.investing_activities
                            ?.capital_expenditures || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asset Disposals:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          analysis.cash_flow_analysis?.investing_activities
                            ?.asset_disposals || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Net Investing Cash Flow:</span>
                      <span
                        className={`${
                          analysis.cash_flow_analysis?.investing_activities
                            ?.net_investing_cash_flow >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          analysis.cash_flow_analysis?.investing_activities
                            ?.net_investing_cash_flow || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cash Position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Beginning Cash:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          analysis.cash_flow_analysis?.cash_position
                            ?.beginning_cash || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ending Cash:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          analysis.cash_flow_analysis?.cash_position?.ending_cash ||
                            0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-3">
                      <span>Free Cash Flow:</span>
                      <span
                        className={`${
                          analysis.cash_flow_analysis?.cash_position
                            ?.free_cash_flow >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          analysis.cash_flow_analysis?.cash_position
                            ?.free_cash_flow || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Trend Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.ai_powered_insights?.trend_analysis?.map(
                      (trend, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {trend.metric.replace("_", " ").toUpperCase()}
                            </span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(trend.trend_direction)}
                              <Badge
                                className={getSeverityColor(trend.trend_strength)}
                              >
                                {trend.trend_strength}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Forecast: {formatCurrency(trend.forecast_next_period)}
                          </p>
                          <div className="text-xs text-gray-500">
                            Confidence:{" "}
                            {(trend.statistical_confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                {/* Anomaly Detection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Anomaly Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.ai_powered_insights?.anomaly_detection?.map(
                      (anomaly, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {anomaly.metric.replace("_", " ").toUpperCase()}
                            </span>
                            <Badge className={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {anomaly.root_cause_hypothesis}
                          </p>
                          <div className="text-xs text-blue-600">
                            Recommendation: {anomaly.recommended_investigation}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Deviation: {anomaly.deviation_percentage}%
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Predictive Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Predictive Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.ai_powered_insights?.predictive_alerts?.map(
                      (alert, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {alert.alert_type.replace("_", " ").toUpperCase()}
                            </span>
                            <Badge className={getSeverityColor(alert.alert_level)}>
                              {alert.alert_level}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              Forecast: {alert.forecast_horizon.replace("_", " ")}
                            </div>
                            <div>
                              Probability: {(alert.probability * 100).toFixed(0)}%
                            </div>
                            <div>
                              Impact: {formatCurrency(alert.potential_impact)}
                            </div>
                            <div className="text-blue-600">
                              Actions: {alert.preventive_actions.join(", ")}
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
            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Impact Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Impact Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold mb-2">Baseline Scenario</div>
                      <div className="text-sm space-y-1">
                        <div>
                          Revenue:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.baseline_scenario?.revenue || 0
                          )}
                        </div>
                        <div>
                          Net Income:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.baseline_scenario?.net_income || 0
                          )}
                        </div>
                        <div>
                          Cash Flow:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.baseline_scenario?.cash_flow || 0
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="font-semibold mb-2">Revenue Decrease 20%</div>
                      <div className="text-sm space-y-1">
                        <div>
                          Revenue:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.revenue_decrease_20_percent?.revenue || 0
                          )}
                        </div>
                        <div>
                          Net Income:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.revenue_decrease_20_percent?.net_income || 0
                          )}
                        </div>
                        <div>
                          Impact:{" "}
                          <span className="text-red-600 font-semibold">
                            {analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.revenue_decrease_20_percent?.impact_assessment ||
                              ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold mb-2">Revenue Increase 20%</div>
                      <div className="text-sm space-y-1">
                        <div>
                          Revenue:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.revenue_increase_20_percent?.revenue || 0
                          )}
                        </div>
                        <div>
                          Net Income:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.revenue_increase_20_percent?.net_income || 0
                          )}
                        </div>
                        <div>
                          Cash Flow:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.revenue_impact_analysis
                              ?.revenue_increase_20_percent?.cash_flow || 0
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Optimization Scenarios */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Optimization Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold mb-2">
                        Fixed Cost Reduction 15%
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          Cost Savings:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.cost_optimization_scenarios
                              ?.fixed_cost_reduction_15_percent?.cost_savings || 0
                          )}
                        </div>
                        <div>
                          Net Income Impact:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.cost_optimization_scenarios
                              ?.fixed_cost_reduction_15_percent
                              ?.net_income_impact || 0
                          )}
                        </div>
                        <div>
                          Feasibility:{" "}
                          <span className="text-green-600 font-semibold">
                            {analysis.what_if_scenarios?.cost_optimization_scenarios
                              ?.fixed_cost_reduction_15_percent?.feasibility || ""}
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
                            analysis.what_if_scenarios?.cost_optimization_scenarios
                              ?.variable_cost_optimization_10_percent
                              ?.cost_savings || 0
                          )}
                        </div>
                        <div>
                          Margin Improvement:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.cost_optimization_scenarios
                              ?.variable_cost_optimization_10_percent
                              ?.margin_improvement || 0
                          )}
                        </div>
                        <div>
                          Implementation:{" "}
                          <span className="text-blue-600 font-semibold">
                            {analysis.what_if_scenarios?.cost_optimization_scenarios
                              ?.variable_cost_optimization_10_percent
                              ?.implementation_difficulty || ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="font-semibold mb-2">Break-even Analysis</div>
                      <div className="text-sm space-y-1">
                        <div>
                          Break-even Revenue:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.cash_flow_stress_testing
                              ?.break_even_analysis?.break_even_revenue || 0
                          )}
                        </div>
                        <div>
                          Margin of Safety:{" "}
                          {formatCurrency(
                            analysis.what_if_scenarios?.cash_flow_stress_testing
                              ?.break_even_analysis?.margin_of_safety || 0
                          )}
                        </div>
                        <div>
                          Operating Leverage:{" "}
                          {analysis.what_if_scenarios?.cash_flow_stress_testing?.break_even_analysis?.operating_leverage?.toFixed(
                            2
                          ) || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Immediate Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Immediate Actions (0-30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.strategic_recommendations?.immediate_actions_0_30_days?.map(
                        (action, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(action.priority)}
                                <span className="font-semibold">
                                  {action.action}
                                </span>
                              </div>
                              <Badge className={getSeverityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                Expected Impact:{" "}
                                {formatCurrency(action.expected_impact)}
                              </div>
                              <div>
                                Implementation Cost:{" "}
                                {formatCurrency(action.implementation_cost)}
                              </div>
                              <div className="text-blue-600">
                                Success Metrics: {action.success_metrics.join(", ")}
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
                      {analysis.strategic_recommendations?.short_term_improvements_1_6_months?.map(
                        (improvement, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-semibold mb-2">
                              {improvement.initiative}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>Business Case: {improvement.business_case}</div>
                              <div>
                                Investment Required:{" "}
                                {formatCurrency(improvement.investment_required)}
                              </div>
                              <div>Expected ROI: {improvement.expected_roi}x</div>
                              <div className="text-red-600">
                                Risk Factors: {improvement.risk_factors.join(", ")}
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
                      {analysis.strategic_recommendations?.growth_opportunities?.map(
                        (opportunity, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="font-semibold mb-2">
                              {opportunity.opportunity_type
                                .replace("_", " ")
                                .toUpperCase()}
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                Revenue Potential:{" "}
                                {formatCurrency(opportunity.revenue_potential)}
                              </div>
                              <div>
                                Investment Required:{" "}
                                {formatCurrency(opportunity.investment_required)}
                              </div>
                              <div>
                                Timeline to Impact: {opportunity.timeline_to_impact}
                              </div>
                              <div>
                                Feasibility Score:{" "}
                                {(opportunity.feasibility_score * 100).toFixed(0)}%
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
      </div>
    </div>
  );
}

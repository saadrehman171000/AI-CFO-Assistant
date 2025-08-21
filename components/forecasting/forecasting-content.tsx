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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Target,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  FileText,
  Calendar,
  Users,
  Download,
  Share2,
  Plus,
  Minus,
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
  Cell,
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
  cashFlowFromInvesting?: number;
  cashFlowFromFinancing?: number;
  netCashFlow: number;
  arDays?: number;
  apDays?: number;
  ebitda?: number;
  currentRatio?: number;
  quickRatio?: number;
  debtToEquityRatio?: number;
}

interface ForecastData {
  cashFlow: {
    dates: string[];
    projected: number[];
    optimistic: number[];
    pessimistic: number[];
  };
  scenarios: {
    name: string;
    revenue: number;
    expenses: number;
    profit: number;
    cashFlow: number;
    probability: number;
  }[];
  metrics: {
    breakEvenPoint: number;
    cashRunway: number;
    burnRate: number;
    growthRate: number;
  };
}

export default function ForecastingContent() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("90");
  const [scenarioInputs, setScenarioInputs] = useState({
    revenueChange: 0,
    expenseChange: 0,
    cashFlowChange: 0,
  });

  const generateForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from our financial analysis API
      const response = await fetch("/api/financial-analysis?latest=true");
      if (!response.ok) {
        throw new Error("Failed to fetch financial data");
      }

      const analysisData = await response.json();

      if (analysisData && analysisData.analysis) {
        // Use real financial data from the API
        const metrics = {
          totalRevenue:
            analysisData.analysis.profit_and_loss.revenue_analysis
              ?.total_revenue || 0,
          totalExpenses:
            analysisData.analysis.profit_and_loss.cost_structure
              ?.total_expenses || 0,
          netProfit:
            analysisData.analysis.profit_and_loss.profitability_metrics
              ?.net_income || 0,
          netCashFlow:
            analysisData.analysis.cash_flow_analysis?.cash_position
              ?.free_cash_flow || 0,
          // Other metrics
          grossMargin:
            analysisData.analysis.profit_and_loss.profitability_metrics?.margins
              ?.gross_margin || 0,
          netMargin:
            analysisData.analysis.profit_and_loss.profitability_metrics?.margins
              ?.net_margin || 0,
          totalAssets:
            analysisData.analysis.balance_sheet?.assets?.total_assets || 0,
          totalLiabilities:
            analysisData.analysis.balance_sheet?.liabilities
              ?.total_liabilities || 0,
          totalEquity:
            analysisData.analysis.balance_sheet?.equity?.total_equity || 0,
          cashFlowFromOperations:
            analysisData.analysis.cash_flow_analysis?.operating_activities
              ?.net_cash_from_operations || 0,
        };

        // Use what-if scenario data if available, or generate it
        if (analysisData.analysis.what_if_scenarios) {
          const forecast = generateForecastFromScenarios(
            analysisData.analysis.what_if_scenarios,
            metrics,
            parseInt(selectedPeriod)
          );
          setForecastData(forecast);
        } else {
          // Fall back to generating forecast data
          const forecast = generateForecastData(
            metrics,
            parseInt(selectedPeriod)
          );
          setForecastData(forecast);
        }
      } else {
        throw new Error("Invalid or missing financial analysis data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateForecastData = (
    metrics: FinancialMetrics,
    days: number
  ): ForecastData => {
    const dates = [];
    const projected = [];
    const optimistic = [];
    const pessimistic = [];

    const currentDate = new Date();
    const dailyCashFlow = (metrics.netCashFlow || 0) / 30; // Assume monthly data

    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      const baseProjection = (metrics.netCashFlow || 0) + dailyCashFlow * i;
      projected.push(baseProjection);
      optimistic.push(baseProjection * 1.2);
      pessimistic.push(baseProjection * 0.8);
    }

    const scenarios = [
      {
        name: "Base Case",
        revenue: metrics.totalRevenue || 0,
        expenses: metrics.totalExpenses || 0,
        profit: metrics.netProfit || 0,
        cashFlow: metrics.netCashFlow || 0,
        probability: 0.6,
      },
      {
        name: "Optimistic",
        revenue: (metrics.totalRevenue || 0) * 1.2,
        expenses: (metrics.totalExpenses || 0) * 1.05,
        profit:
          (metrics.totalRevenue || 0) * 1.2 -
          (metrics.totalExpenses || 0) * 1.05,
        cashFlow: (metrics.netCashFlow || 0) * 1.3,
        probability: 0.2,
      },
      {
        name: "Pessimistic",
        revenue: (metrics.totalRevenue || 0) * 0.8,
        expenses: (metrics.totalExpenses || 0) * 1.1,
        profit:
          (metrics.totalRevenue || 0) * 0.8 -
          (metrics.totalExpenses || 0) * 1.1,
        cashFlow: (metrics.netCashFlow || 0) * 0.7,
        probability: 0.2,
      },
    ];

    const breakEvenPoint = metrics.totalExpenses
      ? metrics.totalExpenses / (metrics.totalRevenue / 100)
      : 0;
    const cashRunway = metrics.netCashFlow
      ? Math.abs(metrics.netCashFlow / (metrics.totalExpenses / 30))
      : 0;
    const burnRate = metrics.totalExpenses ? metrics.totalExpenses / 30 : 0;
    const growthRate = 0.08; // Assume 8% monthly growth

    return {
      cashFlow: { dates, projected, optimistic, pessimistic },
      scenarios,
      metrics: { breakEvenPoint, cashRunway, burnRate, growthRate },
    };
  };

  // Generate forecast from what-if scenarios data
  const generateForecastFromScenarios = (
    whatIfScenarios: any,
    metrics: FinancialMetrics,
    days: number
  ): ForecastData => {
    const dates = [];
    const projected = [];
    const optimistic = [];
    const pessimistic = [];

    const currentDate = new Date();

    // Calculate daily cash flow rates using baseline and scenario data if available
    let baselineCashFlow = metrics.netCashFlow || 0;
    let optimisticCashFlow = baselineCashFlow * 1.2;
    let pessimisticCashFlow = baselineCashFlow * 0.8;

    // Use what-if scenario data if available
    if (whatIfScenarios.revenue_impact_analysis) {
      if (
        whatIfScenarios.revenue_impact_analysis.baseline_scenario?.cash_flow
      ) {
        baselineCashFlow =
          whatIfScenarios.revenue_impact_analysis.baseline_scenario.cash_flow;
      }
      if (
        whatIfScenarios.revenue_impact_analysis.revenue_increase_20_percent
          ?.cash_flow
      ) {
        optimisticCashFlow =
          whatIfScenarios.revenue_impact_analysis.revenue_increase_20_percent
            .cash_flow;
      }
      if (
        whatIfScenarios.revenue_impact_analysis.revenue_decrease_20_percent
          ?.cash_flow
      ) {
        pessimisticCashFlow =
          whatIfScenarios.revenue_impact_analysis.revenue_decrease_20_percent
            .cash_flow;
      }
    }

    const dailyCashFlowBase = baselineCashFlow / 30;
    const dailyCashFlowOpt = optimisticCashFlow / 30;
    const dailyCashFlowPess = pessimisticCashFlow / 30;

    // Generate the dates and projections
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      projected.push(baselineCashFlow + dailyCashFlowBase * i);
      optimistic.push(optimisticCashFlow + dailyCashFlowOpt * i);
      pessimistic.push(pessimisticCashFlow + dailyCashFlowPess * i);
    }

    // Build scenarios from what-if data
    const scenarios = [
      {
        name: "Baseline",
        revenue: metrics.totalRevenue || 0,
        expenses: metrics.totalExpenses || 0,
        profit: metrics.netProfit || 0,
        cashFlow: baselineCashFlow,
        probability: 0.6,
      },
    ];

    // Add optimistic scenario if available
    if (whatIfScenarios.revenue_impact_analysis?.revenue_increase_20_percent) {
      const optimisticData =
        whatIfScenarios.revenue_impact_analysis.revenue_increase_20_percent;
      scenarios.push({
        name: "Revenue +20%",
        revenue: optimisticData.revenue || metrics.totalRevenue * 1.2,
        expenses: metrics.totalExpenses || 0,
        profit: optimisticData.net_income || metrics.netProfit * 1.3,
        cashFlow: optimisticData.cash_flow || optimisticCashFlow,
        probability: 0.2,
      });
    } else {
      // Add fallback optimistic scenario
      scenarios.push({
        name: "Optimistic",
        revenue: metrics.totalRevenue * 1.2,
        expenses: metrics.totalExpenses * 1.05,
        profit: metrics.totalRevenue * 1.2 - metrics.totalExpenses * 1.05,
        cashFlow: optimisticCashFlow,
        probability: 0.2,
      });
    }

    // Add pessimistic scenario if available
    if (whatIfScenarios.revenue_impact_analysis?.revenue_decrease_20_percent) {
      const pessimisticData =
        whatIfScenarios.revenue_impact_analysis.revenue_decrease_20_percent;
      scenarios.push({
        name: "Revenue -20%",
        revenue: pessimisticData.revenue || metrics.totalRevenue * 0.8,
        expenses: metrics.totalExpenses || 0,
        profit: pessimisticData.net_income || metrics.netProfit * 0.7,
        cashFlow: pessimisticData.cash_flow || pessimisticCashFlow,
        probability: 0.2,
      });
    } else {
      // Add fallback pessimistic scenario
      scenarios.push({
        name: "Pessimistic",
        revenue: metrics.totalRevenue * 0.8,
        expenses: metrics.totalExpenses * 1.1,
        profit: metrics.totalRevenue * 0.8 - metrics.totalExpenses * 1.1,
        cashFlow: pessimisticCashFlow,
        probability: 0.2,
      });
    }

    // Add cost optimization scenario if available
    if (
      whatIfScenarios.cost_optimization_scenarios
        ?.fixed_cost_reduction_15_percent
    ) {
      const costReduction =
        whatIfScenarios.cost_optimization_scenarios
          .fixed_cost_reduction_15_percent;
      scenarios.push({
        name: "Cost -15%",
        revenue: metrics.totalRevenue,
        expenses:
          metrics.totalExpenses -
          (costReduction.cost_savings || metrics.totalExpenses * 0.15),
        profit:
          metrics.netProfit +
          (costReduction.net_income_impact || metrics.totalExpenses * 0.15),
        cashFlow:
          metrics.netCashFlow +
          (costReduction.cash_flow_impact || metrics.totalExpenses * 0.15),
        probability: 0.3,
      });
    }

    // Calculate metrics from what-if scenarios and break-even analysis
    let breakEvenPoint = metrics.totalExpenses
      ? metrics.totalExpenses / (metrics.totalRevenue / 100)
      : 0;
    let cashRunway =
      metrics.netCashFlow && metrics.totalExpenses
        ? Math.abs(metrics.netCashFlow / (metrics.totalExpenses / 30))
        : 0;
    let burnRate = metrics.totalExpenses ? metrics.totalExpenses / 30 : 0;
    let growthRate = 0.05; // Default to 5%

    // Use what-if scenario data if available
    if (
      whatIfScenarios.cash_flow_stress_testing?.break_even_analysis
        ?.break_even_revenue
    ) {
      breakEvenPoint =
        (whatIfScenarios.cash_flow_stress_testing.break_even_analysis
          .break_even_revenue /
          metrics.totalRevenue) *
        100;
    }

    if (
      whatIfScenarios.cash_flow_stress_testing?.best_case_scenario
        ?.months_of_runway
    ) {
      cashRunway =
        whatIfScenarios.cash_flow_stress_testing.best_case_scenario
          .months_of_runway * 30;
    }

    if (whatIfScenarios.growth_projections?.annual_growth_rate) {
      growthRate = whatIfScenarios.growth_projections.annual_growth_rate / 12; // Monthly growth rate
    }

    return {
      cashFlow: { dates, projected, optimistic, pessimistic },
      scenarios,
      metrics: { breakEvenPoint, cashRunway, burnRate, growthRate },
    };
  };

  const createCustomScenario = () => {
    if (!forecastData) return;

    const { revenue, expenses } = forecastData.scenarios[0];
    const newRevenue = revenue * (1 + scenarioInputs.revenueChange / 100);
    const newExpenses = expenses * (1 + scenarioInputs.expenseChange / 100);
    const newProfit = newRevenue - newExpenses;
    const newCashFlow =
      forecastData.scenarios[0].cashFlow *
      (1 + scenarioInputs.cashFlowChange / 100);

    const newScenario = {
      name: "Custom Scenario",
      revenue: newRevenue,
      expenses: newExpenses,
      profit: newProfit,
      cashFlow: newCashFlow,
      probability: 0.1,
    };

    setForecastData({
      ...forecastData,
      scenarios: [...forecastData.scenarios, newScenario],
    });
  };

  useEffect(() => {
    generateForecast();
  }, [selectedPeriod]);

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
            <AlertDescription className="text-red-800">
              {error}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <Calculator className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            No Forecast Data Available
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload financial reports to generate cash flow forecasts and
            scenario analysis.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <a href="/upload">Upload Report</a>
          </Button>
        </div>
      </div>
    );
  }

  const { cashFlow, scenarios, metrics } = forecastData;

  // Prepare chart data
  const chartData = cashFlow.dates.map((date, index) => ({
    date,
    projected: cashFlow.projected[index],
    optimistic: cashFlow.optimistic[index],
    pessimistic: cashFlow.pessimistic[index],
  }));

  const scenarioChartData = scenarios.map((scenario) => ({
    name: scenario.name,
    profit: scenario.profit,
    cashFlow: scenario.cashFlow,
  }));

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-lg sm:rounded-xl lg:rounded-3xl p-3 sm:p-5 lg:p-8 shadow-md sm:shadow-xl lg:shadow-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-md sm:shadow-xl lg:shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <Calculator className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="absolute -top-1 sm:-top-1.5 lg:-top-2 -right-1 sm:-right-1.5 lg:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Financial Forecasting
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1">
                  Project future cash flows and analyze different business
                  scenarios
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="flex-1 sm:flex-none w-full sm:w-32 text-xs sm:text-sm bg-white/90 backdrop-blur-sm border-blue-200 hover:border-blue-300 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">180 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={generateForecast}
                disabled={loading}
                className="flex-1 sm:flex-none text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md sm:shadow-lg lg:shadow-xl hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Forecast Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md sm:shadow-lg lg:shadow-xl border border-blue-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">
              {formatPercentage(metrics.breakEvenPoint)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Break-Even Point
            </div>
            <p className="text-xs text-blue-600 mt-0.5 sm:mt-1 font-medium">
              Revenue needed to cover costs
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md sm:shadow-lg lg:shadow-xl border border-green-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold text-green-600 truncate">
              {Math.round(metrics.cashRunway)} days
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Cash Runway</div>
            <p className="text-xs text-green-600 mt-0.5 sm:mt-1 font-medium">
              Time until cash runs out
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md sm:shadow-lg lg:shadow-xl border border-red-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold text-red-600 truncate">
              {formatCurrency(metrics.burnRate)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Monthly Burn Rate
            </div>
            <p className="text-xs text-red-600 mt-0.5 sm:mt-1 font-medium">
              Daily cash consumption
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md sm:shadow-lg lg:shadow-xl border border-purple-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold text-purple-600 truncate">
              {formatPercentage(metrics.growthRate * 100)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Growth Rate</div>
            <p className="text-xs text-purple-600 mt-0.5 sm:mt-1 font-medium">
              Monthly growth projection
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Cash Flow Projection Chart */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-blue-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-blue-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Cash Flow Projection
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Projected cash flow over the next {selectedPeriod} days
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-4 lg:p-6 pt-2 sm:pt-3 lg:pt-4">
            <div className="h-[250px] sm:h-[300px] lg:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: window.innerWidth < 640 ? 10 : 12,
                    }}
                    height={35}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: window.innerWidth < 640 ? 10 : 12,
                    }}
                    tickFormatter={(value) =>
                      formatCurrency(Number(value)).replace(/\.00$/, "")
                    }
                    width={window.innerWidth < 640 ? 50 : 60}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize:
                        window.innerWidth < 640 ? "0.75rem" : "0.875rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#3b82f6"
                    strokeWidth={window.innerWidth < 640 ? 2 : 3}
                    name="Projected"
                    dot={{
                      r: window.innerWidth < 640 ? 3 : 4,
                      strokeWidth: window.innerWidth < 640 ? 1 : 2,
                    }}
                    activeDot={{
                      r: window.innerWidth < 640 ? 4 : 6,
                      strokeWidth: window.innerWidth < 640 ? 1 : 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#10b981"
                    strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                    strokeDasharray="5 5"
                    name="Optimistic"
                    dot={{
                      r: window.innerWidth < 640 ? 2 : 3,
                      strokeWidth: window.innerWidth < 640 ? 1 : 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pessimistic"
                    stroke="#ef4444"
                    strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                    strokeDasharray="5 5"
                    name="Pessimistic"
                    dot={{
                      r: window.innerWidth < 640 ? 2 : 3,
                      strokeWidth: window.innerWidth < 640 ? 1 : 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scenario Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 lg:gap-8">
        {/* Enhanced Scenario Comparison */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-green-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-green-100">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                  <PieChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Scenario Analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Compare different business scenarios and their impact
                  </p>
                </div>
              </div>
            </div>
            <div className="p-2 sm:p-4 lg:p-6 pt-2 sm:pt-3 lg:pt-4">
              <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: window.innerWidth < 640 ? 10 : 12,
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: window.innerWidth < 640 ? 10 : 12,
                      }}
                      tickFormatter={(value) =>
                        formatCurrency(Number(value)).replace(/\.00$/, "")
                      }
                      width={window.innerWidth < 640 ? 50 : 60}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize:
                          window.innerWidth < 640 ? "0.75rem" : "0.875rem",
                      }}
                    />
                    <Bar
                      dataKey="profit"
                      fill="#10b981"
                      name="Profit"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cashFlow"
                      fill="#3b82f6"
                      name="Cash Flow"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Custom Scenario Builder */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-purple-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-purple-100">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                  <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Custom Scenario Builder
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Create and analyze custom business scenarios
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label
                    htmlFor="revenue-change"
                    className="text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Revenue Change (%)
                  </Label>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setScenarioInputs((prev) => ({
                          ...prev,
                          revenueChange: prev.revenueChange - 5,
                        }))
                      }
                      className="h-7 w-7 p-0 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    >
                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                    <Input
                      id="revenue-change"
                      type="number"
                      value={scenarioInputs.revenueChange}
                      onChange={(e) =>
                        setScenarioInputs((prev) => ({
                          ...prev,
                          revenueChange: Number(e.target.value),
                        }))
                      }
                      className="text-center border-purple-200 focus:border-purple-400 focus:ring-purple-400 text-xs sm:text-sm h-7 sm:h-8"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setScenarioInputs((prev) => ({
                          ...prev,
                          revenueChange: prev.revenueChange + 5,
                        }))
                      }
                      className="h-7 w-7 p-0 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    >
                      <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="expense-change"
                    className="text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Expense Change (%)
                  </Label>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setScenarioInputs((prev) => ({
                          ...prev,
                          expenseChange: prev.expenseChange - 5,
                        }))
                      }
                      className="h-7 w-7 p-0 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    >
                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                    <Input
                      id="expense-change"
                      type="number"
                      value={scenarioInputs.expenseChange}
                      onChange={(e) =>
                        setScenarioInputs((prev) => ({
                          ...prev,
                          expenseChange: Number(e.target.value),
                        }))
                      }
                      className="text-center border-purple-200 focus:border-purple-400 focus:ring-purple-400 text-xs sm:text-sm h-7 sm:h-8"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setScenarioInputs((prev) => ({
                          ...prev,
                          expenseChange: prev.expenseChange + 5,
                        }))
                      }
                      className="h-7 w-7 p-0 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                    >
                      <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="cashflow-change"
                  className="text-xs sm:text-sm font-medium text-gray-700"
                >
                  Cash Flow Change (%)
                </Label>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        cashFlowChange: prev.cashFlowChange - 5,
                      }))
                    }
                    className="h-7 w-7 p-0 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  >
                    <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                  <Input
                    id="cashflow-change"
                    type="number"
                    value={scenarioInputs.cashFlowChange}
                    onChange={(e) =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        cashFlowChange: Number(e.target.value),
                      }))
                    }
                    className="text-center border-purple-200 focus:border-purple-400 focus:ring-purple-400 text-xs sm:text-sm h-7 sm:h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        cashFlowChange: prev.cashFlowChange + 5,
                      }))
                    }
                    className="h-7 w-7 p-0 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  >
                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={createCustomScenario}
                className="w-full text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md sm:shadow-lg lg:shadow-xl hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 h-8 sm:h-9 lg:h-10"
              >
                <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Create Custom Scenario
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Detailed Scenario Table */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-600 opacity-10 rounded-lg sm:rounded-xl lg:rounded-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-orange-200 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-orange-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Scenario Details
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Comprehensive breakdown of all scenarios with probabilities
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-4 lg:p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-orange-100">
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 bg-orange-50 rounded-l-lg">
                      Scenario
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 bg-orange-50 hidden sm:table-cell">
                      Revenue
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 bg-orange-50 hidden sm:table-cell">
                      Expenses
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 bg-orange-50">
                      Profit
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 bg-orange-50">
                      Cash Flow
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-700 bg-orange-50 rounded-r-lg">
                      Probability
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios
                    .filter(
                      (scenario) =>
                        scenario.revenue !== 0 || scenario.expenses !== 0
                    )
                    .map((scenario, index) => (
                      <tr
                        key={index}
                        className="border-b border-orange-50 hover:bg-orange-50/30 transition-colors duration-200"
                      >
                        <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm text-gray-800">
                          {scenario.name}
                        </td>
                        <td className="p-2 sm:p-3 text-green-600 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                          {formatCurrency(scenario.revenue)}
                        </td>
                        <td className="p-2 sm:p-3 text-red-600 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                          {formatCurrency(scenario.expenses)}
                        </td>
                        <td
                          className={`p-2 sm:p-3 font-semibold text-xs sm:text-sm ${
                            scenario.profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(scenario.profit)}
                        </td>
                        <td
                          className={`p-2 sm:p-3 font-semibold text-xs sm:text-sm ${
                            scenario.cashFlow >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(scenario.cashFlow)}
                        </td>
                        <td className="p-2 sm:p-3">
                          <Badge
                            variant="secondary"
                            className="font-medium text-xs h-5 sm:h-6 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200 hover:from-orange-200 hover:to-yellow-200"
                          >
                            {formatPercentage(scenario.probability * 100)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

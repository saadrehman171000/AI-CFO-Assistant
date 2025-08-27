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
import BranchUploadSelector from "@/components/company/branch-upload-selector";
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
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  const generateForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      let analysisData = null;

      // If a specific analysis is selected, fetch that data
      if (selectedAnalysisId) {
        const analysisResponse = await fetch(
          `/api/analysis-data?analysisId=${selectedAnalysisId}`
        );

        if (analysisResponse.ok) {
          const result = await analysisResponse.json();
          if (result.success && result.analysisData) {
            analysisData = result.analysisData;
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
          const result = await analysisResponse.json();
          if (result.success && result.analysis) {
            // Now fetch the actual analysis data
            const dataResponse = await fetch(
              `/api/analysis-data?analysisId=${result.analysis.id}`
            );
            if (dataResponse.ok) {
              const dataResult = await dataResponse.json();
              if (dataResult.success && dataResult.analysisData) {
                analysisData = dataResult.analysisData;
              }
            }
          }
        }
      }

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

  // Auto-generate forecast when component mounts or selection changes
  useEffect(() => {
    // Only generate forecast if we have valid selection or if it's the initial load
    if (selectedBranchId !== null || selectedAnalysisId !== null || forecastData === null) {
      generateForecast();
    }
  }, [selectedBranchId, selectedAnalysisId]);

  const handleSelectionChange = (branchId: string | null, analysisId: string | null) => {
    // Prevent unnecessary re-renders if values haven't changed
    if (selectedBranchId !== branchId || selectedAnalysisId !== analysisId) {
      console.log('Forecasting: Selection changed:', { branchId, analysisId });
      setSelectedBranchId(branchId);
      setSelectedAnalysisId(analysisId);
    }
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
                <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
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
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            No Forecast Data Available
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Upload financial reports to generate cash flow forecasts and
            scenario analysis.
          </p>
          <Button asChild className="w-full sm:w-auto">
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Branch & Upload Selector */}
      <BranchUploadSelector
        onSelectionChange={handleSelectionChange}
        title="Select Forecasting Data Source"
        description="Choose a branch and financial analysis to generate forecasts"
        showAllBranchesOption={true}
      />

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Financial Forecasting
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Project future cash flows and analyze different business scenarios
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-32">
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
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Forecast Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-2 truncate">
              {formatPercentage(metrics.breakEvenPoint)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-1">
              Break-Even Point
            </div>
            <p className="text-xs text-blue-600 font-medium">
              Revenue needed to cover costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-2">
              {Math.round(metrics.cashRunway)} days
            </div>
            <div className="text-sm text-gray-600 mb-1">Cash Runway</div>
            <p className="text-xs text-emerald-600 font-medium">
              Time until cash runs out
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
              {formatCurrency(metrics.burnRate)}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Monthly Burn Rate
            </div>
            <p className="text-xs text-red-600 font-medium">
              Daily cash consumption
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatPercentage(metrics.growthRate * 100)}
            </div>
            <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
            <p className="text-xs text-purple-600 font-medium">
              Monthly growth projection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Projection Chart */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Cash Flow Projection</CardTitle>
              <CardDescription>
                Projected cash flow over the next {selectedPeriod} days
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  height={35}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    formatCurrency(Number(value)).replace(/\.00$/, "")
                  }
                  width={60}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Projected"
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="optimistic"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Optimistic"
                  dot={{ r: 3, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="pessimistic"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Pessimistic"
                  dot={{ r: 3, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Comparison */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Scenario Analysis</CardTitle>
                <CardDescription>
                  Compare different business scenarios and their impact
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      formatCurrency(Number(value)).replace(/\.00$/, "")
                    }
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
          </CardContent>
        </Card>

        {/* Custom Scenario Builder */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Custom Scenario Builder</CardTitle>
                <CardDescription>
                  Create and analyze custom business scenarios
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue-change" className="text-sm font-medium text-gray-700">
                  Revenue Change (%)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        revenueChange: prev.revenueChange - 5,
                      }))
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
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
                    className="text-center h-8"
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
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="expense-change" className="text-sm font-medium text-gray-700">
                  Expense Change (%)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        expenseChange: prev.expenseChange - 5,
                      }))
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
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
                    className="text-center h-8"
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
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cashflow-change" className="text-sm font-medium text-gray-700">
                Cash Flow Change (%)
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setScenarioInputs((prev) => ({
                      ...prev,
                      cashFlowChange: prev.cashFlowChange - 5,
                    }))
                  }
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
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
                  className="text-center h-8"
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
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button onClick={createCustomScenario} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Create Custom Scenario
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Details Table */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Scenario Details</CardTitle>
              <CardDescription>
                Comprehensive breakdown of all scenarios with probabilities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-sm text-gray-700 bg-slate-50 rounded-l-lg">
                    Scenario
                  </th>
                  <th className="text-left p-3 font-medium text-sm text-gray-700 bg-slate-50 hidden sm:table-cell">
                    Revenue
                  </th>
                  <th className="text-left p-3 font-medium text-sm text-gray-700 bg-slate-50 hidden sm:table-cell">
                    Expenses
                  </th>
                  <th className="text-left p-3 font-medium text-sm text-gray-700 bg-slate-50">
                    Profit
                  </th>
                  <th className="text-left p-3 font-medium text-sm text-gray-700 bg-slate-50">
                    Cash Flow
                  </th>
                  <th className="text-left p-3 font-medium text-sm text-gray-700 bg-slate-50 rounded-r-lg">
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
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 font-medium text-sm text-gray-800">
                        {scenario.name}
                      </td>
                      <td className="p-3 text-emerald-600 font-semibold text-sm hidden sm:table-cell">
                        {formatCurrency(scenario.revenue)}
                      </td>
                      <td className="p-3 text-red-600 font-semibold text-sm hidden sm:table-cell">
                        {formatCurrency(scenario.expenses)}
                      </td>
                      <td
                        className={`p-3 font-semibold text-sm ${scenario.profit >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                          }`}
                      >
                        {formatCurrency(scenario.profit)}
                      </td>
                      <td
                        className={`p-3 font-semibold text-sm ${scenario.cashFlow >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                          }`}
                      >
                        {formatCurrency(scenario.cashFlow)}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">
                          {formatPercentage(scenario.probability * 100)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

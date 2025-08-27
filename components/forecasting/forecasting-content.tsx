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

  const generateForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      let analysisData = null;

      // If a specific analysis is selected, fetch that data
      if (selectedAnalysisId && typeof selectedAnalysisId === 'string') {
        try {
          const analysisResponse = await fetch(
            `/api/analysis-data?analysisId=${encodeURIComponent(selectedAnalysisId)}`
          );

          if (analysisResponse.ok) {
            const result = await analysisResponse.json();
            if (result?.success && result?.analysisData) {
              analysisData = result.analysisData;
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
                    analysisData = dataResult.analysisData;
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

      // Check if we have valid data in any format
      if (analysisData) {
        try {
          console.log("Raw forecasting data:", JSON.stringify(analysisData));
          
          // Create a consistent data object regardless of nesting structure
          let dataObj: any = { analysis: {} };
          
          // Get file info from wherever it exists
          dataObj.file_info = 
            analysisData?.analysisData?.file_info || 
            analysisData?.analysisData?.analysis?.file_info || 
            analysisData?.file_info || 
            analysisData?.metadata || 
            {};
            
          // Add debugging to see what structure we're dealing with
          console.log("Forecasting - API response structure:", {
            hasAnalysisAnalysis: !!analysisData?.analysis?.analysis,
            hasAnalysisData: !!analysisData?.analysisData,
            hasAnalysis: !!analysisData?.analysis
          });

          // Handle the double-nested structure (analysisData.analysis.analysis)
          if (analysisData?.analysis?.analysis) {
            dataObj.analysis = analysisData.analysis.analysis;
            console.log("Using double-nested structure for forecasting");
          } 
          // Handle the deeply nested structure case (analysisData.analysisData.analysis.analysis)
          else if (analysisData?.analysisData?.analysis?.analysis) {
            dataObj.analysis = analysisData.analysisData.analysis.analysis;
            console.log("Using deeply nested structure for forecasting");
          } 
          // Handle the standard nested case (analysisData.analysis)
          else if (analysisData?.analysisData?.analysis) {
            dataObj.analysis = analysisData.analysisData.analysis;
            console.log("Using standard nested structure for forecasting");
          }
          // Handle direct analysis property
          else if (analysisData?.analysis) {
            dataObj.analysis = analysisData.analysis;
            console.log("Using direct analysis property for forecasting");
          }
          // Fallback
          else {
            console.log("No recognized structure for forecasting, using whole object");
            dataObj = analysisData;
          }
          
          console.log("Forecasting data object:", dataObj);
        
        // Debug cash flow values
        console.log("Cash flow data:", {
          free_cash_flow: safeGet(dataObj, 'analysis.cash_flow_analysis.cash_position.free_cash_flow'),
          net_change_in_cash: safeGet(dataObj, 'analysis.cash_flow_analysis.cash_position.net_change_in_cash'),
          ending_cash: safeGet(dataObj, 'analysis.cash_flow_analysis.cash_position.ending_cash')
        });
        
        // Use real financial data from the API with null safety
        const metrics = {
          totalRevenue: safeNumber(
            safeGet(dataObj, 'analysis.profit_and_loss.revenue_analysis.total_revenue')
          ),
          totalExpenses: safeNumber(
            safeGet(dataObj, 'analysis.profit_and_loss.cost_structure.total_expenses')
          ),
          netProfit: safeNumber(
            safeGet(dataObj, 'analysis.profit_and_loss.profitability_metrics.net_income')
          ),
          netCashFlow: safeNumber(
            safeGet(dataObj, 'analysis.cash_flow_analysis.cash_position.free_cash_flow') || 
            safeGet(dataObj, 'analysis.cash_flow_analysis.cash_position.net_change_in_cash')
          ),
          // Other metrics with null safety
          grossMargin: safeNumber(
            safeGet(dataObj, 'analysis.profit_and_loss.profitability_metrics.margins.gross_margin')
          ),
          netMargin: safeNumber(
            safeGet(dataObj, 'analysis.profit_and_loss.profitability_metrics.margins.net_margin')
          ),
          totalAssets: safeNumber(
            safeGet(dataObj, 'analysis.balance_sheet.assets.total_assets')
          ),
          totalLiabilities: safeNumber(
            safeGet(dataObj, 'analysis.balance_sheet.liabilities.total_liabilities')
          ),
          totalEquity: safeNumber(
            safeGet(dataObj, 'analysis.balance_sheet.equity.total_equity')
          ),
          cashFlowFromOperations: safeNumber(
            safeGet(dataObj, 'analysis.cash_flow_analysis.operating_activities.net_cash_from_operations')
          ),
        };

        // Use what-if scenario data if available, or generate it
        const whatIfScenarios = safeGet(dataObj, 'analysis.what_if_scenarios');
        if (whatIfScenarios && typeof whatIfScenarios === 'object') {
          const forecast = generateForecastFromScenarios(
            whatIfScenarios,
            metrics,
            safeNumber(parseInt(selectedPeriod), 90)
          );
          setForecastData(forecast);
        } else {
          // Fall back to generating forecast data
          const forecast = generateForecastData(
            metrics,
            safeNumber(parseInt(selectedPeriod), 90)
          );
          setForecastData(forecast);
        }
        } catch (error) {
          console.error("Error processing forecasting data:", error);
          // Generate basic forecast data as fallback
          const basicForecast = generateForecastData(
            {
              totalRevenue: 100000,
              totalExpenses: 80000,
              netProfit: 20000,
              grossMargin: 0.5,
              netMargin: 0.2,
              totalAssets: 200000,
              totalLiabilities: 100000,
              totalEquity: 100000,
              cashFlowFromOperations: 25000,
              netCashFlow: 15000,
            },
            safeNumber(parseInt(selectedPeriod), 90)
          );
          setForecastData(basicForecast);
        }
      } else {
        throw new Error("Invalid or missing financial analysis data");
      }
    } catch (err) {
      console.error('Error generating forecast:', err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while generating forecast");
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateForecastData = (
    metrics: FinancialMetrics | null,
    days: number
  ): ForecastData => {
    const dates: string[] = [];
    const projected: number[] = [];
    const optimistic: number[] = [];
    const pessimistic: number[] = [];

    // Validate inputs
    const safeDays = safeNumber(days, 90);
    const safeMetrics = metrics || {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      grossMargin: 0,
      netMargin: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      cashFlowFromOperations: 0,
      netCashFlow: 0,
    };

    const currentDate = new Date();
    // Ensure we have a valid net cash flow value
    let netCashFlow = safeNumber(safeMetrics.netCashFlow, 0);
    
    // If net cash flow is zero, use ending cash as a fallback
    if (netCashFlow === 0 && safeMetrics.cashFlowFromOperations) {
      netCashFlow = safeNumber(safeMetrics.cashFlowFromOperations, 0);
      console.log("Using cash flow from operations as fallback:", netCashFlow);
    }
    
    // Ensure we have a non-zero value for projections
    if (netCashFlow === 0) {
      // Derive a simple cash flow from revenue - expenses
      netCashFlow = safeNumber(safeMetrics.totalRevenue - safeMetrics.totalExpenses, 1000);
      console.log("Derived cash flow from revenue/expenses:", netCashFlow);
    }
    
    const dailyCashFlow = netCashFlow / 30; // Assume monthly data

    for (let i = 0; i < safeDays; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      const baseProjection = netCashFlow + dailyCashFlow * i;
      projected.push(baseProjection);
      optimistic.push(baseProjection * 1.2);
      pessimistic.push(baseProjection * 0.8);
    }

    const totalRevenue = safeNumber(safeMetrics.totalRevenue, 0);
    const totalExpenses = safeNumber(safeMetrics.totalExpenses, 0);
    const netProfit = safeNumber(safeMetrics.netProfit, 0);

    const scenarios = [
      {
        name: "Base Case",
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: netProfit,
        cashFlow: netCashFlow,
        probability: 0.6,
      },
      {
        name: "Optimistic",
        revenue: totalRevenue * 1.2,
        expenses: totalExpenses * 1.05,
        profit: totalRevenue * 1.2 - totalExpenses * 1.05,
        cashFlow: netCashFlow * 1.3,
        probability: 0.2,
      },
      {
        name: "Pessimistic",
        revenue: totalRevenue * 0.8,
        expenses: totalExpenses * 1.1,
        profit: totalRevenue * 0.8 - totalExpenses * 1.1,
        cashFlow: netCashFlow * 0.7,
        probability: 0.2,
      },
    ];

    const breakEvenPoint = totalRevenue > 0 && totalExpenses > 0
      ? (totalExpenses / totalRevenue) * 100
      : 0;
    const cashRunway = totalExpenses > 0 && netCashFlow < 0
      ? Math.abs(netCashFlow / (totalExpenses / 30))
      : netCashFlow > 0 ? 999 : 0; // If positive cash flow, runway is effectively infinite
    const burnRate = totalExpenses > 0 ? totalExpenses / 30 : 0;
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
    // Validate inputs and prevent unnecessary re-renders if values haven't changed
    const safeBranchId = branchId && typeof branchId === 'string' ? branchId : null;
    const safeAnalysisId = analysisId && typeof analysisId === 'string' ? analysisId : null;

    if (selectedBranchId !== safeBranchId || selectedAnalysisId !== safeAnalysisId) {
      console.log('Forecasting: Selection changed:', { branchId: safeBranchId, analysisId: safeAnalysisId });
      setSelectedBranchId(safeBranchId);
      setSelectedAnalysisId(safeAnalysisId);
      // Clear any previous errors when selection changes
      setError(null);
    }
  };

  // Generate forecast from what-if scenarios data with null safety
  const generateForecastFromScenarios = (
    whatIfScenarios: any,
    metrics: FinancialMetrics | null,
    days: number
  ): ForecastData => {
    const dates: string[] = [];
    const projected: number[] = [];
    const optimistic: number[] = [];
    const pessimistic: number[] = [];

    // Validate inputs
    const safeDays = safeNumber(days, 90);
    const safeMetrics = metrics || {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      grossMargin: 0,
      netMargin: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      cashFlowFromOperations: 0,
      netCashFlow: 0,
    };

    const currentDate = new Date();

    // Calculate daily cash flow rates using baseline and scenario data if available
    let baselineCashFlow = safeNumber(safeMetrics.netCashFlow, 0);
    
    // If baseline cash flow is zero, use cash flow from operations as fallback
    if (baselineCashFlow === 0 && safeMetrics.cashFlowFromOperations) {
      baselineCashFlow = safeNumber(safeMetrics.cashFlowFromOperations, 0);
      console.log("Using cash flow from operations as fallback in scenarios:", baselineCashFlow);
    }
    
    // Ensure we have a non-zero value for scenario projections
    if (baselineCashFlow === 0) {
      // Derive a simple cash flow from revenue - expenses
      baselineCashFlow = safeNumber(safeMetrics.totalRevenue - safeMetrics.totalExpenses, 1000);
      console.log("Derived cash flow from revenue/expenses for scenarios:", baselineCashFlow);
    }
    
    let optimisticCashFlow = baselineCashFlow * 1.2;
    let pessimisticCashFlow = baselineCashFlow * 0.8;

    // Use what-if scenario data if available with null safety
    const revenueImpactAnalysis = safeGet(whatIfScenarios, 'revenue_impact_analysis');
    if (revenueImpactAnalysis && typeof revenueImpactAnalysis === 'object') {
      const baselineScenario = safeGet(revenueImpactAnalysis, 'baseline_scenario.cash_flow');
      if (baselineScenario !== undefined) {
        baselineCashFlow = safeNumber(baselineScenario, baselineCashFlow);
      }

      const revenueIncrease = safeGet(revenueImpactAnalysis, 'revenue_increase_20_percent.cash_flow');
      if (revenueIncrease !== undefined) {
        optimisticCashFlow = safeNumber(revenueIncrease, optimisticCashFlow);
      }

      const revenueDecrease = safeGet(revenueImpactAnalysis, 'revenue_decrease_20_percent.cash_flow');
      if (revenueDecrease !== undefined) {
        pessimisticCashFlow = safeNumber(revenueDecrease, pessimisticCashFlow);
      }
    }

    const dailyCashFlowBase = baselineCashFlow / 30;
    const dailyCashFlowOpt = optimisticCashFlow / 30;
    const dailyCashFlowPess = pessimisticCashFlow / 30;

    // Generate the dates and projections
    for (let i = 0; i < safeDays; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      projected.push(baselineCashFlow + dailyCashFlowBase * i);
      optimistic.push(optimisticCashFlow + dailyCashFlowOpt * i);
      pessimistic.push(pessimisticCashFlow + dailyCashFlowPess * i);
    }

    // Build scenarios from what-if data with null safety
    const totalRevenue = safeNumber(safeMetrics.totalRevenue, 0);
    const totalExpenses = safeNumber(safeMetrics.totalExpenses, 0);
    const netProfit = safeNumber(safeMetrics.netProfit, 0);

    const scenarios = [
      {
        name: "Baseline",
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: netProfit,
        cashFlow: baselineCashFlow,
        probability: 0.6,
      },
    ];

    // Add optimistic scenario if available with null safety
    const revenueIncrease20 = safeGet(revenueImpactAnalysis, 'revenue_increase_20_percent');
    if (revenueIncrease20 && typeof revenueIncrease20 === 'object') {
      scenarios.push({
        name: "Revenue +20%",
        revenue: safeNumber(revenueIncrease20.revenue, totalRevenue * 1.2),
        expenses: totalExpenses,
        profit: safeNumber(revenueIncrease20.net_income, netProfit * 1.3),
        cashFlow: safeNumber(revenueIncrease20.cash_flow, optimisticCashFlow),
        probability: 0.2,
      });
    } else {
      // Add fallback optimistic scenario
      scenarios.push({
        name: "Optimistic",
        revenue: totalRevenue * 1.2,
        expenses: totalExpenses * 1.05,
        profit: totalRevenue * 1.2 - totalExpenses * 1.05,
        cashFlow: optimisticCashFlow,
        probability: 0.2,
      });
    }

    // Add pessimistic scenario if available with null safety
    const revenueDecrease20 = safeGet(revenueImpactAnalysis, 'revenue_decrease_20_percent');
    if (revenueDecrease20 && typeof revenueDecrease20 === 'object') {
      scenarios.push({
        name: "Revenue -20%",
        revenue: safeNumber(revenueDecrease20.revenue, totalRevenue * 0.8),
        expenses: totalExpenses,
        profit: safeNumber(revenueDecrease20.net_income, netProfit * 0.7),
        cashFlow: safeNumber(revenueDecrease20.cash_flow, pessimisticCashFlow),
        probability: 0.2,
      });
    } else {
      // Add fallback pessimistic scenario
      scenarios.push({
        name: "Pessimistic",
        revenue: totalRevenue * 0.8,
        expenses: totalExpenses * 1.1,
        profit: totalRevenue * 0.8 - totalExpenses * 1.1,
        cashFlow: pessimisticCashFlow,
        probability: 0.2,
      });
    }

    // Add cost optimization scenario if available with null safety
    const costOptimizationScenarios = safeGet(whatIfScenarios, 'cost_optimization_scenarios');
    const fixedCostReduction = safeGet(costOptimizationScenarios, 'fixed_cost_reduction_15_percent');
    if (fixedCostReduction && typeof fixedCostReduction === 'object') {
      const costSavings = safeNumber(fixedCostReduction.cost_savings, totalExpenses * 0.15);
      const netIncomeImpact = safeNumber(fixedCostReduction.net_income_impact, totalExpenses * 0.15);
      const cashFlowImpact = safeNumber(fixedCostReduction.cash_flow_impact, totalExpenses * 0.15);

      scenarios.push({
        name: "Cost -15%",
        revenue: totalRevenue,
        expenses: totalExpenses - costSavings,
        profit: netProfit + netIncomeImpact,
        cashFlow: baselineCashFlow + cashFlowImpact,
        probability: 0.3,
      });
    }

    // Calculate metrics from what-if scenarios and break-even analysis with null safety
    let breakEvenPoint = totalRevenue > 0 && totalExpenses > 0
      ? (totalExpenses / totalRevenue) * 100
      : 0;
    let cashRunway = totalExpenses > 0 && baselineCashFlow < 0
      ? Math.abs(baselineCashFlow / (totalExpenses / 30))
      : baselineCashFlow > 0 ? 999 : 0; // If positive cash flow, runway is effectively infinite
    let burnRate = totalExpenses > 0 ? totalExpenses / 30 : 0;
    let growthRate = 0.05; // Default to 5%

    // Use what-if scenario data if available with null safety
    const cashFlowStressTesting = safeGet(whatIfScenarios, 'cash_flow_stress_testing');
    if (cashFlowStressTesting && typeof cashFlowStressTesting === 'object') {
      const breakEvenAnalysis = safeGet(cashFlowStressTesting, 'break_even_analysis');
      if (breakEvenAnalysis && typeof breakEvenAnalysis === 'object') {
        const breakEvenRevenue = safeNumber(breakEvenAnalysis.break_even_revenue);
        if (breakEvenRevenue > 0 && totalRevenue > 0) {
          breakEvenPoint = (breakEvenRevenue / totalRevenue) * 100;
        }
      }

      const bestCaseScenario = safeGet(cashFlowStressTesting, 'best_case_scenario');
      if (bestCaseScenario && typeof bestCaseScenario === 'object') {
        const monthsOfRunway = safeNumber(bestCaseScenario.months_of_runway);
        if (monthsOfRunway > 0) {
          cashRunway = monthsOfRunway * 30;
        }
      }
    }

    const growthProjections = safeGet(whatIfScenarios, 'growth_projections');
    if (growthProjections && typeof growthProjections === 'object') {
      const annualGrowthRate = safeNumber(growthProjections.annual_growth_rate);
      if (annualGrowthRate > 0) {
        growthRate = annualGrowthRate / 12; // Monthly growth rate
      }
    }

    return {
      cashFlow: { dates, projected, optimistic, pessimistic },
      scenarios,
      metrics: { breakEvenPoint, cashRunway, burnRate, growthRate },
    };
  };

  const createCustomScenario = () => {
    if (!forecastData?.scenarios || !Array.isArray(forecastData.scenarios) || forecastData.scenarios.length === 0) {
      console.warn('No forecast data or scenarios available for custom scenario creation');
      return;
    }

    const baseScenario = forecastData.scenarios[0];
    if (!baseScenario) {
      console.warn('No base scenario available');
      return;
    }

    const baseRevenue = safeNumber(baseScenario.revenue, 0);
    const baseExpenses = safeNumber(baseScenario.expenses, 0);
    const baseCashFlow = safeNumber(baseScenario.cashFlow, 0);

    const revenueChangePercent = safeNumber(scenarioInputs.revenueChange, 0);
    const expenseChangePercent = safeNumber(scenarioInputs.expenseChange, 0);
    const cashFlowChangePercent = safeNumber(scenarioInputs.cashFlowChange, 0);

    const newRevenue = baseRevenue * (1 + revenueChangePercent / 100);
    const newExpenses = baseExpenses * (1 + expenseChangePercent / 100);
    const newProfit = newRevenue - newExpenses;
    const newCashFlow = baseCashFlow * (1 + cashFlowChangePercent / 100);

    const newScenario = {
      name: "Custom Scenario",
      revenue: newRevenue,
      expenses: newExpenses,
      profit: newProfit,
      cashFlow: newCashFlow,
      probability: 0.1,
    };

    try {
      setForecastData({
        ...forecastData,
        scenarios: [...forecastData.scenarios, newScenario],
      });
    } catch (error) {
      console.error('Error creating custom scenario:', error);
    }
  };

  useEffect(() => {
    generateForecast();
  }, [selectedPeriod]);

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

  // Prepare chart data with null safety
  const chartData = safeArray(cashFlow?.dates).map((date, index) => ({
    date: safeString(date, `Day ${index + 1}`),
    projected: safeNumber(safeArray(cashFlow?.projected)[index], 0),
    optimistic: safeNumber(safeArray(cashFlow?.optimistic)[index], 0),
    pessimistic: safeNumber(safeArray(cashFlow?.pessimistic)[index], 0),
  }));

  const scenarioChartData = safeArray(scenarios).map((scenario) => ({
    name: safeString(scenario?.name, 'Unknown Scenario'),
    profit: safeNumber(scenario?.profit, 0),
    cashFlow: safeNumber(scenario?.cashFlow, 0),
  }));

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Branch & Upload Selector */}
      <BranchUploadSelector
        onSelectionChange={handleSelectionChange}
        title="Select Forecasting Data Source"
        description="Choose a branch and financial analysis to generate forecasts"
        showAllBranchesOption={true}
        initialBranchId={selectedBranchId}
        initialAnalysisId={selectedAnalysisId}
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
              {formatPercentage(safeNumber(metrics?.breakEvenPoint, 0))}
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
              {Math.round(safeNumber(metrics?.cashRunway, 0))} days
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
              {formatCurrency(safeNumber(metrics?.burnRate, 0))}
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
              {formatPercentage(safeNumber(metrics?.growthRate, 0) * 100)}
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
                    formatCurrency(safeNumber(value, 0)).replace(/\.00$/, "")
                  }
                  width={60}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(safeNumber(value, 0))}
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
                      formatCurrency(safeNumber(value, 0)).replace(/\.00$/, "")
                    }
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(safeNumber(value, 0))}
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
                    value={safeNumber(scenarioInputs.revenueChange, 0)}
                    onChange={(e) =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        revenueChange: safeNumber(e.target.value, 0),
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
                    value={safeNumber(scenarioInputs.expenseChange, 0)}
                    onChange={(e) =>
                      setScenarioInputs((prev) => ({
                        ...prev,
                        expenseChange: safeNumber(e.target.value, 0),
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
                  value={safeNumber(scenarioInputs.cashFlowChange, 0)}
                  onChange={(e) =>
                    setScenarioInputs((prev) => ({
                      ...prev,
                      cashFlowChange: safeNumber(e.target.value, 0),
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
                {safeArray(scenarios)
                  .filter(
                    (scenario) =>
                      safeNumber(scenario?.revenue, 0) !== 0 || safeNumber(scenario?.expenses, 0) !== 0
                  )
                  .map((scenario, index) => {
                    if (!scenario) return null;
                    const scenarioRevenue = safeNumber(scenario.revenue, 0);
                    const scenarioExpenses = safeNumber(scenario.expenses, 0);
                    const scenarioProfit = safeNumber(scenario.profit, 0);
                    const scenarioCashFlow = safeNumber(scenario.cashFlow, 0);
                    const scenarioProbability = safeNumber(scenario.probability, 0);

                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 font-medium text-sm text-gray-800">
                          {safeString(scenario.name, 'Unknown Scenario')}
                        </td>
                        <td className="p-3 text-emerald-600 font-semibold text-sm hidden sm:table-cell">
                          {formatCurrency(scenarioRevenue)}
                        </td>
                        <td className="p-3 text-red-600 font-semibold text-sm hidden sm:table-cell">
                          {formatCurrency(scenarioExpenses)}
                        </td>
                        <td
                          className={`p-3 font-semibold text-sm ${scenarioProfit >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                            }`}
                        >
                          {formatCurrency(scenarioProfit)}
                        </td>
                        <td
                          className={`p-3 font-semibold text-sm ${scenarioCashFlow >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                            }`}
                        >
                          {formatCurrency(scenarioCashFlow)}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            {formatPercentage(scenarioProbability * 100)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  }).filter(Boolean)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

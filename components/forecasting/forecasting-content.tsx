'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
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
  Minus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossMargin: number
  netMargin: number
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cashFlowFromOperations: number
  cashFlowFromInvesting: number
  cashFlowFromFinancing: number
  netCashFlow: number
  arDays: number
  apDays: number
  ebitda: number
  currentRatio: number
  quickRatio: number
  debtToEquityRatio: number
}

interface ForecastData {
  cashFlow: {
    dates: string[]
    projected: number[]
    optimistic: number[]
    pessimistic: number[]
  }
  scenarios: {
    name: string
    revenue: number
    expenses: number
    profit: number
    cashFlow: number
    probability: number
  }[]
  metrics: {
    breakEvenPoint: number
    cashRunway: number
    burnRate: number
    growthRate: number
  }
}

export default function ForecastingContent() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('90')
  const [scenarioInputs, setScenarioInputs] = useState({
    revenueChange: 0,
    expenseChange: 0,
    cashFlowChange: 0
  })

  const generateForecast = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate forecast generation based on dashboard data
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }
      
      const result = await response.json()
      if (result.success) {
        // Generate forecast data based on current metrics
        const { metrics } = result.data
        const forecast = generateForecastData(metrics, parseInt(selectedPeriod))
        setForecastData(forecast)
      } else {
        throw new Error(result.error || 'Failed to load financial data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateForecastData = (metrics: FinancialMetrics, days: number): ForecastData => {
    const dates = []
    const projected = []
    const optimistic = []
    const pessimistic = []
    
    const currentDate = new Date()
    const dailyCashFlow = (metrics.netCashFlow || 0) / 30 // Assume monthly data
    
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      const baseProjection = (metrics.netCashFlow || 0) + (dailyCashFlow * i)
      projected.push(baseProjection)
      optimistic.push(baseProjection * 1.2)
      pessimistic.push(baseProjection * 0.8)
    }

    const scenarios = [
      {
        name: 'Base Case',
        revenue: metrics.totalRevenue || 0,
        expenses: metrics.totalExpenses || 0,
        profit: metrics.netProfit || 0,
        cashFlow: metrics.netCashFlow || 0,
        probability: 0.6
      },
      {
        name: 'Optimistic',
        revenue: (metrics.totalRevenue || 0) * 1.2,
        expenses: (metrics.totalExpenses || 0) * 1.05,
        profit: ((metrics.totalRevenue || 0) * 1.2) - ((metrics.totalExpenses || 0) * 1.05),
        cashFlow: (metrics.netCashFlow || 0) * 1.3,
        probability: 0.2
      },
      {
        name: 'Pessimistic',
        revenue: (metrics.totalRevenue || 0) * 0.8,
        expenses: (metrics.totalExpenses || 0) * 1.1,
        profit: ((metrics.totalRevenue || 0) * 0.8) - ((metrics.totalExpenses || 0) * 1.1),
        cashFlow: (metrics.netCashFlow || 0) * 0.7,
        probability: 0.2
      }
    ]

    const breakEvenPoint = metrics.totalExpenses ? metrics.totalExpenses / (metrics.totalRevenue / 100) : 0
    const cashRunway = metrics.netCashFlow ? Math.abs(metrics.netCashFlow / (metrics.totalExpenses / 30)) : 0
    const burnRate = metrics.totalExpenses ? metrics.totalExpenses / 30 : 0
    const growthRate = 0.08 // Assume 8% monthly growth

    return {
      cashFlow: { dates, projected, optimistic, pessimistic },
      scenarios,
      metrics: { breakEvenPoint, cashRunway, burnRate, growthRate }
    }
  }

  const createCustomScenario = () => {
    if (!forecastData) return
    
    const { revenue, expenses } = forecastData.scenarios[0]
    const newRevenue = revenue * (1 + scenarioInputs.revenueChange / 100)
    const newExpenses = expenses * (1 + scenarioInputs.expenseChange / 100)
    const newProfit = newRevenue - newExpenses
    const newCashFlow = forecastData.scenarios[0].cashFlow * (1 + scenarioInputs.cashFlowChange / 100)

    const newScenario = {
      name: 'Custom Scenario',
      revenue: newRevenue,
      expenses: newExpenses,
      profit: newProfit,
      cashFlow: newCashFlow,
      probability: 0.1
    }

    setForecastData({
      ...forecastData,
      scenarios: [...forecastData.scenarios, newScenario]
    })
  }

  useEffect(() => {
    generateForecast()
  }, [selectedPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

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
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  if (!forecastData) {
    return (
      <div className="text-center py-12">
        <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Forecast Data Available</h3>
        <p className="text-muted-foreground mb-4">
          Upload financial reports to generate cash flow forecasts and scenario analysis.
        </p>
        <Button asChild>
          <a href="/upload">Upload Report</a>
        </Button>
      </div>
    )
  }

  const { cashFlow, scenarios, metrics } = forecastData

  // Prepare chart data
  const chartData = cashFlow.dates.map((date, index) => ({
    date,
    projected: cashFlow.projected[index],
    optimistic: cashFlow.optimistic[index],
    pessimistic: cashFlow.pessimistic[index]
  }))

  const scenarioChartData = scenarios.map(scenario => ({
    name: scenario.name,
    profit: scenario.profit,
    cashFlow: scenario.cashFlow
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Forecasting</h1>
          <p className="text-muted-foreground">
            Project future cash flows and analyze different business scenarios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="60">60 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="180">180 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateForecast} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break-Even Point</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(metrics.breakEvenPoint)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue needed to cover costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Runway</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.cashRunway)} days
            </div>
            <p className="text-xs text-muted-foreground">
              Time until cash runs out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.burnRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily cash consumption
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(metrics.growthRate * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly growth projection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Projection</CardTitle>
          <CardDescription>
            Projected cash flow over the next {selectedPeriod} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Projected"
              />
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Optimistic"
              />
              <Line 
                type="monotone" 
                dataKey="pessimistic" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Pessimistic"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Analysis</CardTitle>
            <CardDescription>
              Compare different business scenarios and their impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
                <Bar dataKey="cashFlow" fill="#3b82f6" name="Cash Flow" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Custom Scenario Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Scenario Builder</CardTitle>
            <CardDescription>
              Create and analyze custom business scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue-change">Revenue Change (%)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScenarioInputs(prev => ({ ...prev, revenueChange: prev.revenueChange - 5 }))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="revenue-change"
                    type="number"
                    value={scenarioInputs.revenueChange}
                    onChange={(e) => setScenarioInputs(prev => ({ ...prev, revenueChange: Number(e.target.value) }))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScenarioInputs(prev => ({ ...prev, revenueChange: prev.revenueChange + 5 }))}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="expense-change">Expense Change (%)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScenarioInputs(prev => ({ ...prev, expenseChange: prev.expenseChange - 5 }))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="expense-change"
                    type="number"
                    value={scenarioInputs.expenseChange}
                    onChange={(e) => setScenarioInputs(prev => ({ ...prev, expenseChange: Number(e.target.value) }))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScenarioInputs(prev => ({ ...prev, expenseChange: prev.expenseChange + 5 }))}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="cashflow-change">Cash Flow Change (%)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenarioInputs(prev => ({ ...prev, cashFlowChange: prev.cashFlowChange - 5 }))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  id="cashflow-change"
                  type="number"
                  value={scenarioInputs.cashFlowChange}
                  onChange={(e) => setScenarioInputs(prev => ({ ...prev, cashFlowChange: Number(e.target.value) }))}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenarioInputs(prev => ({ ...prev, cashFlowChange: prev.cashFlowChange + 5 }))}
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

      {/* Detailed Scenario Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
          <CardDescription>
            Comprehensive breakdown of all scenarios with probabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Scenario</th>
                  <th className="text-left p-3 font-medium">Revenue</th>
                  <th className="text-left p-3 font-medium">Expenses</th>
                  <th className="text-left p-3 font-medium">Profit</th>
                  <th className="text-left p-3 font-medium">Cash Flow</th>
                  <th className="text-left p-3 font-medium">Probability</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{scenario.name}</td>
                    <td className="p-3 text-green-600">{formatCurrency(scenario.revenue)}</td>
                    <td className="p-3 text-red-600">{formatCurrency(scenario.expenses)}</td>
                    <td className={`p-3 font-semibold ${scenario.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(scenario.profit)}
                    </td>
                    <td className={`p-3 font-semibold ${scenario.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Export Forecast
        </Button>
        <Button variant="outline" size="lg">
          <Share2 className="h-4 w-4 mr-2" />
          Share Analysis
        </Button>
        <Button size="lg">
          <Target className="h-4 w-4 mr-2" />
          Set Targets
        </Button>
      </div>
    </div>
  )
}

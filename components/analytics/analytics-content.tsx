'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
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
  Share2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts'

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

interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  impact: string
  suggestion?: string
}

interface AnalyticsData {
  metrics: FinancialMetrics
  insights: AIInsight[]
  trends: {
    revenue: number[]
    expenses: number[]
    profit: number[]
    months: string[]
  }
  topAccounts: {
    revenue: Array<{
      accountName: string
      amount: number
      dataType: string
    }>
    expenses: Array<{
      accountName: string
      amount: number
      dataType: string
    }>
    assets: Array<{
      accountName: string
      amount: number
      dataType: string
    }>
    liabilities: Array<{
      accountName: string
      amount: number
      dataType: string
    }>
  }
  reportInfo?: {
    latestReport: {
      id: string
      fileName: string
      reportType: string
      year: number
      month: number
      uploadDate: string
      totalRecords: number
    }
    totalReports: number
    totalRecords: number
  }
}

export default function AnalyticsContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [selectedReportType, setSelectedReportType] = useState('all')

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const result = await response.json()
      if (result.success) {
        setAnalyticsData(result.data)
      } else {
        throw new Error(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />
      case 'recommendation': return <Lightbulb className="h-4 w-4" />
      case 'summary': return <Eye className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

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
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
        <p className="text-muted-foreground mb-4">
          Upload your first financial report to see detailed analytics and insights.
        </p>
        <Button asChild>
          <a href="/upload">Upload Report</a>
        </Button>
      </div>
    )
  }

  const { metrics, insights, trends, topAccounts, reportInfo } = analyticsData

  // Prepare data for charts
  const trendData = trends.months.map((month, index) => ({
    month,
    revenue: trends.revenue[index] || 0,
    expenses: trends.expenses[index] || 0,
    profit: trends.profit[index] || 0
  }))

  const pieChartData = [
    { name: 'Revenue', value: metrics.totalRevenue || 0, color: '#10b981' },
    { name: 'Expenses', value: metrics.totalExpenses || 0, color: '#ef4444' },
    { name: 'Assets', value: metrics.totalAssets || 0, color: '#3b82f6' },
    { name: 'Liabilities', value: metrics.totalLiabilities || 0, color: '#f59e0b' }
  ].filter(item => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your financial performance with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="last12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="profit_loss">Profit & Loss</SelectItem>
              <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
              <SelectItem value="cash_flow">Cash Flow</SelectItem>
              <SelectItem value="trial_balance">Trial Balance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshAnalytics} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross Margin: {formatPercentage(metrics.grossMargin || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net Margin: {formatPercentage(metrics.netMargin || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitability</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(metrics.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(metrics.netProfit || 0) >= 0 ? 'Positive' : 'Negative'} Net Income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.currentRatio?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current Ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Trends Analysis</CardTitle>
            <CardDescription>Revenue, expenses, and profit trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="profit" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Composition Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Composition</CardTitle>
            <CardDescription>Breakdown of key financial components</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Operating Cash Flow</span>
              <Badge variant={metrics.cashFlowFromOperations >= 0 ? 'default' : 'destructive'}>
                {formatCurrency(metrics.cashFlowFromOperations || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Investing Cash Flow</span>
              <Badge variant={metrics.cashFlowFromInvesting >= 0 ? 'default' : 'destructive'}>
                {formatCurrency(metrics.cashFlowFromInvesting || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Net Cash Flow</span>
              <Badge variant={metrics.netCashFlow >= 0 ? 'default' : 'destructive'}>
                {formatCurrency(metrics.netCashFlow || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Ratios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Financial Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Ratio</span>
              <Badge variant={metrics.currentRatio > 1 ? 'default' : 'destructive'}>
                {metrics.currentRatio?.toFixed(2) || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Debt/Equity</span>
              <Badge variant={metrics.debtToEquityRatio < 1 ? 'default' : 'destructive'}>
                {metrics.debtToEquityRatio?.toFixed(2) || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Quick Ratio</span>
              <Badge variant={metrics.quickRatio > 1 ? 'default' : 'destructive'}>
                {metrics.quickRatio?.toFixed(2) || 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">EBITDA</span>
              <Badge variant="default">
                {formatCurrency(metrics.ebitda || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AR Days</span>
              <Badge variant={metrics.arDays < 30 ? 'default' : 'destructive'}>
                {metrics.arDays || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AP Days</span>
              <Badge variant={metrics.apDays < 45 ? 'default' : 'destructive'}>
                {metrics.apDays || 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI-Powered Financial Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis and recommendations based on your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <p className="text-sm font-medium mb-2">
                      <span className="text-blue-600">Impact:</span> {insight.impact}
                    </p>
                    {insight.suggestion && (
                      <p className="text-sm">
                        <span className="text-green-600 font-medium">Suggestion:</span> {insight.suggestion}
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
      <Card>
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
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
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
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-sm">{index + 1}</span>
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
                <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
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
                <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">{index + 1}</span>
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
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
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
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts'

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

interface DashboardData {
  sheetType: string
  summary: {
    totalDebits?: number
    totalCredits?: number
    imbalance?: number
    totalAssets?: number
    totalLiabilities?: number
    totalEquity?: number
    totalRevenue?: number
    totalExpenses?: number
    grossProfit?: number
    operatingIncome?: number
    netProfit?: number
    grossMargin?: number
    netMargin?: number
    topAccounts?: Array<{
      name: string
      debit?: number
      credit?: number
      amount?: number
      category?: string
    }>
    cashFlowOperating?: number
    cashFlowInvesting?: number
    cashFlowFinancing?: number
    netCashFlow?: number
  }
  accounts: Array<{
    name: string
    category: string
    debit?: number
    credit?: number
    amount?: number
    balance: number
  }>
  insights: Array<{
    type: 'trend' | 'anomaly' | 'recommendation'
    title: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
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

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const result = await response.json()
      if (result.success) {
        setDashboardData(result.data)
      } else {
        throw new Error(result.error || 'Failed to load dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshDashboard = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchDashboardData()
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
      case 'trend': return <TrendingUpIcon className="h-4 w-4 text-blue-500" />
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'summary': return <Eye className="h-4 w-4 text-green-500" />
      default: return <Zap className="h-4 w-4 text-purple-500" />
    }
  }

  const getTrendIcon = (value: number, previousValue?: number) => {
    if (!previousValue) return <MinusIcon className="h-4 w-4 text-gray-500" />
    if (value > previousValue) return <TrendingUpIcon className="h-4 w-4 text-green-500" />
    if (value < previousValue) return <TrendingDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-gray-500" />
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

  const filteredInsights = dashboardData?.insights.filter(insight => 
    selectedInsightType === 'all' || insight.type === selectedInsightType
  ) || []

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

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Financial Data Available</h3>
        <p className="text-muted-foreground mb-4">
          Upload your first financial report to see AI-powered insights and analytics.
        </p>
        <Button asChild>
          <a href="/upload">Upload Report</a>
        </Button>
      </div>
    )
  }

  const { summary, insights, trends, accounts, reportInfo, topAccounts } = dashboardData

  // Prepare chart data
  const chartData = trends.months.map((month, index) => ({
    month,
    revenue: trends.revenue[index] || 0,
    expenses: trends.expenses[index] || 0,
    profit: trends.profit[index] || 0
  }))

  // Prepare pie chart data for expense breakdown
  const expenseBreakdown = accounts
    .filter(account => account.category === 'EXPENSE')
    .slice(0, 5)
    .map((account, index) => ({
      name: account.name,
      value: Math.abs(account.amount || 0),
      color: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'][index % 5]
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and analytics for your financial data
          </p>
        </div>
        <Button onClick={refreshDashboard} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Report Info */}
      {reportInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Latest Report Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 truncate" title={reportInfo.latestReport.fileName}>
                  {reportInfo.latestReport.fileName}
                </div>
                <div className="text-sm text-muted-foreground">File Name</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {reportInfo.latestReport.reportType.replace('_', ' ')}
                </div>
                <div className="text-sm text-muted-foreground">Report Type</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {reportInfo.latestReport.totalRecords}
                </div>
                <div className="text-sm text-muted-foreground">Records Parsed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {reportInfo.totalReports}
                </div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalRevenue || 0)}
            </div>
            {summary.grossMargin && (
              <p className="text-xs text-muted-foreground">
                Gross Margin: {formatPercentage(summary.grossMargin)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.abs(summary.totalExpenses || 0))}
            </div>
            {summary.netMargin && (
              <p className="text-xs text-muted-foreground">
                Net Margin: {formatPercentage(summary.netMargin)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(summary.netProfit || 0) >= 0 ? 'Profit' : 'Loss'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalAssets || 0)}
            </div>
            {summary.topAccounts && (
              <p className="text-xs text-muted-foreground">
                {summary.topAccounts.length} Accounts
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Trends</CardTitle>
            <CardDescription>Revenue, expenses, and profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
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

        {/* Expense Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Top expense categories by amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
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
          </CardContent>
        </Card>
      </div>

      {/* Top Accounts with Enhanced Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Accounts by Category</CardTitle>
          <CardDescription>Highest value accounts in each financial category</CardDescription>
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
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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
                <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
                <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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

      {/* Enhanced AI Insights with Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis of your financial data with actionable recommendations
          </CardDescription>
          <div className="flex gap-2 mt-2">
            <Button
              variant={selectedInsightType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('all')}
            >
              All ({insights.length})
            </Button>
            <Button
              variant={selectedInsightType === 'trend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('trend')}
            >
              Trends ({insights.filter(i => i.type === 'trend').length})
            </Button>
            <Button
              variant={selectedInsightType === 'anomaly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('anomaly')}
            >
              Anomalies ({insights.filter(i => i.type === 'anomaly').length})
            </Button>
            <Button
              variant={selectedInsightType === 'recommendation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedInsightType('recommendation')}
            >
              Recommendations ({insights.filter(i => i.type === 'recommendation').length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInsights.map((insight, index) => (
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

      {/* Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Operations:</span>
              <div className="flex items-center gap-2">
                <MinusIcon className="h-4 w-4 text-gray-500" />
                <span className={`font-medium ${(summary.cashFlowOperating || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.cashFlowOperating || 0)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Investing:</span>
              <div className="flex items-center gap-2">
                <MinusIcon className="h-4 w-4 text-gray-500" />
                <span className={`font-medium ${(summary.cashFlowInvesting || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.cashFlowInvesting || 0)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Net Cash Flow:</span>
              <div className="flex items-center gap-2">
                <MinusIcon className="h-4 w-4 text-gray-500" />
                <span className={`font-medium ${(summary.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netCashFlow || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Financial Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Ratio:</span>
              <div className="flex items-center gap-2">
                {/* metrics is not defined here */}
                {/* <MinusIcon className="h-4 w-4 text-gray-500" /> */}
                <span className="font-medium">{summary.currentRatio?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Debt/Equity:</span>
              <div className="flex items-center gap-2">
                {/* metrics is not defined here */}
                {/* <MinusIcon className="h-4 w-4 text-gray-500" /> */}
                <span className="font-medium">{summary.debtToEquityRatio?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Quick Ratio:</span>
              <div className="flex items-center gap-2">
                {/* metrics is not defined here */}
                {/* <MinusIcon className="h-4 w-4 text-gray-500" /> */}
                <span className="font-medium">{summary.quickRatio?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">EBITDA:</span>
              <div className="flex items-center gap-2">
                {/* metrics is not defined here */}
                {/* <MinusIcon className="h-4 w-4 text-gray-500" /> */}
                <span className="font-medium">{formatCurrency(summary.ebitda || 0)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AR Days:</span>
              <div className="flex items-center gap-2">
                {/* metrics is not defined here */}
                {/* <MinusIcon className="h-4 w-4 text-gray-500" /> */}
                <span className="font-medium">{summary.arDays || 'N/A'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AP Days:</span>
              <div className="flex items-center gap-2">
                {/* metrics is not defined here */}
                {/* <MinusIcon className="h-4 w-4 text-gray-500" /> */}
                <span className="font-medium">{summary.apDays || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

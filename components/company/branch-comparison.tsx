"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Building2, GitCompare } from 'lucide-react'

interface Branch {
  id: string
  name: string
  location: string
}

interface ComparisonData {
  branchId: string
  branchName: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  analysisCount: number
  ebitda: number
  grossMargin: number
  businessHealthScore: number
  cashFlow: number
  currentRatio: number
  debtToEquity: number
  workingCapital: number
  criticalAlerts: string[]
}

interface ConsolidatedData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  averageProfitMargin: number
  totalBranches: number
  totalAnalyses: number
  averageEbitda: number
  averageGrossMargin: number
  averageHealthScore: number
  totalCashFlow: number
  averageCurrentRatio: number
  totalWorkingCapital: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function BranchComparison() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData | null>(null)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranches.length >= 1) {
      fetchComparisonData()
    } else {
      setComparisonData([])
      setConsolidatedData(null)
    }
  }, [selectedBranches])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/company/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches)
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchComparisonData = async () => {
    setLoading(true)
    try {
      const branchIds = selectedBranches.join(',')
      const response = await fetch(`/api/company/analytics?branchIds=${branchIds}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComparisonData(data.data.branches)
          setConsolidatedData(data.data.consolidated)
        }
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchSelection = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranches([...selectedBranches, branchId])
    } else {
      setSelectedBranches(selectedBranches.filter(id => id !== branchId))
    }
  }

  const selectAllBranches = () => {
    setSelectedBranches(branches.map(b => b.id))
  }

  const clearSelection = () => {
    setSelectedBranches([])
  }

  // Prepare chart data
  const chartData = comparisonData.map((branch, index) => ({
    name: branch.branchName,
    revenue: branch.totalRevenue,
    expenses: branch.totalExpenses,
    profit: branch.netProfit,
    margin: branch.profitMargin,
    color: COLORS[index % COLORS.length]
  }))

  const pieData = comparisonData.map((branch, index) => ({
    name: branch.branchName,
    value: branch.totalRevenue,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitCompare className="h-8 w-8" />
            Branch Comparison
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare financial performance across your branches
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Branches & Period
          </CardTitle>
          <CardDescription>
            Choose branches and time period for comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Branch Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Branches</Label>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllBranches}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {branches.map((branch) => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={branch.id}
                    checked={selectedBranches.includes(branch.id)}
                    onCheckedChange={(checked) => 
                      handleBranchSelection(branch.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={branch.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {branch.name}
                    <div className="text-xs text-muted-foreground">{branch.location}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {selectedBranches.length} branch{selectedBranches.length !== 1 ? 'es' : ''} selected
            </Badge>
            {selectedBranches.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Comparing latest financial data for selected branches
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading comparison data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && selectedBranches.length > 0 && comparisonData.length > 0 && (
        <>
          {/* Consolidated Summary */}
          {consolidatedData && (
            <Card>
              <CardHeader>
                <CardTitle>Consolidated Summary</CardTitle>
                <CardDescription>
                  Combined metrics across selected branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${consolidatedData.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${consolidatedData.totalExpenses.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${consolidatedData.netProfit.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Net Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {consolidatedData.averageProfitMargin.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Profit Margin</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {consolidatedData.averageHealthScore.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Health Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      ${consolidatedData.averageEbitda.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg EBITDA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Branch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.map((branch, index) => (
              <Card key={branch.branchId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{branch.branchName}</CardTitle>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-medium text-green-600">
                      ${branch.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expenses</span>
                    <span className="font-medium text-red-600">
                      ${branch.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit</span>
                    <span className={`font-medium ${branch.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${branch.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Margin</span>
                    <span className={`font-medium ${branch.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {branch.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <span className={`font-medium ${
                      branch.businessHealthScore >= 70 ? 'text-green-600' : 
                      branch.businessHealthScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {branch.businessHealthScore.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">EBITDA</span>
                    <span className={`font-medium ${branch.ebitda >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${branch.ebitda.toLocaleString()}
                    </span>
                  </div>
                  {branch.criticalAlerts.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-red-600">Critical Alerts</span>
                      </div>
                      <div className="text-xs text-red-600 space-y-1">
                        {branch.criticalAlerts.slice(0, 2).map((alert, idx) => (
                          <div key={idx}>• {alert}</div>
                        ))}
                        {branch.criticalAlerts.length > 2 && (
                          <div className="text-muted-foreground">
                            +{branch.criticalAlerts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Reports</span>
                    <Badge variant="secondary">
                      {branch.analysisCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Profit Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Profit</CardTitle>
                <CardDescription>
                  Compare revenue and profit across branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="profit" fill="#3b82f6" name="Net Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>
                  Revenue share by branch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Profit Margin Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Comparison</CardTitle>
              <CardDescription>
                Profit margin percentage across branches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="margin" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Profit Margin %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && selectedBranches.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select at least one branch to view comparison data
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && selectedBranches.length > 0 && comparisonData.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No financial data found for selected branches and period
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
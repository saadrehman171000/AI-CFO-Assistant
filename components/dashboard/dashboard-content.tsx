"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet, Users, Target, Upload, FileText } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const kpiData = [
  { title: "Revenue", value: "$125,430", change: "+12.5%", trend: "up", icon: DollarSign, color: "bg-green-50 text-green-600" },
  { title: "Expenses", value: "$89,240", change: "-3.2%", trend: "down", icon: Wallet, color: "bg-red-50 text-red-600" },
  { title: "Profit/Loss", value: "$36,190", change: "+18.7%", trend: "up", icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
  { title: "Cash Flow", value: "$42,850", change: "+5.4%", trend: "up", icon: Target, color: "bg-purple-50 text-purple-600" },
]

const cashFlowData = [
  { month: "Jan", value: 35000 },
  { month: "Feb", value: 38000 },
  { month: "Mar", value: 42000 },
  { month: "Apr", value: 39000 },
  { month: "May", value: 45000 },
  { month: "Jun", value: 42850 },
]

const aiInsights = [
  "Revenue increased by 12.5% compared to last month",
  "Operating expenses decreased by 3.2%, showing improved efficiency",
  "Cash flow is trending positively with a 5.4% increase",
  "Recommend reviewing Q2 marketing spend allocation",
  "Accounts receivable collection improved by 8 days",
]

export function DashboardContent() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">{kpi.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className={`text-sm flex items-center mt-1 ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {kpi.trend === "up" ? (
                      <TrendingUp className="mr-1 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{kpi.change}</span>
                  </p>
                </div>
                <div className={`p-3 rounded-full flex-shrink-0 ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Cash Flow Chart */}
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Cash Flow Trends</CardTitle>
            <p className="text-sm text-gray-600">Monthly cash flow performance over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
              <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, "Cash Flow"]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ fill: "#2563eb", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl flex items-center">
              <span className="mr-2 text-2xl">🤖</span>
              AI Insights
            </CardTitle>
            <p className="text-sm text-gray-600">AI-powered financial recommendations</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200">
              <Upload className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Upload Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-200">
              <FileText className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-200">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-200">
              <Target className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Set Goals</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

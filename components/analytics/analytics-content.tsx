"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Filter, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Building } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

// Mock data
const revenueData = [
  { month: "Jan", revenue: 125000, expenses: 89000, profit: 36000 },
  { month: "Feb", revenue: 138000, expenses: 92000, profit: 46000 },
  { month: "Mar", revenue: 142000, expenses: 88000, profit: 54000 },
  { month: "Apr", revenue: 156000, expenses: 95000, profit: 61000 },
  { month: "May", revenue: 168000, expenses: 102000, profit: 66000 },
  { month: "Jun", revenue: 175000, expenses: 115000, profit: 60000 },
]

const categoryData = [
  { name: "Marketing", value: 35, color: "#3b82f6" },
  { name: "Operations", value: 25, color: "#10b981" },
  { name: "Technology", value: 20, color: "#f59e0b" },
  { name: "Administration", value: 15, color: "#ef4444" },
  { name: "Other", value: 5, color: "#8b5cf6" },
]

const performanceMetrics = [
  { metric: "Revenue Growth", value: "+12.5%", trend: "up", change: "+2.3%" },
  { metric: "Profit Margin", value: "34.3%", trend: "up", change: "+1.8%" },
  { metric: "Customer Acquisition", value: "1,247", trend: "up", change: "+15.2%" },
  { metric: "Churn Rate", value: "2.1%", trend: "down", change: "-0.5%" },
]

export function AnalyticsContent() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial insights and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Date Range</span>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {performanceMetrics.map((item) => (
          <Card key={item.metric} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.metric}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className={`text-sm flex items-center ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {item.trend === "up" ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {item.change}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-full">
                  {item.metric.includes("Revenue") && <DollarSign className="h-5 w-5 text-blue-600" />}
                  {item.metric.includes("Customer") && <Users className="h-5 w-5 text-blue-600" />}
                  {item.metric.includes("Profit") && <TrendingUp className="h-5 w-5 text-blue-600" />}
                  {item.metric.includes("Churn") && <TrendingDown className="h-5 w-5 text-blue-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Profit"]} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📊</span>
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-gray-700"><strong>Revenue Growth:</strong> Consistent month-over-month growth averaging 8.3%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-gray-700"><strong>Cost Control:</strong> Operating expenses maintained at 65-70% of revenue</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm text-gray-700"><strong>Seasonality:</strong> Q2 shows strongest performance with 15% growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🎯</span>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="text-sm text-gray-700"><strong>Marketing:</strong> Increase Q3 budget allocation by 20%</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                <p className="text-sm text-gray-700"><strong>Operations:</strong> Optimize cost structure in Q4</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg border-l-4 border-teal-400">
                <p className="text-sm text-gray-700"><strong>Growth:</strong> Focus on customer retention strategies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

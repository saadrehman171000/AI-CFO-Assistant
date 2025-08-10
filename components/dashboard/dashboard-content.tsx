"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const kpiData = [
  { title: "Revenue", value: "$125,430", change: "+12.5%", trend: "up", icon: DollarSign },
  { title: "Expenses", value: "$89,240", change: "-3.2%", trend: "down", icon: Wallet },
  { title: "Profit/Loss", value: "$36,190", change: "+18.7%", trend: "up", icon: TrendingUp },
  { title: "Cash Flow", value: "$42,850", change: "+5.4%", trend: "up", icon: TrendingUp },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className={`text-sm flex items-center ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {kpi.trend === "up" ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {kpi.change}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <kpi.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Cash Flow"]} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🤖</span>
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

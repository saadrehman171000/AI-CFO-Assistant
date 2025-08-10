"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const initialForecastData = [
  { month: "Jul", actual: 42850, forecast: 45000 },
  { month: "Aug", actual: null, forecast: 47000 },
  { month: "Sep", actual: null, forecast: 49000 },
  { month: "Oct", actual: null, forecast: 51000 },
  { month: "Nov", actual: null, forecast: 53000 },
  { month: "Dec", actual: null, forecast: 55000 },
]

export function ForecastingContent() {
  const [forecastPeriod, setForecastPeriod] = useState("90")
  const [revenueAdjustment, setRevenueAdjustment] = useState(0)
  const [expenseAdjustment, setExpenseAdjustment] = useState(0)
  const [forecastData, setForecastData] = useState(initialForecastData)

  const handleGenerateForecast = () => {
    const adjustmentFactor = 1 + (revenueAdjustment - expenseAdjustment) / 100
    const newData = initialForecastData.map((item) => ({
      ...item,
      forecast: item.forecast ? Math.round(item.forecast * adjustmentFactor) : null,
    }))
    setForecastData(newData)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Forecasting & Scenario Planning</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Forecast Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period</label>
              <select
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Adjustment (%)</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={revenueAdjustment}
                onChange={(e) => setRevenueAdjustment(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-50%</span>
                <span className="font-medium">{revenueAdjustment}%</span>
                <span>+50%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Adjustment (%)</label>
              <input
                type="range"
                min="-50"
                max="50"
                value={expenseAdjustment}
                onChange={(e) => setExpenseAdjustment(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-50%</span>
                <span className="font-medium">{expenseAdjustment}%</span>
                <span>+50%</span>
              </div>
            </div>

            <Button onClick={handleGenerateForecast} className="w-full bg-blue-600 hover:bg-blue-700">
              Generate Forecast
            </Button>
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Cash Flow Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `$${value?.toLocaleString()}`,
                    name === "actual" ? "Actual" : "Forecast",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Actual"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Best Case Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="font-semibold text-green-600">+25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost Reduction</span>
                <span className="font-semibold text-green-600">-10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Cash Flow</span>
                <span className="font-semibold text-green-600">$68,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Base Case Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="font-semibold text-blue-600">+5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost Increase</span>
                <span className="font-semibold text-blue-600">+3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Cash Flow</span>
                <span className="font-semibold text-blue-600">$55,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Worst Case Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue Decline</span>
                <span className="font-semibold text-red-600">-15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost Increase</span>
                <span className="font-semibold text-red-600">+20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Projected Cash Flow</span>
                <span className="font-semibold text-red-600">$32,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🤖</span>
            AI Forecast Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Cash flow is projected to grow steadily over the next 90 days
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Seasonal trends suggest increased revenue in Q4
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Current trajectory supports planned expansion
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Consider increasing marketing spend by 15% in August
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Maintain current operational efficiency levels
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Prepare for seasonal inventory adjustments
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

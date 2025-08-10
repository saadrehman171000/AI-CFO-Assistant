"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react"

const tabs = ["P&L Statement", "Balance Sheet", "Cash Flow"]

const mockPLData = [
  { account: "Revenue - Software Sales", amount: 125430 },
  { account: "Revenue - Consulting", amount: 8500 },
  { account: "Total Revenue", amount: 133930, isTotal: true },
  { account: "Expenses - Salaries", amount: -45000 },
  { account: "Expenses - Marketing", amount: -15200 },
  { account: "Expenses - Operations", amount: -12500 },
  { account: "Total Expenses", amount: -72700, isTotal: true },
  { account: "Net Income", amount: 61230, isTotal: true, isNetIncome: true },
]

export function ReportsContent() {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = mockPLData.filter((item) => item.account.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === index
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Report Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{tabs[activeTab]}</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 ${
                        row.isTotal ? "bg-gray-50 font-semibold" : ""
                      } ${row.isNetIncome ? "bg-blue-50 font-bold" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.account}</td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                          row.amount > 0 ? "text-green-600" : "text-red-600"
                        } ${row.isNetIncome ? "text-blue-600" : ""}`}
                      >
                        ${Math.abs(row.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🤖</span>
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Highlights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Revenue up 12.5% vs last month</li>
                  <li>• Operating margin improved to 45.7%</li>
                  <li>• Strong cash position maintained</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Areas of Focus</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Marketing spend efficiency</li>
                  <li>• Accounts receivable collection</li>
                  <li>• Seasonal revenue planning</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Recommendations</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Increase Q3 marketing budget</li>
                  <li>• Optimize operational costs</li>
                  <li>• Consider expansion opportunities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

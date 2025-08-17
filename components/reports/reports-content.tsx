"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  BarChart3,
  DollarSign,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Eye,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportToPDF, exportToCSV, prepareDataForExport } from "@/lib/export-utils";

const tabs = ["P&L Statement", "Balance Sheet", "Cash Flow"];

interface TableRow {
  account: string;
  amount: number;
  isTotal?: boolean;
  isNetIncome?: boolean;
}

export function ReportsContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;

  // Enhanced export functions
  const handleExportToPDF = async () => {
    setExporting(true);
    try {
      const { tableData: exportData, options } = prepareDataForExport(tableData, activeTab, tabs[activeTab]);
      await exportToPDF(exportData, options);
    } catch (error) {
      console.error('PDF export failed:', error);
      // You could add a toast notification here
      alert('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportToCSV = async () => {
    setExporting(true);
    try {
      const { tableData: exportData, options } = prepareDataForExport(tableData, activeTab, tabs[activeTab]);
      await exportToCSV(exportData, options);
    } catch (error) {
      console.error('CSV export failed:', error);
      // You could add a toast notification here
      alert('CSV export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Generate table data based on active tab
  const getTableData = (): TableRow[] => {
    if (!financialData || !financialData.analysis) return [];

    switch (activeTab) {
      case 0: // P&L
        const plData = financialData.analysis.profit_and_loss;
        const plRows: TableRow[] = [
          { account: "Revenue Streams", amount: 0, isTotal: true },
          {
            account: "Total Revenue",
            amount: plData.revenue_analysis?.total_revenue || 0,
          },
          {
            account: "Primary Revenue",
            amount:
              plData.revenue_analysis?.revenue_streams?.primary_revenue || 0,
          },
          {
            account: "Secondary Revenue",
            amount:
              plData.revenue_analysis?.revenue_streams?.secondary_revenue || 0,
          },
          {
            account: "Recurring Revenue",
            amount:
              plData.revenue_analysis?.revenue_streams?.recurring_revenue || 0,
          },
          {
            account: "One-time Revenue",
            amount:
              plData.revenue_analysis?.revenue_streams?.one_time_revenue || 0,
          },

          { account: "Expense Categories", amount: 0, isTotal: true },
          {
            account: "Total Expenses",
            amount: -(plData.cost_structure?.total_expenses || 0),
          },
          {
            account: "Direct Costs",
            amount: -(
              plData.cost_structure?.cost_categories?.direct_costs || 0
            ),
          },
          {
            account: "Operating Expenses",
            amount: -(
              plData.cost_structure?.cost_categories?.operating_expenses || 0
            ),
          },
          {
            account: "Administrative Costs",
            amount: -(
              plData.cost_structure?.cost_categories?.administrative_costs || 0
            ),
          },
          {
            account: "Financing Costs",
            amount: -(
              plData.cost_structure?.cost_categories?.financing_costs || 0
            ),
          },

          { account: "Profitability", amount: 0, isTotal: true },
          {
            account: "Gross Profit",
            amount: plData.profitability_metrics?.gross_profit || 0,
          },
          {
            account: "Operating Profit",
            amount: plData.profitability_metrics?.operating_profit || 0,
          },
          {
            account: "EBITDA",
            amount: plData.profitability_metrics?.ebitda || 0,
          },
          {
            account: "Net Income",
            amount: plData.profitability_metrics?.net_income || 0,
            isNetIncome: true,
          },
        ];
        return plRows;

      case 1: // Balance Sheet
        const bsData = financialData.analysis.balance_sheet;
        if (
          !bsData.assets.total_assets &&
          !bsData.liabilities.total_liabilities &&
          !bsData.equity.total_equity
        ) {
          return [{ account: "No Balance Sheet data available", amount: 0 }];
        }

        const bsRows: TableRow[] = [
          { account: "Assets", amount: 0, isTotal: true },
          {
            account: "Current Assets",
            amount: bsData.assets.current_assets.total_current || 0,
          },
          {
            account: "Cash and Equivalents",
            amount: bsData.assets.current_assets.cash_and_equivalents || 0,
          },
          {
            account: "Accounts Receivable",
            amount: bsData.assets.current_assets.accounts_receivable || 0,
          },
          {
            account: "Inventory",
            amount: bsData.assets.current_assets.inventory || 0,
          },
          {
            account: "Prepaid Expenses",
            amount: bsData.assets.current_assets.prepaid_expenses || 0,
          },

          {
            account: "Non-Current Assets",
            amount: bsData.assets.non_current_assets.total_non_current || 0,
          },
          {
            account: "Property & Equipment",
            amount: bsData.assets.non_current_assets.property_equipment || 0,
          },
          {
            account: "Intangible Assets",
            amount: bsData.assets.non_current_assets.intangible_assets || 0,
          },
          {
            account: "Investments",
            amount: bsData.assets.non_current_assets.investments || 0,
          },

          {
            account: "Total Assets",
            amount: bsData.assets.total_assets || 0,
            isTotal: true,
          },

          { account: "Liabilities", amount: 0, isTotal: true },
          {
            account: "Current Liabilities",
            amount: bsData.liabilities.current_liabilities.total_current || 0,
          },
          {
            account: "Accounts Payable",
            amount:
              bsData.liabilities.current_liabilities.accounts_payable || 0,
          },
          {
            account: "Accrued Expenses",
            amount:
              bsData.liabilities.current_liabilities.accrued_expenses || 0,
          },
          {
            account: "Short Term Debt",
            amount: bsData.liabilities.current_liabilities.short_term_debt || 0,
          },

          {
            account: "Long-term Liabilities",
            amount:
              bsData.liabilities.long_term_liabilities.total_long_term || 0,
          },
          {
            account: "Long Term Debt",
            amount:
              bsData.liabilities.long_term_liabilities.long_term_debt || 0,
          },
          {
            account: "Deferred Tax",
            amount: bsData.liabilities.long_term_liabilities.deferred_tax || 0,
          },
          {
            account: "Other Long Term",
            amount:
              bsData.liabilities.long_term_liabilities.other_long_term || 0,
          },

          {
            account: "Total Liabilities",
            amount: bsData.liabilities.total_liabilities || 0,
            isTotal: true,
          },

          { account: "Equity", amount: 0, isTotal: true },
          { account: "Owner Equity", amount: bsData.equity.owner_equity || 0 },
          {
            account: "Retained Earnings",
            amount: bsData.equity.retained_earnings || 0,
          },
          {
            account: "Current Year Earnings",
            amount: bsData.equity.current_year_earnings || 0,
          },

          {
            account: "Total Equity",
            amount: bsData.equity.total_equity || 0,
            isTotal: true,
          },
          {
            account: "Total Liabilities & Equity",
            amount:
              (bsData.liabilities.total_liabilities || 0) +
              (bsData.equity.total_equity || 0),
            isNetIncome: true,
          },
        ];
        return bsRows;

      case 2: // Cash Flow
        const cfData = financialData.analysis.cash_flow_analysis;
        if (
          !cfData.operating_activities.net_cash_from_operations &&
          !cfData.investing_activities.net_investing_cash_flow &&
          !cfData.financing_activities.net_financing_cash_flow
        ) {
          return [{ account: "No Cash Flow data available", amount: 0 }];
        }

        const cfRows: TableRow[] = [
          { account: "Operating Activities", amount: 0, isTotal: true },
          {
            account: "Net Cash from Operations",
            amount: cfData.operating_activities.net_cash_from_operations || 0,
          },

          { account: "Investing Activities", amount: 0, isTotal: true },
          {
            account: "Capital Expenditures",
            amount: cfData.investing_activities.capital_expenditures || 0,
          },
          {
            account: "Asset Disposals",
            amount: cfData.investing_activities.asset_disposals || 0,
          },
          {
            account: "Net Investing Cash Flow",
            amount: cfData.investing_activities.net_investing_cash_flow || 0,
          },

          { account: "Financing Activities", amount: 0, isTotal: true },
          {
            account: "Debt Changes",
            amount: cfData.financing_activities.debt_changes || 0,
          },
          {
            account: "Equity Changes",
            amount: cfData.financing_activities.equity_changes || 0,
          },
          {
            account: "Dividends/Distributions",
            amount: cfData.financing_activities.dividends_distributions || 0,
          },
          {
            account: "Net Financing Cash Flow",
            amount: cfData.financing_activities.net_financing_cash_flow || 0,
          },

          { account: "Cash Position", amount: 0, isTotal: true },
          {
            account: "Beginning Cash",
            amount: cfData.cash_position.beginning_cash || 0,
          },
          {
            account: "Ending Cash",
            amount: cfData.cash_position.ending_cash || 0,
          },
          {
            account: "Net Change in Cash",
            amount: cfData.cash_position.net_change_in_cash || 0,
          },
          {
            account: "Free Cash Flow",
            amount: cfData.cash_position.free_cash_flow || 0,
            isNetIncome: true,
          },
        ];
        return cfRows;

      default:
        return [];
    }
  };

  // Fetch financial data from API
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/financial-analysis?latest=true");
        if (!response.ok) {
          throw new Error("Failed to fetch financial data");
        }
        const data = await response.json();
        setFinancialData(data);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [activeTab]);

  // Get table data based on active tab
  const rawTableData = getTableData();

  // Filter out non-section header rows with zero amounts
  const tableData = rawTableData.filter(
    (row) => row.isTotal || row.amount !== 0
  );

  // Filter and paginate data
  const filteredData = tableData.filter((item) =>
    item.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Enhanced 3D Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Financial Reports
                </h1>
                <p className="text-gray-600 mt-1">AI-Powered Financial Analysis & Insights</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleExportToPDF} 
                disabled={exporting}
                className="bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                {exporting ? "Exporting..." : "Export PDF"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportToCSV} 
                disabled={exporting}
                className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced 3D Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Loading financial data...</p>
                <p className="text-gray-500 text-sm mt-2">Analyzing your financial documents</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced 3D Error State */}
      {error && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl opacity-60"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-red-200">
            <Alert variant="destructive" className="bg-transparent border-0 p-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <AlertDescription className="text-red-700 font-medium">
                    {error}. Please try refreshing the page.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      )}

      {/* Enhanced 3D No Data State */}
      {!loading && !error && !financialData && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl blur-xl opacity-40"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BarChart3 className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Financial Data Available
              </h3>
              <p className="text-gray-500 max-w-md">
                Upload a financial document to see detailed reports.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!loading && !error && financialData && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <Button 
              className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      )}

      {/* Data Content */}
      {!loading && !error && financialData && (
        <>
          {/* Enhanced 3D Tabs */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-60"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/30">
              <nav className="flex space-x-2">
                {tabs.map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(index)}
                    className={`relative flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      activeTab === index
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl scale-105"
                        : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {activeTab === index && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                      <span>{tab}</span>
                    </div>
                    {activeTab === index && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rotate-45"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced 3D Main Report Table */}
            <Card className="lg:col-span-3 transform hover:scale-[1.01] transition-all duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          activeTab === 0 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                          activeTab === 1 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                          "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}>
                          {activeTab === 0 && <TrendingUp className="h-6 w-6 text-white" />}
                          {activeTab === 1 && <BarChart3 className="h-6 w-6 text-white" />}
                          {activeTab === 2 && <DollarSign className="h-6 w-6 text-white" />}
                        </div>
                        <div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {tabs[activeTab]}
                          </div>
                          <div className="text-sm text-gray-500 font-normal">
                            {financialData.file_info.filename}
                          </div>
                        </div>
                      </CardTitle>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/80 rounded-xl blur-sm"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 rounded-l-xl">
                              Account
                            </th>
                            <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-gray-50 to-gray-100 rounded-r-xl">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedData.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-8 py-12 text-center text-gray-500"
                              >
                                {tableData.length === 0
                                  ? "No data available for this report"
                                  : "No results found for your search"}
                              </td>
                            </tr>
                          ) : (
                            paginatedData.map((row, index) => (
                              <tr
                                key={index}
                                className={`group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 ${
                                  row.isTotal ? "bg-gradient-to-r from-gray-50 to-blue-50/30" : ""
                                } ${row.isNetIncome ? "bg-gradient-to-r from-blue-50/50 to-cyan-50/50" : ""}`}
                              >
                                <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                                  <div className="flex items-center space-x-2">
                                    {row.isTotal && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                    {row.isNetIncome && (
                                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                    )}
                                    <span className={`${row.isTotal ? "font-bold" : ""} ${row.isNetIncome ? "font-extrabold" : ""}`}>
                                      {row.account}
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className={`px-8 py-4 whitespace-nowrap text-sm text-right font-medium transition-all duration-200 ${
                                    row.amount === 0
                                      ? "text-gray-400"
                                      : row.amount > 0
                                      ? "text-green-600 group-hover:text-green-700"
                                      : "text-red-600 group-hover:text-red-700"
                                  } ${row.isNetIncome ? "text-blue-600 font-bold text-lg" : ""}`}
                                >
                                  {row.amount === 0 && row.isTotal
                                    ? ""
                                    : `$${Math.abs(row.amount).toLocaleString()}`}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Enhanced 3D Pagination */}
                    {filteredData.length > itemsPerPage && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-lg border border-gray-200">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(startIndex + itemsPerPage, filteredData.length)}{" "}
                          of {filteredData.length} results
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Enhanced 3D Sidebar */}
            <Card className="shadow-2xl h-fit sticky top-4 transform hover:scale-[1.02] transition-all duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-40"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      Report Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* File Info Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-sm font-medium text-gray-600 mb-1">File Name</p>
                        <p className="text-base font-semibold text-gray-900 truncate" title={financialData.file_info.filename}>
                          {financialData.file_info.filename}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-100/50">
                        <p className="text-sm font-medium text-gray-600 mb-1">File Type</p>
                        <p className="text-base font-semibold text-gray-900 capitalize">
                          {financialData.file_info.file_type}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-100/50">
                        <p className="text-sm font-medium text-gray-600 mb-1">File Size</p>
                        <p className="text-base font-semibold text-gray-900">
                          {financialData.file_info.file_size_mb.toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    {/* Key Metrics Section */}
                    {activeTab === 0 && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">P&L Metrics</h4>
                        <div className="space-y-3">
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">Revenue</p>
                            <p className="text-xl font-bold text-green-600">
                              ${(financialData.analysis.profit_and_loss.revenue_analysis?.total_revenue || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">Expenses</p>
                            <p className="text-xl font-bold text-red-600">
                              ${Math.abs(financialData.analysis.profit_and_loss.cost_structure?.total_expenses || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className={`p-4 rounded-xl border shadow-lg ${
                            (financialData.analysis.profit_and_loss.profitability_metrics?.net_income || 0) >= 0
                              ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                              : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                          }`}>
                            <p className="text-sm font-medium text-gray-600 mb-1">Net Income</p>
                            <p className={`text-xl font-bold ${
                              (financialData.analysis.profit_and_loss.profitability_metrics?.net_income || 0) >= 0
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}>
                              ${Math.abs(financialData.analysis.profit_and_loss.profitability_metrics?.net_income || 0).toLocaleString()}
                              {(financialData.analysis.profit_and_loss.profitability_metrics?.net_income || 0) < 0 ? " (Loss)" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Balance Sheet</h4>
                        <div className="space-y-3">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Assets</p>
                            <p className="text-xl font-bold text-blue-600">
                              ${(financialData.analysis.balance_sheet?.assets?.total_assets || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Liabilities</p>
                            <p className="text-xl font-bold text-orange-600">
                              ${(financialData.analysis.balance_sheet?.liabilities?.total_liabilities || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Equity</p>
                            <p className="text-xl font-bold text-purple-600">
                              ${(financialData.analysis.balance_sheet?.equity?.total_equity || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Cash Flow</h4>
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl border shadow-lg ${
                            (financialData.analysis.cash_flow_analysis?.operating_activities?.net_cash_from_operations || 0) >= 0
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                              : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                          }`}>
                            <p className="text-sm font-medium text-gray-600 mb-1">Operating Cash Flow</p>
                            <p className={`text-xl font-bold ${
                              (financialData.analysis.cash_flow_analysis?.operating_activities?.net_cash_from_operations || 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                              ${Math.abs(financialData.analysis.cash_flow_analysis?.operating_activities?.net_cash_from_operations || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className={`p-4 rounded-xl border shadow-lg ${
                            (financialData.analysis.cash_flow_analysis?.cash_position?.free_cash_flow || 0) >= 0
                              ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                              : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                          }`}>
                            <p className="text-sm font-medium text-gray-600 mb-1">Free Cash Flow</p>
                            <p className={`text-xl font-bold ${
                              (financialData.analysis.cash_flow_analysis?.cash_position?.free_cash_flow || 0) >= 0
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}>
                              ${Math.abs(financialData.analysis.cash_flow_analysis?.cash_position?.free_cash_flow || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

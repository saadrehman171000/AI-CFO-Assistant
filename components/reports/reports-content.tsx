"use client";

import { useState, useEffect } from "react";
import { useActiveFile } from "@/components/contexts/active-file-context";
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
import {
  exportToPDF,
  exportToCSV,
  prepareDataForExport,
} from "@/lib/export-utils";

const tabs = ["P&L Statement", "Balance Sheet", "Cash Flow"];

interface TableRow {
  account: string;
  amount: number;
  isTotal?: boolean;
  isNetIncome?: boolean;
}

export function ReportsContent() {
  const { activeFileData, activeFile } = useActiveFile();
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
      const { tableData: exportData, options } = prepareDataForExport(
        tableData,
        activeTab,
        tabs[activeTab]
      );
      await exportToPDF(exportData, options);
    } catch (error) {
      console.error("PDF export failed:", error);
      // You could add a toast notification here
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportToCSV = async () => {
    setExporting(true);
    try {
      const { tableData: exportData, options } = prepareDataForExport(
        tableData,
        activeTab,
        tabs[activeTab]
      );
      await exportToCSV(exportData, options);
    } catch (error) {
      console.error("CSV export failed:", error);
      // You could add a toast notification here
      alert("CSV export failed. Please try again.");
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
        // Use active file data if available, otherwise fetch latest
        if (activeFileData) {
          setFinancialData(activeFileData);
        } else {
          const response = await fetch("/api/financial-analysis?latest=true");
          if (!response.ok) {
            throw new Error("Failed to fetch financial data");
          }
          const data = await response.json();
          setFinancialData(data);
        }
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [activeFileData]); // Re-fetch when active file changes

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
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Financial Reports
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-Powered Financial Analysis & Insights
              </p>
            </div>
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExportToPDF}
              disabled={exporting}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span>{exporting ? "Exporting..." : "Export PDF"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportToCSV}
              disabled={exporting}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span>{exporting ? "Exporting..." : "Export CSV"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">
              Loading financial data...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Analyzing your financial documents
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && !financialData && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Financial Data Available
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Upload a financial document to see detailed reports.
            </p>
          </div>
        </div>
      )}



      {/* Data Content */}
      {!loading && !error && financialData && (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 pt-6">
              <div className="overflow-x-auto">
                <nav className="flex space-x-2 min-w-[400px] sm:min-w-0">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(index)}
                      className={`relative flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                        activeTab === index
                        ? "bg-slate-100 text-slate-900"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        {index === 1 && window.innerWidth < 640
                          ? "Balance"
                          : tab}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Report Table */}
            <Card className="lg:col-span-3">
              <CardHeader className="border-b border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 0
                        ? "bg-blue-100 text-blue-600"
                        : activeTab === 1
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-purple-100 text-purple-600"
                        }`}
                    >
                      {activeTab === 0 && <TrendingUp className="h-4 w-4" />}
                      {activeTab === 1 && <BarChart3 className="h-4 w-4" />}
                      {activeTab === 2 && <DollarSign className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {tabs[activeTab]}
                      </div>
                      <div className="text-sm text-gray-500 font-normal truncate max-w-xs">
                        {financialData.file_info.filename}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 placeholder-gray-400 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-6 py-8 text-center text-sm text-gray-500"
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
                            className={`hover:bg-gray-50 ${row.isTotal ? "bg-gray-50" : ""
                              } ${row.isNetIncome ? "bg-blue-50" : ""}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-2">
                                {row.isTotal && (
                                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                )}
                                {row.isNetIncome && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <span
                                  className={`${
                                    row.isTotal ? "font-semibold" : ""
                                    } ${row.isNetIncome ? "font-bold" : ""}`}
                                >
                                  {row.account}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${row.amount === 0
                                ? "text-gray-400"
                                : row.amount > 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                                } ${row.isNetIncome
                                  ? "text-blue-600 font-bold text-base"
                                  : ""
                                }`}
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

                {/* Pagination */}
                {filteredData.length > itemsPerPage && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-200 gap-3 sm:gap-0">
                    <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
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
                        className="h-8 w-8 p-0"
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
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="h-fit lg:sticky lg:top-4">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-3 w-3 text-slate-600" />
                  </div>
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* File Info Section */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      File Name
                    </p>
                    <p
                      className="text-sm font-semibold text-gray-900 truncate"
                      title={financialData.file_info.filename}
                    >
                      {financialData.file_info.filename}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      File Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {financialData.file_info.file_type}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      File Size
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {financialData.file_info.file_size_mb.toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Key Metrics Section */}
                {activeTab === 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">
                      P&L Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Revenue
                        </p>
                        <p className="text-lg font-bold text-emerald-600">
                          $
                          {(
                            financialData.analysis.profit_and_loss
                              .revenue_analysis?.total_revenue || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Expenses
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          $
                          {Math.abs(
                            financialData.analysis.profit_and_loss
                              .cost_structure?.total_expenses || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${(financialData.analysis.profit_and_loss
                          .profitability_metrics?.net_income || 0) >= 0
                          ? "bg-blue-50 border-blue-200"
                          : "bg-orange-50 border-orange-200"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Net Income
                        </p>
                        <p
                          className={`text-lg font-bold ${(financialData.analysis.profit_and_loss
                            .profitability_metrics?.net_income || 0) >= 0
                            ? "text-blue-600"
                            : "text-orange-600"
                            }`}
                        >
                          $
                          {Math.abs(
                            financialData.analysis.profit_and_loss
                              .profitability_metrics?.net_income || 0
                          ).toLocaleString()}
                          {(financialData.analysis.profit_and_loss
                            .profitability_metrics?.net_income || 0) < 0
                            ? " (Loss)"
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Balance Sheet
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Assets
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          $
                          {(
                            financialData.analysis.balance_sheet?.assets
                              ?.total_assets || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Liabilities
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          $
                          {(
                            financialData.analysis.balance_sheet
                              ?.liabilities?.total_liabilities || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Equity
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          $
                          {(
                            financialData.analysis.balance_sheet?.equity
                              ?.total_equity || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Cash Flow
                    </h4>
                    <div className="space-y-3">
                      <div
                        className={`p-4 rounded-lg border ${(financialData.analysis.cash_flow_analysis
                          ?.operating_activities
                          ?.net_cash_from_operations || 0) >= 0
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-red-50 border-red-200"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Operating Cash Flow
                        </p>
                        <p
                          className={`text-lg font-bold ${(financialData.analysis.cash_flow_analysis
                            ?.operating_activities
                            ?.net_cash_from_operations || 0) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                            }`}
                        >
                          $
                          {Math.abs(
                            financialData.analysis.cash_flow_analysis
                              ?.operating_activities
                              ?.net_cash_from_operations || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${(financialData.analysis.cash_flow_analysis
                          ?.cash_position?.free_cash_flow || 0) >= 0
                          ? "bg-blue-50 border-blue-200"
                          : "bg-orange-50 border-orange-200"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Free Cash Flow
                        </p>
                        <p
                          className={`text-lg font-bold ${(financialData.analysis.cash_flow_analysis
                            ?.cash_position?.free_cash_flow || 0) >= 0
                            ? "text-blue-600"
                            : "text-orange-600"
                            }`}
                        >
                          $
                          {Math.abs(
                            financialData.analysis.cash_flow_analysis
                              ?.cash_position?.free_cash_flow || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

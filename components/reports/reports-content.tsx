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
  RefreshCw,
  Target,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  exportToPDF,
  exportToCSV,
  prepareDataForExport,
} from "@/lib/export-utils";
import BranchUploadSelector from "@/components/company/branch-upload-selector";

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
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  // Helper to get the correct analysis object from potentially nested structure
  const getAnalysisObj = () => {
    try {
      if (!financialData) return null;
      
      // Try different possible paths
      if (financialData.analysisData?.analysis?.analysis) {
        return financialData.analysisData.analysis.analysis;
      } else if (financialData.analysisData?.analysis) {
        return financialData.analysisData.analysis;
      } else if (financialData.analysis?.analysis) {
        return financialData.analysis.analysis;
      } else if (financialData.analysis) {
        return financialData.analysis;
      }
    } catch (error) {
      console.error('Error in getAnalysisObj:', error);
    }
    
    return null;
  };

  // Helper function to safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = 0): any => {
    try {
      if (!obj || typeof obj !== 'object') return defaultValue;
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result === undefined || result === null || typeof result !== 'object') return defaultValue;
        result = result[key];
      }
      return result === undefined || result === null ? defaultValue : result;
    } catch (e) {
      return defaultValue;
    }
  };

  // Helper function to safely get string values
  const safeString = (value: any, defaultValue: string = ''): string => {
    return value != null && typeof value === 'string' ? value : defaultValue;
  };

  // Helper function to safely get number values
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return !isNaN(num) && isFinite(num) ? num : defaultValue;
  };

  // Helper function to format currency safely
  const formatCurrency = (amount: number | null | undefined): string => {
    const safeAmount = safeNumber(amount, 0);
    return `$${Math.abs(safeAmount).toLocaleString()}`;
  };

  // Enhanced export functions with null safety
  const handleExportToPDF = async () => {
    if (!financialData || !tableData || tableData.length === 0) {
      alert("No data available to export.");
      return;
    }

    setExporting(true);
    try {
      const { tableData: exportData, options } = prepareDataForExport(
        tableData,
        activeTab,
        safeString(tabs[activeTab], 'Financial Report')
      );
      await exportToPDF(exportData, options);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportToCSV = async () => {
    if (!financialData || !tableData || tableData.length === 0) {
      alert("No data available to export.");
      return;
    }

    setExporting(true);
    try {
      const { tableData: exportData, options } = prepareDataForExport(
        tableData,
        activeTab,
        safeString(tabs[activeTab], 'Financial Report')
      );
      await exportToCSV(exportData, options);
    } catch (error) {
      console.error("CSV export failed:", error);
      alert("CSV export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Generate table data based on active tab with null safety
  const getTableData = (): TableRow[] => {
    const analysisObj = getAnalysisObj();
    if (!analysisObj) return [];

    try {
      switch (activeTab) {
        case 0: // P&L
          const plData = analysisObj.profit_and_loss;
          if (!plData) return [{ account: "No P&L data available", amount: 0 }];

          const plRows: TableRow[] = [
            { account: "Revenue Streams", amount: 0, isTotal: true },
            {
              account: "Total Revenue",
              amount: safeNumber(safeGet(plData, 'revenue_analysis.total_revenue')),
            },
            {
              account: "Primary Revenue",
              amount: safeNumber(safeGet(plData, 'revenue_analysis.revenue_streams.primary_revenue')),
            },
            {
              account: "Secondary Revenue",
              amount: safeNumber(safeGet(plData, 'revenue_analysis.revenue_streams.secondary_revenue')),
            },
            {
              account: "Recurring Revenue",
              amount: safeNumber(safeGet(plData, 'revenue_analysis.revenue_streams.recurring_revenue')),
            },
            {
              account: "One-time Revenue",
              amount: safeNumber(safeGet(plData, 'revenue_analysis.revenue_streams.one_time_revenue')),
            },

            { account: "Expense Categories", amount: 0, isTotal: true },
            {
              account: "Total Expenses",
              amount: -safeNumber(safeGet(plData, 'cost_structure.total_expenses')),
            },
            {
              account: "Direct Costs",
              amount: -safeNumber(safeGet(plData, 'cost_structure.cost_categories.direct_costs')),
            },
            {
              account: "Operating Expenses",
              amount: -safeNumber(safeGet(plData, 'cost_structure.cost_categories.operating_expenses')),
            },
            {
              account: "Administrative Costs",
              amount: -safeNumber(safeGet(plData, 'cost_structure.cost_categories.administrative_costs')),
            },
            {
              account: "Financing Costs",
              amount: -safeNumber(safeGet(plData, 'cost_structure.cost_categories.financing_costs')),
            },

            { account: "Profitability", amount: 0, isTotal: true },
            {
              account: "Gross Profit",
              amount: safeNumber(safeGet(plData, 'profitability_metrics.gross_profit')),
            },
            {
              account: "Operating Profit",
              amount: safeNumber(safeGet(plData, 'profitability_metrics.operating_profit')),
            },
            {
              account: "EBITDA",
              amount: safeNumber(safeGet(plData, 'profitability_metrics.ebitda')),
            },
            {
              account: "Net Income",
              amount: safeNumber(safeGet(plData, 'profitability_metrics.net_income')),
              isNetIncome: true,
            },
          ];
          return plRows;

        case 1: // Balance Sheet
          const bsData = analysisObj.balance_sheet;
          if (!bsData || (
            safeNumber(safeGet(bsData, 'assets.total_assets')) === 0 &&
            safeNumber(safeGet(bsData, 'liabilities.total_liabilities')) === 0 &&
            safeNumber(safeGet(bsData, 'equity.total_equity')) === 0
          )) {
            return [{ account: "No Balance Sheet data available", amount: 0 }];
          }

          const bsRows: TableRow[] = [
            { account: "Assets", amount: 0, isTotal: true },
            {
              account: "Current Assets",
              amount: safeNumber(safeGet(bsData, 'assets.current_assets.total_current')),
            },
            {
              account: "Cash and Equivalents",
              amount: safeNumber(safeGet(bsData, 'assets.current_assets.cash_and_equivalents')),
            },
            {
              account: "Accounts Receivable",
              amount: safeNumber(safeGet(bsData, 'assets.current_assets.accounts_receivable')),
            },
            {
              account: "Inventory",
              amount: safeNumber(safeGet(bsData, 'assets.current_assets.inventory')),
            },
            {
              account: "Prepaid Expenses",
              amount: safeNumber(safeGet(bsData, 'assets.current_assets.prepaid_expenses')),
            },

            {
              account: "Non-Current Assets",
              amount: safeNumber(safeGet(bsData, 'assets.non_current_assets.total_non_current')),
            },
            {
              account: "Property & Equipment",
              amount: safeNumber(safeGet(bsData, 'assets.non_current_assets.property_equipment')),
            },
            {
              account: "Intangible Assets",
              amount: safeNumber(safeGet(bsData, 'assets.non_current_assets.intangible_assets')),
            },
            {
              account: "Investments",
              amount: safeNumber(safeGet(bsData, 'assets.non_current_assets.investments')),
            },

            {
              account: "Total Assets",
              amount: safeNumber(safeGet(bsData, 'assets.total_assets')),
              isTotal: true,
            },

            { account: "Liabilities", amount: 0, isTotal: true },
            {
              account: "Current Liabilities",
              amount: safeNumber(safeGet(bsData, 'liabilities.current_liabilities.total_current')),
            },
            {
              account: "Accounts Payable",
              amount: safeNumber(safeGet(bsData, 'liabilities.current_liabilities.accounts_payable')),
            },
            {
              account: "Accrued Expenses",
              amount: safeNumber(safeGet(bsData, 'liabilities.current_liabilities.accrued_expenses')),
            },
            {
              account: "Short Term Debt",
              amount: safeNumber(safeGet(bsData, 'liabilities.current_liabilities.short_term_debt')),
            },

            {
              account: "Long-term Liabilities",
              amount: safeNumber(safeGet(bsData, 'liabilities.long_term_liabilities.total_long_term')),
            },
            {
              account: "Long Term Debt",
              amount: safeNumber(safeGet(bsData, 'liabilities.long_term_liabilities.long_term_debt')),
            },
            {
              account: "Deferred Tax",
              amount: safeNumber(safeGet(bsData, 'liabilities.long_term_liabilities.deferred_tax')),
            },
            {
              account: "Other Long Term",
              amount: safeNumber(safeGet(bsData, 'liabilities.long_term_liabilities.other_long_term')),
            },

            {
              account: "Total Liabilities",
              amount: safeNumber(safeGet(bsData, 'liabilities.total_liabilities')),
              isTotal: true,
            },

            { account: "Equity", amount: 0, isTotal: true },
            { account: "Owner Equity", amount: safeNumber(safeGet(bsData, 'equity.owner_equity')) },
            {
              account: "Retained Earnings",
              amount: safeNumber(safeGet(bsData, 'equity.retained_earnings')),
            },
            {
              account: "Current Year Earnings",
              amount: safeNumber(safeGet(bsData, 'equity.current_year_earnings')),
            },

            {
              account: "Total Equity",
              amount: safeNumber(safeGet(bsData, 'equity.total_equity')),
              isTotal: true,
            },
            {
              account: "Total Liabilities & Equity",
              amount: safeNumber(safeGet(bsData, 'liabilities.total_liabilities')) +
                safeNumber(safeGet(bsData, 'equity.total_equity')),
              isNetIncome: true,
            },
          ];
          return bsRows;

        case 2: // Cash Flow
          const cfData = analysisObj.cash_flow_analysis;
          if (!cfData || (
            safeNumber(safeGet(cfData, 'operating_activities.net_cash_from_operations')) === 0 &&
            safeNumber(safeGet(cfData, 'investing_activities.net_investing_cash_flow')) === 0 &&
            safeNumber(safeGet(cfData, 'financing_activities.net_financing_cash_flow')) === 0
          )) {
            return [{ account: "No Cash Flow data available", amount: 0 }];
          }

          const cfRows: TableRow[] = [
            { account: "Operating Activities", amount: 0, isTotal: true },
            {
              account: "Net Cash from Operations",
              amount: safeNumber(safeGet(cfData, 'operating_activities.net_cash_from_operations')),
            },

            { account: "Investing Activities", amount: 0, isTotal: true },
            {
              account: "Capital Expenditures",
              amount: safeNumber(safeGet(cfData, 'investing_activities.capital_expenditures')),
            },
            {
              account: "Asset Disposals",
              amount: safeNumber(safeGet(cfData, 'investing_activities.asset_disposals')),
            },
            {
              account: "Net Investing Cash Flow",
              amount: safeNumber(safeGet(cfData, 'investing_activities.net_investing_cash_flow')),
            },

            { account: "Financing Activities", amount: 0, isTotal: true },
            {
              account: "Debt Changes",
              amount: safeNumber(safeGet(cfData, 'financing_activities.debt_changes')),
            },
            {
              account: "Equity Changes",
              amount: safeNumber(safeGet(cfData, 'financing_activities.equity_changes')),
            },
            {
              account: "Dividends/Distributions",
              amount: safeNumber(safeGet(cfData, 'financing_activities.dividends_distributions')),
            },
            {
              account: "Net Financing Cash Flow",
              amount: safeNumber(safeGet(cfData, 'financing_activities.net_financing_cash_flow')),
            },

            { account: "Cash Position", amount: 0, isTotal: true },
            {
              account: "Beginning Cash",
              amount: safeNumber(safeGet(cfData, 'cash_position.beginning_cash')),
            },
            {
              account: "Ending Cash",
              amount: safeNumber(safeGet(cfData, 'cash_position.ending_cash')),
            },
            {
              account: "Net Change in Cash",
              amount: safeNumber(safeGet(cfData, 'cash_position.net_change_in_cash')),
            },
            {
              account: "Free Cash Flow",
              amount: safeNumber(safeGet(cfData, 'cash_position.free_cash_flow')),
              isNetIncome: true,
            },
          ];
          return cfRows;

        default:
          return [];
      }
    } catch (error) {
      console.error('Error generating table data:', error);
      return [{ account: "Error loading data", amount: 0 }];
    }
  };

  // Fetch financial data from API with enhanced null safety
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);
      try {
        let analysisData = null;

        // If a specific analysis is selected, fetch that data
        if (selectedAnalysisId && typeof selectedAnalysisId === 'string') {
          try {
            const analysisResponse = await fetch(
              `/api/analysis-data?analysisId=${encodeURIComponent(selectedAnalysisId)}`
            );

            if (analysisResponse.ok) {
              const result = await analysisResponse.json();
              if (result?.success && result?.analysisData) {
                analysisData = result.analysisData;
              } else {
                console.warn('Invalid API response structure:', result);
              }
            } else {
              console.warn(`API request failed with status: ${analysisResponse.status}`);
            }
          } catch (fetchError) {
            console.error('Error fetching specific analysis:', fetchError);
          }
        }
        // If no specific analysis selected, fetch latest for the branch or company
        else {
          try {
            const endpoint = selectedBranchId && typeof selectedBranchId === 'string'
              ? `/api/financial-analyses?branchId=${encodeURIComponent(selectedBranchId)}&latest=true`
              : "/api/financial-analyses?latest=true";

            const analysisResponse = await fetch(endpoint);

            if (analysisResponse.ok) {
              const result = await analysisResponse.json();
              if (result?.success && result?.analysis?.id) {
              // Now fetch the actual analysis data
                try {
                  const dataResponse = await fetch(
                    `/api/analysis-data?analysisId=${encodeURIComponent(result.analysis.id)}`
                  );
                  if (dataResponse.ok) {
                    const dataResult = await dataResponse.json();
                    if (dataResult?.success && dataResult?.analysisData) {
                      analysisData = dataResult.analysisData;
                    } else {
                      console.warn('Invalid analysis data response:', dataResult);
                    }
                  } else {
                    console.warn(`Analysis data request failed with status: ${dataResponse.status}`);
                  }
                } catch (dataFetchError) {
                  console.error('Error fetching analysis data:', dataFetchError);
                }
              } else {
                console.warn('No valid analysis found in response:', result);
              }
            } else {
              console.warn(`Analysis list request failed with status: ${analysisResponse.status}`);
            }
          } catch (fetchError) {
            console.error('Error fetching latest analysis:', fetchError);
          }
        }

        // Validate analysisData structure before setting - handle deeper nested structure
        if (analysisData && typeof analysisData === 'object' && 
            (analysisData.analysis || 
             (analysisData.analysisData && analysisData.analysisData.analysis) ||
             (analysisData.analysisData && analysisData.analysisData.analysis && analysisData.analysisData.analysis.analysis))) {
          setFinancialData(analysisData);
        } else {
          setFinancialData(null);
          if (selectedAnalysisId || selectedBranchId) {
            setError('No valid financial data found for the selected analysis.');
          }
        }
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching data");
        setFinancialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [selectedBranchId, selectedAnalysisId]); // Re-fetch when selection changes

  const handleSelectionChange = (branchId: string | null, analysisId: string | null) => {
    // Validate inputs and prevent unnecessary re-renders if values haven't changed
    const safeBranchId = branchId && typeof branchId === 'string' ? branchId : null;
    const safeAnalysisId = analysisId && typeof analysisId === 'string' ? analysisId : null;

    if (selectedBranchId !== safeBranchId || selectedAnalysisId !== safeAnalysisId) {
      setSelectedBranchId(safeBranchId);
      setSelectedAnalysisId(safeAnalysisId);
      // Clear any previous errors when selection changes
      setError(null);
    }
  };

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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Branch & Upload Selector */}
      <BranchUploadSelector
        onSelectionChange={handleSelectionChange}
        title="Select Reports Data Source"
        description="Choose a branch and financial analysis to view detailed reports"
        showAllBranchesOption={true}
        initialBranchId={selectedBranchId}
        initialAnalysisId={selectedAnalysisId}
      />

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Financial Reports
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                AI-Powered Financial Analysis & Insights
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
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
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center w-full max-w-sm">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              Loading financial data...
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Analyzing your financial documents
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-red-600" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Report Generation Failed
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                We encountered an issue while generating your reports. Please try again or upload new data.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-900 hover:bg-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Reports
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a href="/upload">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload New Data
                  </a>
                </Button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                Error: {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && !financialData && (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-slate-600" />
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Financial Reports
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Upload your financial data to generate professional reports including P&L statements, balance sheets, and custom reports.
              </p>

              <Button
                asChild
                size="lg"
                className="bg-slate-700 hover:bg-slate-800"
              >
                <a href="/upload">
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Create Reports
                </a>
              </Button>

              <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="text-center">
                  <div className="w-3 h-3 bg-slate-100 rounded-full mx-auto mb-2"></div>
                  P&L Statements
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-slate-100 rounded-full mx-auto mb-2"></div>
                  Balance Sheets
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-slate-100 rounded-full mx-auto mb-2"></div>
                  Custom Reports
                </div>
              </div>
            </div>
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
                        {index === 1 && typeof window !== 'undefined' && window.innerWidth < 640
                          ? "Balance"
                          : safeString(tab, 'Report')}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Report Table */}
            <Card className="lg:col-span-3">
              <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeTab === 0
                        ? "bg-blue-100 text-blue-600"
                        : activeTab === 1
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-purple-100 text-purple-600"
                        }`}
                    >
                      {activeTab === 0 && <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />}
                      {activeTab === 1 && <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />}
                      {activeTab === 2 && <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base sm:text-lg font-semibold text-gray-900">
                        {tabs[activeTab]}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 font-normal truncate">
                        {financialData?.analysisData?.file_info?.filename || 
                         financialData?.analysisData?.analysis?.file_info?.filename || 
                         financialData?.metadata?.fileName || 'No file selected'}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 sm:pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm text-gray-700 placeholder-gray-400 w-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-3 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500"
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
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                              <div className="flex items-center space-x-2">
                                {row.isTotal && (
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                                )}
                                {row.isNetIncome && (
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                                <span
                                  className={`min-w-0 ${
                                    row?.isTotal ? "font-semibold" : ""
                                    } ${row?.isNetIncome ? "font-bold" : ""}`}
                                >
                                  {safeString(row?.account, 'Unknown Account')}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-right font-medium ${safeNumber(row?.amount) === 0
                                ? "text-gray-400"
                                : safeNumber(row?.amount) > 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                                } ${row?.isNetIncome
                                ? "text-blue-600 font-bold text-sm sm:text-base"
                                  : ""
                                }`}
                            >
                              {safeNumber(row?.amount) === 0 && row?.isTotal
                                ? ""
                                : formatCurrency(row?.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                        </tbody>
                      </table>
                </div>

                {/* Pagination */}
                {filteredData.length > itemsPerPage && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
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
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
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
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="h-fit lg:sticky lg:top-4">
              <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-3 w-3 sm:h-3 sm:w-3 text-slate-600" />
                  </div>
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* File Info Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      File Name
                    </p>
                    <p
                      className="text-xs sm:text-sm font-semibold text-gray-900 truncate"
                      title={financialData.analysisData?.file_info?.filename || 
                             financialData.analysisData?.analysis?.file_info?.filename || ""}
                    >
                      {financialData.analysisData?.file_info?.filename || 
                       financialData.analysisData?.analysis?.file_info?.filename || "Unknown"}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      File Type
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">
                      {financialData.analysisData?.file_info?.file_type || 
                       financialData.analysisData?.analysis?.file_info?.file_type || "Unknown"}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      File Size
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {(financialData.analysisData?.file_info?.file_size_mb || 
                        financialData.analysisData?.analysis?.file_info?.file_size_mb || 0).toFixed(2)} MB
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
                          {formatCurrency(
                            safeGet(getAnalysisObj(), 'profit_and_loss.revenue_analysis.total_revenue', 0)
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Expenses
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(
                            Math.abs(safeGet(getAnalysisObj(), 'profit_and_loss.cost_structure.total_expenses', 0))
                          )}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${safeNumber(safeGet(getAnalysisObj(), 'profit_and_loss.profitability_metrics.net_income', 0)) >= 0
                          ? "bg-blue-50 border-blue-200"
                          : "bg-orange-50 border-orange-200"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Net Income
                        </p>
                        <p
                          className={`text-lg font-bold ${safeNumber(safeGet(getAnalysisObj(), 'profit_and_loss.profitability_metrics.net_income', 0)) >= 0
                            ? "text-blue-600"
                            : "text-orange-600"
                            }`}
                        >
                          {formatCurrency(
                            Math.abs(safeGet(getAnalysisObj(), 'profit_and_loss.profitability_metrics.net_income', 0))
                          )}
                          {safeNumber(safeGet(getAnalysisObj(), 'profit_and_loss.profitability_metrics.net_income', 0)) < 0
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
                          {formatCurrency(
                            safeGet(getAnalysisObj(), 'balance_sheet.assets.total_assets', 0)
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Liabilities
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(
                            safeGet(getAnalysisObj(), 'balance_sheet.liabilities.total_liabilities', 0)
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Equity
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(
                            safeGet(getAnalysisObj(), 'balance_sheet.equity.total_equity', 0)
                          )}
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
                        className={`p-4 rounded-lg border ${safeNumber(safeGet(getAnalysisObj(), 'cash_flow_analysis.operating_activities.net_cash_from_operations', 0)) >= 0
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-red-50 border-red-200"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Operating Cash Flow
                        </p>
                        <p
                          className={`text-lg font-bold ${safeNumber(safeGet(getAnalysisObj(), 'cash_flow_analysis.operating_activities.net_cash_from_operations', 0)) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                            }`}
                        >
                          {formatCurrency(
                            Math.abs(safeGet(getAnalysisObj(), 'cash_flow_analysis.operating_activities.net_cash_from_operations', 0))
                          )}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${safeNumber(safeGet(getAnalysisObj(), 'cash_flow_analysis.cash_position.free_cash_flow', 0)) >= 0
                          ? "bg-blue-50 border-blue-200"
                          : "bg-orange-50 border-orange-200"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Free Cash Flow
                        </p>
                        <p
                          className={`text-lg font-bold ${safeNumber(safeGet(getAnalysisObj(), 'cash_flow_analysis.cash_position.free_cash_flow', 0)) >= 0
                            ? "text-blue-600"
                            : "text-orange-600"
                            }`}
                        >
                          {formatCurrency(
                            Math.abs(safeGet(getAnalysisObj(), 'cash_flow_analysis.cash_position.free_cash_flow', 0))
                          )}
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

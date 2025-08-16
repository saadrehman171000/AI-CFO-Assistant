"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, BarChart3, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import FinancialDocumentUpload from './financial-document-upload'
import ComprehensiveFinancialDashboard from '../dashboard/comprehensive-financial-dashboard'

interface FinancialAnalysisData {
  file_info: {
    filename: string
    file_type: string
    file_size_mb: number
  }
  analysis: any
}

export default function FinancialAnalysisHub() {
  const [analysisData, setAnalysisData] = useState<FinancialAnalysisData | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [analysisHistory, setAnalysisHistory] = useState<FinancialAnalysisData[]>([])

  const handleAnalysisComplete = (newAnalysis: FinancialAnalysisData) => {
    setAnalysisData(newAnalysis)
    setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    setActiveTab("dashboard") // Switch to dashboard tab after upload
  }

  const handleLoadPreviousAnalysis = (analysis: FinancialAnalysisData) => {
    setAnalysisData(analysis)
    setActiveTab("dashboard")
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    if (score >= 40) return 'secondary'
    return 'destructive'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Financial Analysis Hub</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Simply upload your financial document and get instant comprehensive AI analysis including profit & loss insights, 
          balance sheet analysis, cash flow optimization, and strategic recommendations.
        </p>
      </div>

      {/* Analysis History Sidebar */}
      {analysisHistory.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
            <CardDescription>
              Quick access to your previous financial analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {analysisHistory.slice(0, 5).map((analysis, index) => (
                <div 
                  key={index}
                  className="p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleLoadPreviousAnalysis(analysis)}
                >
                  <div className="text-sm font-medium truncate mb-1" title={analysis.file_info.filename}>
                    {analysis.file_info.filename}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {analysis.file_info.file_type.toUpperCase()}
                    </div>
                    <Badge 
                      variant={getHealthScoreBadgeVariant(analysis.analysis.executive_summary.business_health_score)}
                      className="text-xs"
                    >
                      {analysis.analysis.executive_summary.business_health_score}
                    </Badge>
                  </div>
                  <div className={`text-xs font-medium mt-1 ${getHealthScoreColor(analysis.analysis.executive_summary.business_health_score)}`}>
                    {analysis.analysis.executive_summary.financial_strength}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </TabsTrigger>
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2"
            disabled={!analysisData}
          >
            <BarChart3 className="h-4 w-4" />
            Financial Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="compare" 
            className="flex items-center gap-2"
            disabled={analysisHistory.length < 2}
          >
            <TrendingUp className="h-4 w-4" />
            Compare Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <FinancialDocumentUpload onAnalysisComplete={handleAnalysisComplete} />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {analysisData ? (
            <div className="space-y-4">
              {/* Quick Summary Header */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{analysisData.file_info.filename}</h3>
                      <p className="text-gray-600">
                        {analysisData.file_info.file_type.toUpperCase()} • {analysisData.file_info.file_size_mb}MB
                      </p>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getHealthScoreColor(analysisData.analysis.executive_summary.business_health_score)}`}>
                        {analysisData.analysis.executive_summary.business_health_score}
                      </div>
                      <div className="text-sm text-gray-600">Health Score</div>
                      <Badge variant={getHealthScoreBadgeVariant(analysisData.analysis.executive_summary.business_health_score)}>
                        {analysisData.analysis.executive_summary.financial_strength}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(analysisData.analysis.profit_and_loss.revenue_analysis.total_revenue)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className={`text-lg font-bold ${analysisData.analysis.profit_and_loss.profitability_metrics.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysisData.analysis.profit_and_loss.profitability_metrics.net_income)}
                      </div>
                      <div className="text-sm text-gray-600">Net Income</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {((analysisData.analysis.profit_and_loss.profitability_metrics.margins.net_margin || 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Net Margin</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className={`text-lg font-bold ${analysisData.analysis.cash_flow_analysis.operating_activities.net_cash_from_operations >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysisData.analysis.cash_flow_analysis.operating_activities.net_cash_from_operations)}
                      </div>
                      <div className="text-sm text-gray-600">Cash Flow</div>
                    </div>
                  </div>

                  {/* Critical Alerts */}
                  {analysisData.analysis.executive_summary.critical_alerts.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold">Critical Alert:</div>
                        <div className="text-sm">
                          {analysisData.analysis.executive_summary.critical_alerts[0]}
                          {analysisData.analysis.executive_summary.critical_alerts.length > 1 && (
                            <span className="ml-2 text-xs">
                              +{analysisData.analysis.executive_summary.critical_alerts.length - 1} more alerts
                            </span>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <ComprehensiveFinancialDashboard analysisData={analysisData} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analysis Available</h3>
              <p className="text-gray-500 mb-4">
                Upload a financial document to see comprehensive AI-powered analysis and insights.
              </p>
              <Button onClick={() => setActiveTab("upload")}>
                Upload Document
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compare Financial Analyses
              </CardTitle>
              <CardDescription>
                Compare key metrics across multiple financial documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisHistory.length >= 2 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-3 text-left font-semibold">Metric</th>
                          {analysisHistory.slice(0, 3).map((analysis, index) => (
                            <th key={index} className="border border-gray-200 p-3 text-center font-semibold">
                              <div className="truncate max-w-32" title={analysis.file_info.filename}>
                                {analysis.file_info.filename}
                              </div>
                              <div className="text-xs text-gray-500 font-normal">
                                {analysis.file_info.file_type.toUpperCase()}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 p-3 font-medium">Health Score</td>
                          {analysisHistory.slice(0, 3).map((analysis, index) => (
                            <td key={index} className="border border-gray-200 p-3 text-center">
                              <Badge variant={getHealthScoreBadgeVariant(analysis.analysis.executive_summary.business_health_score)}>
                                {analysis.analysis.executive_summary.business_health_score}
                              </Badge>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3 font-medium">Total Revenue</td>
                          {analysisHistory.slice(0, 3).map((analysis, index) => (
                            <td key={index} className="border border-gray-200 p-3 text-center font-semibold text-green-600">
                              {formatCurrency(analysis.analysis.profit_and_loss.revenue_analysis.total_revenue)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3 font-medium">Net Income</td>
                          {analysisHistory.slice(0, 3).map((analysis, index) => (
                            <td key={index} className={`border border-gray-200 p-3 text-center font-semibold ${analysis.analysis.profit_and_loss.profitability_metrics.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(analysis.analysis.profit_and_loss.profitability_metrics.net_income)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3 font-medium">Net Margin</td>
                          {analysisHistory.slice(0, 3).map((analysis, index) => (
                            <td key={index} className="border border-gray-200 p-3 text-center font-semibold">
                              {((analysis.analysis.profit_and_loss.profitability_metrics.margins.net_margin || 0) * 100).toFixed(1)}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-gray-200 p-3 font-medium">Cash Flow</td>
                          {analysisHistory.slice(0, 3).map((analysis, index) => (
                            <td key={index} className={`border border-gray-200 p-3 text-center font-semibold ${analysis.analysis.cash_flow_analysis.operating_activities.net_cash_from_operations >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(analysis.analysis.cash_flow_analysis.operating_activities.net_cash_from_operations)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Upload at least 2 financial documents to compare analyses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, BarChart3, TrendingUp, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ReportType } from '@prisma/client'

interface ParsedFinancialData {
  id: string
  accountName: string
  accountCategory?: string
  amount: number
  dataType: string
  period?: string
  notes?: string
}

interface FinancialReport {
  id: string
  fileName: string
  fileType: string
  reportType: ReportType
  year: number
  month: number
  fileSize: number
  uploadDate: string
  status: string
  parsedData: ParsedFinancialData[]
}

export default function UploadContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reportType, setReportType] = useState<ReportType>(ReportType.PROFIT_LOSS)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedReport, setUploadedReport] = useState<FinancialReport | null>(null)
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase()
      if (fileType && ['csv', 'pdf', 'xlsx', 'xls'].includes(fileType)) {
        setSelectedFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV, PDF, Excel (.xlsx, .xls) file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('reportType', reportType)
    formData.append('year', year.toString())
    formData.append('month', month.toString())

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setUploadedReport(result.report)
        toast({
          title: "Upload successful",
          description: "Your financial report has been uploaded and parsed successfully.",
        })
        // Reset form
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Refresh reports list
        loadReports()
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload file.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const loadReports = async () => {
    setIsLoadingReports(true)
    try {
      const response = await fetch('/api/upload', {
        credentials: 'include'
      })
      if (response.ok) {
        const result = await response.json()
        setReports(result.reports || [])
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setIsLoadingReports(false)
    }
  }

  // Load reports on component mount
  useEffect(() => {
    loadReports()
  }, [])

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, string> = {
      REVENUE: 'text-green-600',
      EXPENSE: 'text-red-600',
      ASSET: 'text-blue-600',
      LIABILITY: 'text-orange-600',
      EQUITY: 'text-purple-600',
      CASH_FLOW_IN: 'text-green-600',
      CASH_FLOW_OUT: 'text-red-600',
    }
    return colors[dataType] || 'text-gray-600'
  }

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case ReportType.PROFIT_LOSS:
        return <TrendingUp className="h-4 w-4" />
      case ReportType.BALANCE_SHEET:
        return <BarChart3 className="h-4 w-4" />
      case ReportType.CASH_FLOW:
        return <DollarSign className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Financial Reports</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your financial reports to get AI-powered insights, automated analysis, and intelligent recommendations for better financial decision-making.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>Upload New Report</span>
          </CardTitle>
          <CardDescription className="text-base">
            Upload your financial reports (CSV or PDF) to get started with AI-powered insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportType" className="text-sm font-medium">Report Type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportType.PROFIT_LOSS}>Profit & Loss</SelectItem>
                  <SelectItem value={ReportType.BALANCE_SHEET}>Balance Sheet</SelectItem>
                  <SelectItem value={ReportType.CASH_FLOW}>Cash Flow</SelectItem>
                  <SelectItem value={ReportType.AR_AGING}>AR Aging</SelectItem>
                  <SelectItem value={ReportType.AP_AGING}>AP Aging</SelectItem>
                  <SelectItem value="TRIAL_BALANCE">Trial Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min={2000}
                max={2030}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm font-medium">Month</Label>
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {getMonthName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">Select File</Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept=".csv,.pdf,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="h-11 cursor-pointer"
              />
              {selectedFile && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, PDF, Excel (.xlsx, .xls) (max 10MB)
            </p>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Processing Report...
              </>
            ) : (
              <>
                <Upload className="mr-3 h-5 w-5" />
                Upload & Analyze Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recently Uploaded Report */}
      {uploadedReport && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Successfully Processed Report</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              {uploadedReport.fileName} - {getMonthName(uploadedReport.month)} {uploadedReport.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{uploadedReport.parsedData.length}</div>
                  <div className="text-sm text-green-700">Records Parsed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-lg font-semibold text-gray-800">
                    {uploadedReport.fileType === 'XLSX' ? 'Excel (.xlsx)' : 
                     uploadedReport.fileType === 'XLS' ? 'Excel (.xls)' :
                     uploadedReport.fileType === 'CSV' ? 'CSV' :
                     uploadedReport.fileType === 'PDF' ? 'PDF' : uploadedReport.fileType}
                  </div>
                  <div className="text-sm text-gray-600">File Type</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-lg font-semibold text-gray-800">{uploadedReport.reportType.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600">Report Type</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-lg font-semibold text-gray-800">{(uploadedReport.fileSize / 1024).toFixed(1)} KB</div>
                  <div className="text-sm text-gray-600">File Size</div>
                </div>
              </div>

              {uploadedReport.parsedData.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4 text-green-800">Data Preview</h4>
                  <div className="max-h-80 overflow-y-auto border border-green-200 rounded-lg bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-green-50">
                        <tr className="border-b border-green-200">
                          <th className="text-left p-3 font-medium text-green-800">Account</th>
                          <th className="text-left p-3 font-medium text-green-800">Category</th>
                          <th className="text-right p-3 font-medium text-green-800">Amount</th>
                          <th className="text-left p-3 font-medium text-green-800">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedReport.parsedData.slice(0, 15).map((record) => (
                          <tr key={record.id} className="border-b border-green-100 hover:bg-green-50">
                            <td className="p-3 font-medium">{record.accountName}</td>
                            <td className="p-3 text-gray-600">{record.accountCategory || '-'}</td>
                            <td className={`p-3 text-right font-semibold ${getDataTypeColor(record.dataType)}`}>
                              {formatCurrency(record.amount)}
                            </td>
                            <td className="p-3 text-gray-600">{record.dataType.replace('_', ' ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {uploadedReport.parsedData.length > 15 && (
                      <div className="p-3 text-center text-sm text-green-700 bg-green-50 border-t border-green-200">
                        Showing first 15 of {uploadedReport.parsedData.length} records
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Uploaded Reports History</span>
          </CardTitle>
          <CardDescription>
            View and manage all your uploaded financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No reports uploaded yet</h3>
              <p className="text-gray-500">Upload your first financial report to get started with AI-powered insights.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getReportTypeIcon(report.reportType)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{report.fileName}</h4>
                        <p className="text-gray-600">
                          {getMonthName(report.month)} {report.year} • {report.reportType.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {new Date(report.uploadDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{(report.fileSize / 1024).toFixed(1)} KB</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : report.status === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {report.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {report.status === 'PROCESSING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {report.status === 'FAILED' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {report.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>{report.parsedData.length} records parsed</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>
                          {report.fileType === 'XLSX' ? 'Excel (.xlsx)' : 
                           report.fileType === 'XLS' ? 'Excel (.xls)' :
                           report.fileType === 'CSV' ? 'CSV' :
                           report.fileType === 'PDF' ? 'PDF' : report.fileType}
                        </span>
                      </span>
                    </div>
                    
                    {report.parsedData.length > 0 && (
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

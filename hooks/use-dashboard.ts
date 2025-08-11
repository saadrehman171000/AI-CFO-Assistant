import { useState, useEffect, useCallback } from 'react'

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossMargin: number
  netMargin: number
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cashFlowFromOperations: number
  cashFlowFromInvesting: number
  cashFlowFromFinancing: number
  netCashFlow: number
  arDays: number
  apDays: number
  ebitda: number
  currentRatio: number
  quickRatio: number
  debtToEquityRatio: number
}

interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  impact: string
  suggestion?: string
}

interface DashboardData {
  metrics: FinancialMetrics
  insights: AIInsight[]
  trends: {
    revenue: number[]
    expenses: number[]
    profit: number[]
    months: string[]
  }
  topAccounts: {
    revenue: any[]
    expenses: any[]
    assets: any[]
    liabilities: any[]
  }
  reportInfo?: {
    latestReport: {
      id: string
      fileName: string
      reportType: string
      year: number
      month: number
      uploadDate: string
      totalRecords: number
    }
    totalReports: number
    totalRecords: number
  }
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to load dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const analyzeReport = useCallback(async (reportId: string) => {
    try {
      setError(null)
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze report')
      }
      
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        return result.data
      } else {
        throw new Error(result.error || 'Failed to analyze report')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refreshing,
    fetchData,
    refreshData,
    analyzeReport,
  }
}

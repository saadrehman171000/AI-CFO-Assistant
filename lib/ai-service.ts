import OpenAI from 'openai'
import { ParsedFinancialData, ReportType } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FinancialMetrics {
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

export interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  impact: string
  suggestion?: string
}

export interface DashboardData {
  metrics: FinancialMetrics
  insights: AIInsight[]
  trends: {
    revenue: number[]
    expenses: number[]
    profit: number[]
    months: string[]
  }
  topAccounts: {
    revenue: ParsedFinancialData[]
    expenses: ParsedFinancialData[]
    assets: ParsedFinancialData[]
    liabilities: ParsedFinancialData[]
  }
}

export class FinancialAIService {
  private static calculateBasicMetrics(data: ParsedFinancialData[], reportType: ReportType): Partial<FinancialMetrics> {
    const metrics: Partial<FinancialMetrics> = {}
    
    if (reportType === ReportType.PROFIT_LOSS || reportType === ReportType.TRIAL_BALANCE) {
      const revenue = data.filter(d => d.dataType === 'REVENUE').reduce((sum, d) => sum + Number(d.amount), 0)
      const expenses = data.filter(d => d.dataType === 'EXPENSE').reduce((sum, d) => sum + Number(d.amount), 0)
      
      metrics.totalRevenue = revenue
      metrics.totalExpenses = expenses
      metrics.netProfit = revenue - expenses
      metrics.grossMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
      metrics.netMargin = revenue > 0 ? (metrics.netProfit / revenue) * 100 : 0
    }
    
    if (reportType === ReportType.BALANCE_SHEET || reportType === ReportType.TRIAL_BALANCE) {
      const assets = data.filter(d => d.dataType === 'ASSET').reduce((sum, d) => sum + Number(d.amount), 0)
      const liabilities = data.filter(d => d.dataType === 'LIABILITY').reduce((sum, d) => sum + Number(d.amount), 0)
      const equity = data.filter(d => d.dataType === 'EQUITY').reduce((sum, d) => sum + Number(d.amount), 0)
      
      metrics.totalAssets = assets
      metrics.totalLiabilities = liabilities
      metrics.totalEquity = equity
      metrics.currentRatio = liabilities > 0 ? assets / liabilities : 0
      metrics.debtToEquityRatio = equity > 0 ? liabilities / equity : 0
    }
    
    if (reportType === ReportType.CASH_FLOW) {
      const operations = data.filter(d => d.dataType === 'CASH_FLOW_IN').reduce((sum, d) => sum + Number(d.amount), 0)
      const investing = data.filter(d => d.dataType === 'CASH_FLOW_OUT').reduce((sum, d) => sum + Number(d.amount), 0)
      
      metrics.cashFlowFromOperations = operations
      metrics.cashFlowFromInvesting = -investing
      metrics.netCashFlow = operations - investing
    }
    
    return metrics
  }

  private static async generateAIInsights(
    data: ParsedFinancialData[], 
    metrics: Partial<FinancialMetrics>, 
    reportType: ReportType,
    previousData?: ParsedFinancialData[]
  ): Promise<AIInsight[]> {
    try {
      const prompt = this.buildAnalysisPrompt(data, metrics, reportType, previousData)
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst AI. Provide insights based on financial data. Return insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const aiResponse = response.choices[0]?.message?.content || ''
      return this.parseAIResponse(aiResponse)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return this.generateFallbackInsights(data, metrics, reportType)
    }
  }

  private static buildAnalysisPrompt(
    data: ParsedFinancialData[], 
    metrics: Partial<FinancialMetrics>, 
    reportType: ReportType,
    previousData?: ParsedFinancialData[]
  ): string {
    let prompt = `Analyze the following financial data and provide insights:

Current Data:
${data.slice(0, 10).map(record => 
  `${record.accountName}: $${record.amount} (${record.dataType})`
).join('\n')}

Current Metrics:
${Object.entries(metrics)
  .filter(([, value]) => value !== undefined && value !== null)
  .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toLocaleString() : value}`)
  .join(', ')}

Report Type: ${reportType}`

    if (previousData && previousData.length > 0) {
      const prevMetrics = this.calculateBasicMetrics(previousData, reportType)
      prompt += `

Previous metrics: ${Object.entries(prevMetrics)
  .filter(([, value]) => value !== undefined && value !== null)
  .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toLocaleString() : value}`)
  .join(', ')}

Please include period-over-period analysis in your insights.`
    }

    return prompt
  }

  private static parseAIResponse(response: string): AIInsight[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.insights && Array.isArray(parsed.insights)) {
          return parsed.insights.map((insight: Record<string, unknown>) => ({
            type: (insight.type as string) || 'summary',
            title: (insight.title as string) || 'Financial Insight',
            description: (insight.description as string) || 'Analysis of financial data',
            severity: (insight.severity as 'low' | 'medium' | 'high') || 'medium',
            impact: (insight.impact as string) || 'Provides insights into financial performance',
            suggestion: insight.suggestion as string | undefined
          }))
        }
      }
      
      // Fallback parsing if JSON extraction fails
      return this.parseFallbackResponse(response)
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return this.generateDefaultInsights()
    }
  }

  private static parseFallbackResponse(response: string): AIInsight[] {
    const insights: AIInsight[] = []
    const lines = response.split('\n').filter(line => line.trim())
    
    let currentInsight: Partial<AIInsight> = {}
    
    for (const line of lines) {
      if (line.includes('Title:') || line.includes('Insight:')) {
        if (currentInsight.title) {
          insights.push(this.completeInsight(currentInsight))
        }
        currentInsight = { title: line.split(':')[1]?.trim() || 'Financial Insight' }
      } else if (line.includes('Description:') || line.includes('Details:')) {
        currentInsight.description = line.split(':')[1]?.trim() || 'Analysis of financial data'
      } else if (line.includes('Severity:') || line.includes('Priority:')) {
        const severity = line.toLowerCase().includes('high') ? 'high' : 
                        line.toLowerCase().includes('medium') ? 'medium' : 'low'
        currentInsight.severity = severity
      }
    }
    
    if (currentInsight.title) {
      insights.push(this.completeInsight(currentInsight))
    }
    
    return insights.length > 0 ? insights : this.generateDefaultInsights()
  }

  private static completeInsight(partial: Partial<AIInsight>): AIInsight {
    return {
      type: partial.type || 'summary',
      title: partial.title || 'Financial Insight',
      description: partial.description || 'Analysis of financial data',
      severity: partial.severity || 'medium',
      impact: partial.impact || 'Provides insights into financial performance',
      suggestion: partial.suggestion
    }
  }

  private static generateFallbackInsights(
    data: ParsedFinancialData[], 
    metrics: Partial<FinancialMetrics>
  ): AIInsight[] {
    const insights: AIInsight[] = []
    
          // Revenue and Profitability Analysis
      if (metrics.totalRevenue && metrics.totalExpenses && metrics.netProfit !== undefined) {
        if (metrics.netProfit > 0) {
          const profitMargin = ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1)
          insights.push({
            type: 'summary',
            title: 'Positive Net Profit Achieved',
            description: `Company is profitable with a net profit of $${metrics.netProfit.toLocaleString()} and a ${profitMargin}% profit margin`,
            severity: 'low',
            impact: 'Good financial health with positive earnings and healthy margins'
          })
        } else {
          const lossMargin = ((Math.abs(metrics.netProfit) / metrics.totalRevenue) * 100).toFixed(1)
          insights.push({
            type: 'summary',
            title: 'Negative Net Profit Detected',
            description: `Company is operating at a loss of $${Math.abs(metrics.netProfit).toLocaleString()} with a ${lossMargin}% loss margin`,
            severity: 'high',
            impact: 'Immediate attention needed to improve profitability and cash flow',
            suggestion: 'Review expense structure, pricing strategy, and revenue streams'
          })
        }

      // Expense Analysis
      if (metrics.totalExpenses > metrics.totalRevenue * 0.8) {
        insights.push({
          type: 'anomaly',
          title: 'High Expense Ratio',
          description: `Expenses represent ${((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}% of revenue, which is above healthy levels`,
          severity: 'medium',
          impact: 'May indicate operational inefficiencies or need for cost control',
          suggestion: 'Conduct expense audit and identify areas for cost optimization'
        })
      }
    }
    
          // Balance Sheet Analysis
      if (metrics.totalAssets && metrics.totalLiabilities) {
        if (metrics.currentRatio && metrics.currentRatio > 1.5) {
          insights.push({
            type: 'trend',
            title: 'Strong Liquidity Position',
            description: `Current ratio of ${metrics.currentRatio.toFixed(2)} indicates excellent short-term financial health`,
            severity: 'low',
            impact: 'Company has strong ability to meet short-term obligations and invest in growth'
          })
        } else if (metrics.currentRatio && metrics.currentRatio < 1) {
          insights.push({
            type: 'anomaly',
            title: 'Liquidity Concerns',
            description: `Current ratio of ${metrics.currentRatio.toFixed(2)} may indicate short-term financial challenges`,
            severity: 'high',
            impact: 'May face difficulties meeting short-term obligations',
            suggestion: 'Review working capital management and cash flow projections'
          })
        }

        if (metrics.debtToEquityRatio && metrics.debtToEquityRatio > 1) {
          insights.push({
            type: 'anomaly',
            title: 'High Debt-to-Equity Ratio',
            description: `Debt-to-equity ratio of ${metrics.debtToEquityRatio.toFixed(2)} indicates high financial leverage`,
            severity: 'medium',
            impact: 'Increased financial risk and interest expense burden',
            suggestion: 'Consider debt reduction strategies and monitor interest coverage'
          })
        }
      }

    // Cash Flow Analysis
    if (metrics.netCashFlow !== undefined) {
      if (metrics.netCashFlow > 0) {
        insights.push({
          type: 'trend',
          title: 'Positive Cash Flow',
          description: `Net cash flow of $${metrics.netCashFlow.toLocaleString()} indicates healthy cash generation`,
          severity: 'low',
          impact: 'Strong cash position for operations, investments, and debt service'
        })
      } else {
        insights.push({
          type: 'anomaly',
          title: 'Negative Cash Flow',
          description: `Net cash flow of -$${Math.abs(metrics.netCashFlow).toLocaleString()} requires attention`,
          severity: 'medium',
          impact: 'May need external financing or operational adjustments',
          suggestion: 'Review cash flow drivers and implement cash management strategies'
        })
      }
    }

    // Top Accounts Analysis
    const topExpenses = data
      .filter(d => d.dataType === 'EXPENSE')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 3)

    if (topExpenses.length > 0) {
      const largestExpense = topExpenses[0]
      const expensePercentage = ((Number(largestExpense.amount) / (metrics.totalExpenses || 1)) * 100).toFixed(1)
      
      if (Number(expensePercentage) > 30) {
        insights.push({
          type: 'anomaly',
          title: 'Concentrated Expense Risk',
          description: `${largestExpense.accountName} represents ${expensePercentage}% of total expenses`,
          severity: 'medium',
          impact: 'High dependency on single expense category increases operational risk',
          suggestion: 'Diversify expense structure and negotiate better terms'
        })
      }
    }
    
    return insights
  }

  private static generateDefaultInsights(): AIInsight[] {
    return [
      {
        type: 'summary',
        title: 'Financial Data Successfully Processed',
        description: 'Financial report has been analyzed and processed successfully',
        severity: 'low',
        impact: 'Data is ready for review and analysis by financial team'
      }
    ]
  }

  public static async analyzeFinancialData(
    data: ParsedFinancialData[], 
    reportType: ReportType,
    previousData?: ParsedFinancialData[]
  ): Promise<DashboardData> {
    const metrics = this.calculateBasicMetrics(data, reportType)
    const insights = await this.generateAIInsights(data, metrics, reportType, previousData)
    
    // Calculate trends (simplified - would need historical data for real trends)
    const trends = {
      revenue: [metrics.totalRevenue || 0],
      expenses: [metrics.totalExpenses || 0],
      profit: [metrics.netProfit || 0],
      months: [new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })]
    }
    
    // Get top accounts by category
    const topAccounts = {
      revenue: data.filter(d => d.dataType === 'REVENUE').sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5),
      expenses: data.filter(d => d.dataType === 'EXPENSE').sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5),
      assets: data.filter(d => d.dataType === 'ASSET').sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5),
      liabilities: data.filter(d => d.dataType === 'LIABILITY').sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5)
    }
    
    return {
      metrics: metrics as FinancialMetrics,
      insights,
      trends,
      topAccounts
    }
  }
}

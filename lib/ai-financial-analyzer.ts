import OpenAI from 'openai'
import { ReportType } from '@prisma/client'
import { ParsedFinancialRecord } from './parsers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FinancialAnalysisResult {
  sheetType: string
  summary: {
    totalDebits?: number
    totalCredits?: number
    imbalance?: number
    totalAssets?: number
    totalLiabilities?: number
    totalEquity?: number
    totalRevenue?: number
    totalExpenses?: number
    grossProfit?: number
    operatingIncome?: number
    netProfit?: number
    grossMargin?: number
    netMargin?: number
    topAccounts?: Array<{
      name: string
      debit?: number
      credit?: number
      amount?: number
      category?: string
    }>
    cashFlowOperating?: number
    cashFlowInvesting?: number
    cashFlowFinancing?: number
    netCashFlow?: number
  }
  accounts: Array<{
    name: string
    category: string
    debit?: number
    credit?: number
    amount?: number
    balance: number
  }>
  insights: Array<{
    type: 'trend' | 'anomaly' | 'recommendation' | 'summary'
    title: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
}

export class AIFinancialAnalyzer {
  static async analyzeFinancialData(
    rawData: string[][],
    parsedRecords: ParsedFinancialRecord[],
    reportType: ReportType
  ): Promise<FinancialAnalysisResult> {
    try {
      // Prepare the data for AI analysis
      const dataForAnalysis = this.prepareDataForAnalysis(rawData, parsedRecords)
      
      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(dataForAnalysis)
      
      // Parse and structure the AI response
      const structuredResult = this.parseAIResponse(aiAnalysis, parsedRecords)
      
      return structuredResult
    } catch (error) {
      console.error('AI Financial Analysis error:', error)
      // Fallback to basic analysis
      return this.generateFallbackAnalysis(parsedRecords)
    }
  }

  private static prepareDataForAnalysis(rawData: string[][], parsedRecords: ParsedFinancialRecord[]): string {
    const headers = rawData[0] || []
    const dataRows = rawData.slice(1, 6) // First 5 data rows for context
    
    const dataString = `RAW EXCEL DATA (First 5 rows):
Headers: ${headers.join(' | ')}
Data Rows:
${dataRows.map((row, i) => `${i + 1}: ${row.join(' | ')}`).join('\n')}

PARSED FINANCIAL RECORDS (${parsedRecords.length} records):
${parsedRecords.map(record => 
  `${record.accountName}: $${record.amount} (${record.dataType})`
).join('\n')}

ANALYSIS REQUIREMENTS:
=====================

You are a financial analysis assistant for an accounting dashboard. Analyze this financial data and:

1. DETECT SHEET TYPE: Determine if this is a Trial Balance, Balance Sheet, P&L Statement, or Cash Flow Statement
2. CALCULATE KEY METRICS: Total assets, liabilities, equity, revenue, expenses, net income
3. IDENTIFY INSIGHTS: Trends, anomalies, areas of concern, opportunities
4. PROVIDE RECOMMENDATIONS: Actionable financial advice

CRITICAL: Return ONLY valid JSON with this exact structure:
{
  "sheetType": "trial_balance|balance_sheet|pnl|cash_flow",
  "summary": {
    "totalAssets": 103559.49,
    "totalLiabilities": -10418.1,
    "totalEquity": -30077.35,
    "totalRevenue": -139000.51,
    "totalExpenses": 43395.43,
    "netIncome": -182395.94
  },
  "keyMetrics": {
    "currentRatio": -9.93,
    "debtToEquityRatio": 0.35,
    "profitMargin": -130.0,
    "returnOnAssets": -176.0
  },
  "insights": [
    {
      "type": "trend|anomaly|recommendation|summary",
      "title": "string",
      "description": "string",
      "severity": "low|medium|high"
    }
  ]
}

IMPORTANT: 
- All property names must be in double quotes
- All string values must be in double quotes  
- Numeric values must NOT be in quotes and should not have commas
- No trailing commas
- Only the JSON object, nothing else`

    return dataString
  }

  private static async generateAIAnalysis(dataForAnalysis: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert financial analyst AI specializing in accounting and financial statement analysis. Your role is to:

1. Accurately classify financial sheet types (Trial Balance, Balance Sheet, P&L, Cash Flow)
2. Perform precise financial calculations and verify mathematical accuracy
3. Identify key financial insights, trends, and anomalies
4. Provide actionable recommendations for financial management

CRITICAL REQUIREMENT: You MUST return ONLY valid JSON. No explanations, no text outside the JSON structure. 

JSON FORMATTING RULES:
- All property names must be in double quotes
- All string values must be in double quotes  
- Numeric values must NOT be in quotes (e.g., 103559.49, not "103559.49")
- Do not use commas in numbers (e.g., 103559.49, not 103,559.49)
- No trailing commas
- Only the JSON object, nothing else

Be precise with numbers, thorough in analysis, and always return valid JSON.`
          },
          {
            role: "user",
            content: dataForAnalysis
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate AI analysis')
    }
  }

  private static parseAIResponse(aiResponse: string, parsedRecords: ParsedFinancialRecord[]): FinancialAnalysisResult {
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      // Clean and fix common JSON formatting issues
      const cleanedJson = jsonMatch[0]
        .replace(/(\w+):/g, '"$1":') // Quote unquoted property names
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        // Fix numeric values: remove commas from numbers while preserving structure
        .replace(/:\s*([\d,.-]+)(?=\s*[,}\]])/g, (match, number) => {
          // Remove commas from the number and preserve the original spacing
          const cleanNumber = number.replace(/,/g, '');
          return match.replace(number, cleanNumber);
        })
        // Handle any remaining quoted numbers with commas
        .replace(/"([\d,.-]+)"/g, (match, number) => {
          // Remove quotes and commas from the number
          const cleanNumber = number.replace(/,/g, '');
          return cleanNumber;
        });

      try {
        const parsed = JSON.parse(cleanedJson)
        
        // Validate and structure the response
        const result: FinancialAnalysisResult = {
          sheetType: parsed.sheetType || 'Unknown',
          summary: parsed.summary || {},
          accounts: this.generateAccountsList(parsedRecords),
          insights: parsed.insights || []
        }

        return result
      } catch (jsonError) {
        console.error('JSON parsing failed after cleaning:', jsonError)
        console.log('Original response:', aiResponse)
        console.log('Cleaned JSON attempt:', cleanedJson)
        
        // Try to extract specific fields using regex as fallback
        const sheetTypeMatch = aiResponse.match(/sheetType["\s]*:["\s]*([^",\n]+)/i)
        const sheetType = sheetTypeMatch ? sheetTypeMatch[1].trim() : 'Unknown'
        
        // Extract summary data using regex patterns
        const summary: Record<string, number> = {}
        const patterns = [
          { key: 'totalAssets', regex: /totalAssets["\s]*:["\s]*([\d,.-]+)/i },
          { key: 'totalLiabilities', regex: /totalLiabilities["\s]*:["\s]*([\d,.-]+)/i },
          { key: 'totalEquity', regex: /totalEquity["\s]*:["\s]*([\d,.-]+)/i },
          { key: 'totalRevenue', regex: /totalRevenue["\s]*:["\s]*([\d,.-]+)/i },
          { key: 'totalExpenses', regex: /totalExpenses["\s]*:["\s]*([\d,.-]+)/i },
          { key: 'netIncome', regex: /netIncome["\s]*:["\s]*([\d,.-]+)/i },
          { key: 'netProfit', regex: /netProfit["\s]*:["\s]*([\d,.-]+)/i }
        ]
        
        patterns.forEach(pattern => {
          const match = aiResponse.match(pattern.regex)
          if (match) {
            // Remove commas from the matched value before parsing
            const cleanValue = match[1].replace(/,/g, '')
            const value = parseFloat(cleanValue)
            if (!isNaN(value)) {
              summary[pattern.key] = value
            }
          }
        })
        
        return {
          sheetType,
          summary,
          accounts: this.generateAccountsList(parsedRecords),
          insights: []
        }
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      console.log('AI Response that failed to parse:', aiResponse)
      // Fallback to basic analysis
      return this.generateFallbackAnalysis(parsedRecords)
    }
  }

  private static generateAccountsList(parsedRecords: ParsedFinancialRecord[]): Array<{
    name: string
    category: string
    debit?: number
    credit?: number
    amount?: number
    balance: number
  }> {
    return parsedRecords.map(record => {
      const amount = Number(record.amount)
      const isDebit = amount > 0
      
      return {
        name: record.accountName,
        category: record.dataType,
        debit: isDebit ? amount : undefined,
        credit: !isDebit ? Math.abs(amount) : undefined,
        amount: Math.abs(amount),
        balance: amount
      }
    })
  }

  private static generateFallbackAnalysis(parsedRecords: ParsedFinancialRecord[]): FinancialAnalysisResult {
    // Calculate basic metrics from parsed records
    const revenue = parsedRecords.filter(r => r.dataType === 'REVENUE').reduce((sum, r) => sum + Number(r.amount), 0)
    const expenses = parsedRecords.filter(r => r.dataType === 'EXPENSE').reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0)
    const assets = parsedRecords.filter(r => r.dataType === 'ASSET').reduce((sum, r) => sum + Number(r.amount), 0)
    const liabilities = parsedRecords.filter(r => r.dataType === 'LIABILITY').reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0)
    const equity = parsedRecords.filter(r => r.dataType === 'EQUITY').reduce((sum, r) => sum + Number(r.amount), 0)

    const netProfit = revenue - expenses
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

    return {
      sheetType: 'Financial Statement',
      summary: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: netProfit,
        netMargin: netMargin,
        totalAssets: assets,
        totalLiabilities: liabilities,
        totalEquity: equity,
        topAccounts: parsedRecords
          .sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))
          .slice(0, 5)
          .map(r => ({
            name: r.accountName,
            amount: Math.abs(Number(r.amount)),
            category: r.dataType
          }))
      },
      accounts: this.generateAccountsList(parsedRecords),
      insights: [
        {
          type: 'summary',
          title: 'Financial Data Processed',
          description: `Successfully analyzed ${parsedRecords.length} financial records`,
          severity: 'low'
        }
      ]
    }
  }
}

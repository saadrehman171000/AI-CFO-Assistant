import { ReportType, DataType } from '@prisma/client'
import * as XLSX from 'xlsx'
import { AIFinancialAnalyzer } from './ai-financial-analyzer'

export interface ParsedFinancialRecord {
  accountName: string
  accountCategory?: string
  amount: number
  dataType: DataType
  period?: string
  notes?: string
}

export interface ParsingResult {
  success: boolean
  data?: ParsedFinancialRecord[] | {
    records: ParsedFinancialRecord[]
    summary: {
      total_revenue: number
      total_expenses: number
      net_profit: number
      net_margin_percent: number
      total_assets: number
      total_liabilities: number
      total_equity: number
      processed_sheet: string
      record_count: number
      // AI analysis fields
      ai_sheet_type?: string
      ai_insights?: Array<{
        type: 'trend' | 'anomaly' | 'recommendation' | 'summary'
        title: string
        description: string
        severity: 'low' | 'medium' | 'high'
      }>
      ai_summary?: Record<string, unknown>
    }
  }
  error?: string
  reportType?: ReportType
}

// Excel Parser for financial reports
export async function parseExcelFinancialReport(fileBuffer: Buffer, reportType: ReportType): Promise<ParsingResult> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    console.log('Parsing Excel file with report type:', reportType)
    console.log('Sheet names:', workbook.SheetNames)
    
    let bestSheet = null
    let bestSheetScore = 0
    let bestSheetData = null
    
    // Step 1: Evaluate all sheets to find the one with financial data
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number | null)[][]
      
      if (!jsonData || jsonData.length < 2) continue
      
      // Calculate sheet score based on financial data indicators
      let score = 0
      let hasNumericData = false
      let hasFinancialHeaders = false
      let accountRowCount = 0
      
      // Check first 10 rows for headers and data patterns
      for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i] as (string | number | null)[]
        if (!row || !Array.isArray(row)) continue
        
        // Check for financial headers
        const rowText = row.map(cell => cell?.toString().toLowerCase().trim() || '').join(' ')
        if (rowText.includes('account') || rowText.includes('debit') || rowText.includes('credit') || 
            rowText.includes('amount') || rowText.includes('balance') || rowText.includes('category')) {
          hasFinancialHeaders = true
          score += 10
        }
        
        // Check for numeric data (potential amounts)
        if (row.some(cell => {
          if (typeof cell === 'number') return true
          if (typeof cell === 'string') {
            const num = parseFloat(cell.replace(/[$,]/g, ''))
            return !isNaN(num) && num !== 0
          }
          return false
        })) {
          hasNumericData = true
          score += 5
        }
        
        // Count potential account rows (rows with text in first column and numbers)
        if (row[0] && typeof row[0] === 'string' && row[0].trim() && 
            row.some((cell, idx) => idx > 0 && typeof cell === 'number' && cell !== 0)) {
          accountRowCount++
        }
      }
      
      // Bonus points for sheets with more account rows
      score += Math.min(accountRowCount * 2, 20)
      
      // Penalize sheets that are likely not financial data
      if (sheetName.toLowerCase().includes('tip') || 
          sheetName.toLowerCase().includes('instruction') ||
          sheetName.toLowerCase().includes('help')) {
        score -= 15
      }
      
      console.log(`Sheet "${sheetName}" score: ${score} (${accountRowCount} account rows, headers: ${hasFinancialHeaders}, numeric: ${hasNumericData})`)
      
      if (score > bestSheetScore) {
        bestSheetScore = score
        bestSheet = sheetName
        bestSheetData = jsonData
      }
    }
    
    if (!bestSheet || bestSheetScore < 5) {
      return { success: false, error: 'No suitable financial data sheet found' }
    }
    
    console.log(`Selected sheet: ${bestSheet} (score: ${bestSheetScore})`)
    
    const jsonData = bestSheetData!
    console.log('Raw JSON data length:', jsonData.length)
    console.log('First few rows:', jsonData.slice(0, 5))
    
    // Step 2: Detect header row and column mapping
    let headerRowIndex = 0
    let isQuickBooksExport = false
    let hasCategoryColumn = false
    
    // Find the header row by looking for financial keywords
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i] as (string | number | null)[]
      if (row && Array.isArray(row)) {
        const rowText = row.map(cell => cell?.toString().toLowerCase().trim() || '').join(' ')
        if (rowText.includes('debit') && rowText.includes('credit')) {
          headerRowIndex = i
          isQuickBooksExport = true
          break
        } else if (rowText.includes('account') && (rowText.includes('amount') || rowText.includes('category'))) {
          headerRowIndex = i
          hasCategoryColumn = true
          break
        }
      }
    }
    
    const headers = (jsonData[headerRowIndex] as string[]).map(h => h?.toString().toLowerCase().trim() || '')
    console.log(`Header row index: ${headerRowIndex}, QuickBooks export: ${isQuickBooksExport}, Has category: ${hasCategoryColumn}`)
    console.log('Headers found:', headers)
    
    // Step 3: Map columns dynamically
    let accountColumnIndex = -1
    let amountColumnIndex = -1
    let categoryColumnIndex = -1
    let debitColumnIndex = -1
    let creditColumnIndex = -1
    
    // Find account column
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      if (header && (header.includes('account') || header.includes('name') || header.includes('description'))) {
        accountColumnIndex = i
        break
      }
    }
    
    // Find amount/category columns
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      if (header && header.includes('amount')) amountColumnIndex = i
      if (header && header.includes('category')) categoryColumnIndex = i
      if (header === 'debit') debitColumnIndex = i
      if (header === 'credit') creditColumnIndex = i
    }
    
    // For QuickBooks, find account column in data if not in headers
    if (isQuickBooksExport && accountColumnIndex === -1) {
      for (let rowIndex = headerRowIndex + 1; rowIndex < Math.min(headerRowIndex + 5, jsonData.length); rowIndex++) {
        const row = jsonData[rowIndex] as (string | number | null)[]
        if (row && Array.isArray(row)) {
          for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const cell = row[colIndex]
            if (cell && typeof cell === 'string' && cell.includes('·') && 
                (cell.includes('RBC') || cell.includes('Account') || cell.includes('Income'))) {
              accountColumnIndex = colIndex
              break
            }
          }
          if (accountColumnIndex !== -1) break
        }
      }
    }
    
    console.log(`Column mapping - Account: ${accountColumnIndex}, Amount: ${amountColumnIndex}, Category: ${categoryColumnIndex}, Debit: ${debitColumnIndex}, Credit: ${creditColumnIndex}`)
    
    // Validate required columns
    if (accountColumnIndex === -1) {
      return { success: false, error: 'Could not identify account column' }
    }
    
    if (isQuickBooksExport && (debitColumnIndex === -1 || creditColumnIndex === -1)) {
      return { success: false, error: 'Could not identify debit/credit columns in QuickBooks export' }
    }
    
    if (!isQuickBooksExport && amountColumnIndex === -1) {
      return { success: false, error: 'Could not identify amount column' }
    }
    
    // Step 4: Parse rows and classify accounts
    const parsedRecords: ParsedFinancialRecord[] = []
    let totalRevenue = 0
    let totalExpenses = 0
    let totalAssets = 0
    let totalLiabilities = 0
    let totalEquity = 0
    
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as (string | number | null)[]
      if (!row || !Array.isArray(row)) continue
      
      let parsedRecord: ParsedFinancialRecord | null = null
      
      if (isQuickBooksExport) {
        // QuickBooks format: Debit/Credit columns
        parsedRecord = parseQuickBooksRowStructured(row, accountColumnIndex, debitColumnIndex, creditColumnIndex, reportType)
      } else {
        // Standard format: Amount + optional Category column
        parsedRecord = parseStandardRow(row, accountColumnIndex, amountColumnIndex, categoryColumnIndex, reportType)
      }
      
      if (parsedRecord) {
        parsedRecords.push(parsedRecord)
        
        // Accumulate totals by category
        switch (parsedRecord.dataType) {
          case DataType.REVENUE:
            totalRevenue += parsedRecord.amount
            break
          case DataType.EXPENSE:
            totalExpenses += Math.abs(parsedRecord.amount) // Store as positive for display
            break
          case DataType.ASSET:
            totalAssets += parsedRecord.amount
            break
          case DataType.LIABILITY:
            totalLiabilities += Math.abs(parsedRecord.amount)
            break
          case DataType.EQUITY:
            totalEquity += parsedRecord.amount
            break
        }
      }
    }
    
    console.log(`Total parsed records: ${parsedRecords.length}`)
    
    // Step 5: Calculate final metrics
    const netProfit = totalRevenue - totalExpenses
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    
    // Step 6: Use AI analyzer for enhanced financial analysis
    try {
      const aiAnalysis = await AIFinancialAnalyzer.analyzeFinancialData(
        jsonData as string[][],
        parsedRecords,
        reportType
      )
      
      console.log('AI Analysis completed:', aiAnalysis.sheetType)
      
      const result = {
        success: true,
        data: {
          records: parsedRecords,
          summary: {
            total_revenue: totalRevenue,
            total_expenses: totalExpenses,
            net_profit: netProfit,
            net_margin_percent: Math.round(netMarginPercent * 100) / 100,
            total_assets: totalAssets,
            total_liabilities: totalLiabilities,
            total_equity: totalEquity,
            processed_sheet: bestSheet,
            record_count: parsedRecords.length,
            // Add AI analysis results
            ai_sheet_type: aiAnalysis.sheetType,
            ai_insights: aiAnalysis.insights,
            ai_summary: aiAnalysis.summary
          }
        }
      }
      
      console.log('Parsing result with AI analysis:', result.data.summary)
      return result
      
    } catch (aiError) {
      console.error('AI analysis failed, using basic parsing:', aiError)
      
      // Fallback to basic result
      const result = {
        success: true,
        data: {
          records: parsedRecords,
          summary: {
            total_revenue: totalRevenue,
            total_expenses: totalExpenses,
            net_profit: netProfit,
            net_margin_percent: Math.round(netMarginPercent * 100) / 100,
            total_assets: totalAssets,
            total_liabilities: totalLiabilities,
            total_equity: totalEquity,
            processed_sheet: bestSheet,
            record_count: parsedRecords.length
          }
        }
      }
      
      console.log('Basic parsing result:', result.data.summary)
      return result
    }
    
  } catch (error) {
    console.error('Error parsing Excel file:', error)
    return { success: false, error: `Failed to parse Excel file: ${error}` }
  }
}

// Special parser for QuickBooks export format
function parseQuickBooksRow(row: (string | number | null)[], reportType: ReportType): ParsedFinancialRecord | null {
  try {
    if (!row || !Array.isArray(row) || row.length < 2) {
      return null
    }

    let accountName = ''
    let amount = 0
    let dataType: DataType = DataType.EXPENSE

    // First column should be account name
    if (row[0] && typeof row[0] === 'string' && row[0].trim()) {
      accountName = row[0].trim()
    } else {
      return null
    }

    // Look for amount in subsequent columns
    for (let i = 1; i < row.length; i++) {
      const cell = row[i]
      if (cell !== undefined && cell !== null && cell !== '') {
        const numValue = parseFloat(cell.toString().replace(/[$,]/g, ''))
        if (!isNaN(numValue) && numValue !== 0) {
          amount = numValue
          break
        }
      }
    }

    // For trial balance, accept zero amounts as they are valid
    if (!accountName || isNaN(amount)) {
      return null
    }

    // Only reject zero amounts for non-trial balance reports
    if (reportType !== ReportType.TRIAL_BALANCE && amount === 0) {
      return null
    }

    // Determine data type based on report type and account name
    switch (reportType) {
      case ReportType.PROFIT_LOSS:
        const accountLower = accountName.toLowerCase()
        if (accountLower.includes('revenue') || 
            accountLower.includes('sales') ||
            accountLower.includes('income') ||
            accountLower.includes('earnings') ||
            accountLower.includes('profit')) {
          dataType = DataType.REVENUE
        } else {
          dataType = DataType.EXPENSE
        }
        break

      case ReportType.BALANCE_SHEET:
        const bsAccountLower = accountName.toLowerCase()
        if (bsAccountLower.includes('asset') || 
            bsAccountLower.includes('cash') || 
            bsAccountLower.includes('inventory') ||
            bsAccountLower.includes('equipment') ||
            bsAccountLower.includes('property') ||
            bsAccountLower.includes('investment')) {
          dataType = DataType.ASSET
        } else if (bsAccountLower.includes('liability') || 
                   bsAccountLower.includes('debt') || 
                   bsAccountLower.includes('payable') ||
                   bsAccountLower.includes('loan') ||
                   bsAccountLower.includes('mortgage')) {
          dataType = DataType.LIABILITY
        } else if (bsAccountLower.includes('equity') || 
                   bsAccountLower.includes('capital') || 
                   bsAccountLower.includes('retained') ||
                   bsAccountLower.includes('stock') ||
                   bsAccountLower.includes('ownership')) {
          dataType = DataType.EQUITY
        }
        break

      case ReportType.CASH_FLOW:
        const cfAccountLower = accountName.toLowerCase()
        if (cfAccountLower.includes('inflow') || 
            cfAccountLower.includes('receipt') || 
            cfAccountLower.includes('income') ||
            cfAccountLower.includes('collection') ||
            cfAccountLower.includes('proceeds')) {
          dataType = DataType.CASH_FLOW_IN
        } else {
          dataType = DataType.CASH_FLOW_OUT
        }
        break

      case ReportType.TRIAL_BALANCE:
        // For trial balance, determine data type based on account name
        const tbAccountLower = accountName.toLowerCase()
        if (tbAccountLower.includes('revenue') || 
            tbAccountLower.includes('sales') ||
            tbAccountLower.includes('income') ||
            tbAccountLower.includes('earnings') ||
            tbAccountLower.includes('profit')) {
          dataType = DataType.REVENUE
        } else if (tbAccountLower.includes('asset') || 
                   tbAccountLower.includes('cash') || 
                   tbAccountLower.includes('inventory') ||
                   tbAccountLower.includes('equipment') ||
                   tbAccountLower.includes('property') ||
                   tbAccountLower.includes('investment')) {
          dataType = DataType.ASSET
        } else if (tbAccountLower.includes('liability') || 
                   tbAccountLower.includes('debt') || 
                   tbAccountLower.includes('payable') ||
                   tbAccountLower.includes('loan') ||
                   tbAccountLower.includes('mortgage')) {
          dataType = DataType.LIABILITY
        } else if (tbAccountLower.includes('equity') || 
                   tbAccountLower.includes('capital') || 
                   tbAccountLower.includes('retained') ||
                   tbAccountLower.includes('stock') ||
                   tbAccountLower.includes('ownership')) {
          dataType = DataType.EQUITY
        } else {
          // Default to expense for trial balance
          dataType = DataType.EXPENSE
        }
        break

      default:
        // Default to expense for unknown report types
        dataType = DataType.EXPENSE
        break
    }

    return {
      accountName,
      amount,
      dataType,
      accountCategory: dataType.toLowerCase()
    }
  } catch (error) {
    console.error('Error parsing QuickBooks row:', error)
    return null
  }
}

// Structured parser for QuickBooks with known column indices
function parseQuickBooksRowStructured(row: (string | number | null)[], accountCol: number, debitCol: number, creditCol: number, reportType: ReportType): ParsedFinancialRecord | null {
  try {
    if (!row || !Array.isArray(row)) return null
    
    // Get account name from the account column
    const accountName = row[accountCol]?.toString().trim()
    if (!accountName || 
        accountName.toLowerCase() === 'total' || 
        accountName.toLowerCase() === 'trial balance' ||
        accountName === '') return null
    
    // Get debit and credit amounts
    const debitAmount = parseFloat(row[debitCol]?.toString().replace(/[$,]/g, '') || '0')
    const creditAmount = parseFloat(row[creditCol]?.toString().replace(/[$,]/g, '') || '0')
    
    // Calculate net amount (debit - credit)
    const amount = debitAmount - creditAmount
    
    // Skip rows with no meaningful amounts
    if (isNaN(amount) || (debitAmount === 0 && creditAmount === 0)) return null
    
    // Determine data type based on account name and amount
    const accountLower = accountName.toLowerCase()
    let dataType: DataType = DataType.EXPENSE
    
    // Enhanced category detection with more comprehensive keyword matching
    if (accountLower.includes('revenue') || 
        accountLower.includes('sales') ||
        accountLower.includes('income') ||
        accountLower.includes('earnings') ||
        accountLower.includes('profit') ||
        accountLower.includes('consulting income') ||
        accountLower.includes('cleaning income') ||
        accountLower.includes('service income') ||
        accountLower.includes('commission') ||
        accountLower.includes('fees earned')) {
      dataType = DataType.REVENUE
    } else if (accountLower.includes('asset') || 
               accountLower.includes('cash') || 
               accountLower.includes('inventory') ||
               accountLower.includes('equipment') ||
               accountLower.includes('property') ||
               accountLower.includes('investment') ||
               accountLower.includes('bank') ||
               accountLower.includes('receivable') ||
               accountLower.includes('rbc') ||
               accountLower.includes('jeep') ||
               accountLower.includes('ford') ||
               accountLower.includes('vehicles') ||
               accountLower.includes('plateless') ||
               accountLower.includes('shares') ||
               accountLower.includes('prepaid') ||
               accountLower.includes('deposit') ||
               accountLower.includes('security') ||
               accountLower.includes('fund') ||
               accountLower.includes('clearing')) {
      dataType = DataType.ASSET
    } else if (accountLower.includes('liability') || 
               accountLower.includes('debt') || 
               accountLower.includes('payable') ||
               accountLower.includes('loan') ||
               accountLower.includes('mortgage') ||
               accountLower.includes('gst') ||
               accountLower.includes('pst') ||
               accountLower.includes('shareholder') ||
               accountLower.includes('tax') ||
               accountLower.includes('withholding') ||
               accountLower.includes('accrued') ||
               accountLower.includes('unearned')) {
      dataType = DataType.LIABILITY
    } else if (accountLower.includes('equity') || 
               accountLower.includes('capital') || 
               accountLower.includes('retained') ||
               accountLower.includes('stock') ||
               accountLower.includes('ownership') ||
               accountLower.includes('shares') ||
               accountLower.includes('partnership') ||
               accountLower.includes('member') ||
               accountLower.includes('draw') ||
               accountLower.includes('distribution')) {
      dataType = DataType.EQUITY
    } else if (accountLower.includes('expense') || 
               accountLower.includes('cost') || 
               accountLower.includes('fee') ||
               accountLower.includes('charge') ||
               accountLower.includes('interest') ||
               accountLower.includes('service charges') ||
               accountLower.includes('professional fees') ||
               accountLower.includes('ask my accountant') ||
               accountLower.includes('salary') ||
               accountLower.includes('wage') ||
               accountLower.includes('rent') ||
               accountLower.includes('utility') ||
               accountLower.includes('marketing') ||
               accountLower.includes('advertising') ||
               accountLower.includes('travel') ||
               accountLower.includes('meals') ||
               accountLower.includes('entertainment') ||
               accountLower.includes('office') ||
               accountLower.includes('supplies') ||
               accountLower.includes('maintenance') ||
               accountLower.includes('repair') ||
               accountLower.includes('insurance') ||
               accountLower.includes('legal') ||
               accountLower.includes('accounting') ||
               accountLower.includes('bookkeeping')) {
      dataType = DataType.EXPENSE
    } else {
      // Default based on amount sign for trial balance
      if (amount > 0) {
        dataType = DataType.ASSET
      } else {
        dataType = DataType.LIABILITY
      }
    }

    console.log(`Parsed: ${accountName} -> ${dataType} (${amount})`)
    
    return {
      accountName,
      amount,
      dataType
    }
  } catch (error) {
    console.error('Error parsing QuickBooks structured row:', error, row)
    return null
  }
}

// Parse standard format rows (with amount column)
function parseStandardRow(row: (string | number | null)[], accountCol: number, amountCol: number, categoryCol: number, reportType: ReportType): ParsedFinancialRecord | null {
  try {
    if (!row || !Array.isArray(row)) return null
    
    const accountName = row[accountCol]?.toString().trim()
    if (!accountName || accountName.toLowerCase() === 'total') return null
    
    const amount = parseFloat(row[amountCol]?.toString().replace(/[$,]/g, '') || '0')
    if (isNaN(amount)) return null
    
    // Use category column if available, otherwise infer from account name
    let dataType: DataType = DataType.EXPENSE
    
    if (categoryCol !== -1 && row[categoryCol]) {
      const category = row[categoryCol].toString().toLowerCase().trim()
      dataType = mapCategoryToDataType(category)
    } else {
      dataType = inferDataTypeFromAccountName(accountName)
    }
    
    console.log(`Parsed: ${accountName} -> ${dataType} (${amount})`)
    
    return {
      accountName,
      amount,
      dataType
    }
  } catch (error) {
    console.error('Error parsing standard row:', error, row)
    return null
  }
}

// Map category strings to DataType enum
function mapCategoryToDataType(category: string): DataType {
  const cat = category.toLowerCase().trim()
  
  if (cat.includes('asset') || cat.includes('cash') || cat.includes('receivable') || cat.includes('inventory')) {
    return DataType.ASSET
  } else if (cat.includes('liability') || cat.includes('payable') || cat.includes('loan') || cat.includes('debt')) {
    return DataType.LIABILITY
  } else if (cat.includes('revenue') || cat.includes('sales') || cat.includes('income')) {
    return DataType.REVENUE
  } else if (cat.includes('expense') || cat.includes('cost')) {
    return DataType.EXPENSE
  } else if (cat.includes('equity') || cat.includes('capital') || cat.includes('retained')) {
    return DataType.EQUITY
  }
  
  return DataType.EXPENSE // Default fallback
}

// Infer data type from account name using keyword matching
function inferDataTypeFromAccountName(accountName: string): DataType {
  const account = accountName.toLowerCase()
  
  // Assets
  if (account.includes('cash') || account.includes('bank') || account.includes('receivable') || 
      account.includes('inventory') || account.includes('equipment') || account.includes('property') ||
      account.includes('investment') || account.includes('prepaid') || account.includes('deposit')) {
    return DataType.ASSET
  }
  
  // Liabilities
  if (account.includes('payable') || account.includes('loan') || account.includes('debt') ||
      account.includes('credit card') || account.includes('mortgage') || account.includes('tax')) {
    return DataType.LIABILITY
  }
  
  // Revenue
  if (account.includes('revenue') || account.includes('sales') || account.includes('income') ||
      account.includes('service') || account.includes('commission') || account.includes('fees')) {
    return DataType.REVENUE
  }
  
  // Equity
  if (account.includes('equity') || account.includes('capital') || account.includes('retained') ||
      account.includes('stock') || account.includes('ownership') || account.includes('shares')) {
    return DataType.EQUITY
  }
  
  // Default to expense
  return DataType.EXPENSE
}

// CSV Parser for financial reports
export function parseCSVFinancialReport(csvContent: string, reportType: ReportType): ParsingResult {
  try {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
      return { success: false, error: 'CSV file must have at least a header and one data row' }
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const data: ParsedFinancialRecord[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim())
      if (values.length !== headers.length) continue

      const row: Record<string, string | number | null> = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      const parsedRecord = parseCSVRow(row, reportType)
      if (parsedRecord) {
        data.push(parsedRecord)
      }
    }

    return {
      success: true,
      data,
      reportType
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

function parseCSVRow(row: Record<string, string | number | null>, reportType: ReportType): ParsedFinancialRecord | null {
  try {
    let accountName = ''
    let amount = 0
    let dataType: DataType = DataType.EXPENSE

    // Handle different possible column names
    const possibleAccountNames = ['account_name', 'account', 'description', 'item', 'category', 'name']
    const possibleAmountNames = ['amount', 'value', 'balance', 'total', 'sum']

    // Find account name
    for (const name of possibleAccountNames) {
      if (row[name] && row[name]?.toString().trim()) {
        accountName = row[name]?.toString().trim() || ''
        break
      }
    }

    // Find amount
    for (const name of possibleAmountNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        const numValue = parseFloat(row[name]?.toString().replace(/[$,]/g, '') || '0')
        if (!isNaN(numValue)) {
          amount = numValue
          break
        }
      }
    }

    if (!accountName || isNaN(amount) || amount === 0) {
      return null
    }

    // Determine data type based on report type and account name
    switch (reportType) {
      case ReportType.PROFIT_LOSS:
        const accountLower = accountName.toLowerCase()
        if (accountLower.includes('revenue') || 
            accountLower.includes('sales') ||
            accountLower.includes('income') ||
            accountLower.includes('earnings') ||
            accountLower.includes('profit')) {
          dataType = DataType.REVENUE
        } else {
          dataType = DataType.EXPENSE
        }
        break

      case ReportType.BALANCE_SHEET:
        const bsAccountLower = accountName.toLowerCase()
        if (bsAccountLower.includes('asset') || 
            bsAccountLower.includes('cash') || 
            bsAccountLower.includes('inventory') ||
            bsAccountLower.includes('equipment') ||
            bsAccountLower.includes('property') ||
            bsAccountLower.includes('investment')) {
          dataType = DataType.ASSET
        } else if (bsAccountLower.includes('liability') || 
                   bsAccountLower.includes('debt') || 
                   bsAccountLower.includes('payable') ||
                   bsAccountLower.includes('loan') ||
                   bsAccountLower.includes('mortgage')) {
          dataType = DataType.LIABILITY
        } else if (bsAccountLower.includes('equity') || 
                   bsAccountLower.includes('capital') || 
                   bsAccountLower.includes('retained') ||
                   bsAccountLower.includes('stock') ||
                   bsAccountLower.includes('ownership')) {
          dataType = DataType.EQUITY
        }
        break

      case ReportType.CASH_FLOW:
        const cfAccountLower = accountName.toLowerCase()
        if (cfAccountLower.includes('inflow') || 
            cfAccountLower.includes('receipt') || 
            cfAccountLower.includes('income') ||
            cfAccountLower.includes('collection') ||
            cfAccountLower.includes('proceeds')) {
          dataType = DataType.CASH_FLOW_IN
        } else {
          dataType = DataType.CASH_FLOW_OUT
        }
        break

      case ReportType.TRIAL_BALANCE:
        // For trial balance, determine data type based on account name
        const tbAccountLower = accountName.toLowerCase()
        if (tbAccountLower.includes('revenue') || 
            tbAccountLower.includes('sales') ||
            tbAccountLower.includes('income') ||
            tbAccountLower.includes('earnings') ||
            tbAccountLower.includes('profit')) {
          dataType = DataType.REVENUE
        } else if (tbAccountLower.includes('asset') || 
                   tbAccountLower.includes('cash') || 
                   tbAccountLower.includes('inventory') ||
                   tbAccountLower.includes('equipment') ||
                   tbAccountLower.includes('property') ||
                   tbAccountLower.includes('investment')) {
          dataType = DataType.ASSET
        } else if (tbAccountLower.includes('liability') || 
                   tbAccountLower.includes('debt') || 
                   tbAccountLower.includes('payable') ||
                   tbAccountLower.includes('loan') ||
                   tbAccountLower.includes('mortgage')) {
          dataType = DataType.LIABILITY
        } else if (tbAccountLower.includes('equity') || 
                   tbAccountLower.includes('capital') || 
                   tbAccountLower.includes('retained') ||
                   tbAccountLower.includes('stock') ||
                   tbAccountLower.includes('ownership')) {
          dataType = DataType.EQUITY
        } else {
          dataType = DataType.EXPENSE
        }
        break

      default:
        dataType = DataType.EXPENSE
    }

    return {
      accountName,
      accountCategory: (row.category || row.account_category)?.toString() || undefined,
      amount,
      dataType,
      period: (row.period || row.date)?.toString() || undefined,
      notes: (row.notes || row.comments)?.toString() || undefined
    }
  } catch (error) {
    console.error('Error parsing CSV row:', error)
    return null
  }
}

// PDF Parser using pdf-parse library
export async function parsePDFFinancialReport(pdfBuffer: Buffer, reportType: ReportType): Promise<ParsingResult> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfParse = (await import('pdf-parse')).default
    const pdfData = await pdfParse(pdfBuffer)
    const pdfText = pdfData.text
    
    const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    const data: ParsedFinancialRecord[] = []
    
    // Enhanced pattern matching for financial terms
    const patterns = {
      [ReportType.PROFIT_LOSS]: [
        { regex: /(revenue|sales|income|earnings)/i, dataType: DataType.REVENUE },
        { regex: /(expense|cost|expenditure|outlay)/i, dataType: DataType.EXPENSE }
      ],
      [ReportType.BALANCE_SHEET]: [
        { regex: /(asset|cash|inventory|equipment|property|investment)/i, dataType: DataType.ASSET },
        { regex: /(liability|debt|payable|loan|mortgage)/i, dataType: DataType.LIABILITY },
        { regex: /(equity|capital|retained|stock|ownership)/i, dataType: DataType.EQUITY }
      ],
      [ReportType.CASH_FLOW]: [
        { regex: /(inflow|receipt|income|collection|proceeds)/i, dataType: DataType.CASH_FLOW_IN },
        { regex: /(outflow|payment|expense|disbursement|outlay)/i, dataType: DataType.CASH_FLOW_OUT }
      ],
      [ReportType.TRIAL_BALANCE]: [
        { regex: /(revenue|sales|income|earnings|profit)/i, dataType: DataType.REVENUE },
        { regex: /(asset|cash|inventory|equipment|property|investment)/i, dataType: DataType.ASSET },
        { regex: /(liability|debt|payable|loan|mortgage)/i, dataType: DataType.LIABILITY },
        { regex: /(equity|capital|retained|stock|ownership)/i, dataType: DataType.EQUITY },
        { regex: /(expense|cost|expenditure|outlay)/i, dataType: DataType.EXPENSE }
      ],
      [ReportType.AR_AGING]: [
        { regex: /(receivable|ar|debtor)/i, dataType: DataType.ASSET }
      ],
      [ReportType.AP_AGING]: [
        { regex: /(payable|ap|creditor)/i, dataType: DataType.LIABILITY }
      ]
    }

    const reportPatterns = patterns[reportType] || patterns[ReportType.PROFIT_LOSS]

    for (const line of lines as string[]) {
      for (const pattern of reportPatterns) {
        if (pattern.regex.test(line)) {
          // Extract amount if present (enhanced number extraction)
          const amountMatch = line.match(/\$?([\d,]+\.?\d*)/)
          if (amountMatch) {
            const amount = parseFloat(amountMatch[1].replace(/,/g, ''))
            if (!isNaN(amount)) {
              data.push({
                accountName: line.substring(0, 50).trim(), // First 50 chars as account name
                amount,
                dataType: pattern.dataType
              })
            }
          }
        }
      }
    }

    return {
      success: true,
      data,
      reportType
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Main parsing function
export async function parseFinancialReport(
  fileContent: string | Buffer, 
  fileType: string, 
  reportType: ReportType
): Promise<ParsingResult> {
  try {
    const fileTypeLower = fileType.toLowerCase()
    
    if (fileTypeLower === 'csv') {
      return parseCSVFinancialReport(fileContent as string, reportType)
    } else if (fileTypeLower === 'pdf') {
      return parsePDFFinancialReport(fileContent as Buffer, reportType)
    } else if (fileTypeLower === 'xlsx' || fileTypeLower === 'xls') {
      return parseExcelFinancialReport(fileContent as Buffer, reportType)
    } else {
      return {
        success: false,
        error: `Unsupported file type: ${fileType}. Only CSV, PDF, and Excel files are supported.`
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

import { ReportType, DataType } from '@prisma/client'

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
  data?: ParsedFinancialRecord[]
  error?: string
  reportType?: ReportType
}

// Excel Parser for financial reports
export async function parseExcelFinancialReport(excelBuffer: Buffer, reportType: ReportType): Promise<ParsingResult> {
  try {
    // Dynamic import to avoid SSR issues
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length < 2) {
      return { success: false, error: 'Excel file must have at least a header and one data row' }
    }

    const headers = (jsonData[0] as string[]).map(h => h?.toString().toLowerCase().trim() || '')
    const data: ParsedFinancialRecord[] = []

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      if (!row || row.length === 0) continue

      const rowData: any = {}
      headers.forEach((header, index) => {
        if (header && index < row.length) {
          rowData[header] = row[index]
        }
      })

      const parsedRecord = parseExcelRow(rowData, reportType)
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
      error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

function parseExcelRow(row: any, reportType: ReportType): ParsedFinancialRecord | null {
  try {
    let accountName = ''
    let amount = 0
    let dataType: DataType = DataType.EXPENSE

    // Handle different possible column names
    const possibleAccountNames = ['account_name', 'account', 'description', 'item', 'category', 'name']
    const possibleAmountNames = ['amount', 'value', 'balance', 'total', 'sum']

    // Find account name
    for (const name of possibleAccountNames) {
      if (row[name] && row[name].toString().trim()) {
        accountName = row[name].toString().trim()
        break
      }
    }

    // Find amount
    for (const name of possibleAmountNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        const numValue = parseFloat(row[name].toString().replace(/[$,]/g, ''))
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
      accountCategory: row.category || row.account_category || undefined,
      amount,
      dataType,
      period: row.period || row.date || undefined,
      notes: row.notes || row.comments || undefined
    }
  } catch (error) {
    console.error('Error parsing Excel row:', error)
    return null
  }
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

      const row: any = {}
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

function parseCSVRow(row: any, reportType: ReportType): ParsedFinancialRecord | null {
  try {
    let accountName = ''
    let amount = 0
    let dataType: DataType = DataType.EXPENSE

    // Handle different possible column names
    const possibleAccountNames = ['account_name', 'account', 'description', 'item', 'category', 'name']
    const possibleAmountNames = ['amount', 'value', 'balance', 'total', 'sum']

    // Find account name
    for (const name of possibleAccountNames) {
      if (row[name] && row[name].toString().trim()) {
        accountName = row[name].toString().trim()
        break
      }
    }

    // Find amount
    for (const name of possibleAmountNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        const numValue = parseFloat(row[name].toString().replace(/[$,]/g, ''))
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
      accountCategory: row.category || row.account_category || undefined,
      amount,
      dataType,
      period: row.period || row.date || undefined,
      notes: row.notes || row.comments || undefined
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
      ]
    }

    const reportPatterns = patterns[reportType] || patterns[ReportType.PROFIT_LOSS]

    for (const line of lines) {
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

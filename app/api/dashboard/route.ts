import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { AIFinancialAnalyzer } from '@/lib/ai-financial-analyzer'
import { getOrCreateUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getOrCreateUser(clerkUser)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all financial reports for the user
    const reports = await prisma.financialReport.findMany({
      where: { userId: dbUser.id },
      include: { parsedData: true },
      orderBy: { uploadDate: 'desc' }
    })

    if (reports.length === 0) {
      return NextResponse.json({
        message: 'No financial data available',
        data: {
          metrics: {},
          insights: [],
          trends: { revenue: [], expenses: [], profit: [], months: [] },
          topAccounts: { revenue: [], expenses: [], assets: [], liabilities: [] }
        }
      })
    }

    // Get the most recent report for analysis
    const latestReport = reports[0]
    const previousReport = reports.length > 1 ? reports[1] : null

    // Analyze the financial data using AI
    const dashboardData = await AIFinancialAnalyzer.analyzeFinancialData(
      [], // rawData - we don't have this in the database, so pass empty array
      latestReport.parsedData.map(d => ({
        accountName: d.accountName,
        accountCategory: d.accountCategory || undefined,
        amount: Number(d.amount),
        dataType: d.dataType,
        period: d.period || undefined,
        notes: d.notes || undefined
      })),
      latestReport.reportType
    )

    // Enhance trends data with historical context if available
    let enhancedTrends: {
      revenue: number[]
      expenses: number[]
      profit: number[]
      months: string[]
    } = {
      revenue: [],
      expenses: [],
      profit: [],
      months: []
    }
    
    if (reports.length > 1) {
      // Create a simple trend line with available data
      const trendData = reports.slice(0, Math.min(6, reports.length)).reverse()
      enhancedTrends = {
        revenue: trendData.map(report => {
          const revenue = report.parsedData
            .filter(d => d.dataType === 'REVENUE')
            .reduce((sum, d) => sum + Number(d.amount), 0)
          return revenue
        }),
        expenses: trendData.map(report => {
          const expenses = report.parsedData
            .filter(d => d.dataType === 'EXPENSE')
            .reduce((sum, d) => sum + Number(d.amount), 0)
          return expenses
        }),
        profit: trendData.map(report => {
          const revenue = report.parsedData
            .filter(d => d.dataType === 'REVENUE')
            .reduce((sum, d) => sum + Number(d.amount), 0)
          const expenses = report.parsedData
            .filter(d => d.dataType === 'EXPENSE')
            .reduce((sum, d) => sum + Number(d.amount), 0)
          return revenue - expenses
        }),
        months: trendData.map(report => {
          const date = new Date(report.uploadDate)
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        })
      }
    }

    // Add report metadata and enhanced data
    const enhancedData = {
      sheetType: dashboardData.sheetType,
      summary: dashboardData.summary,
      accounts: dashboardData.accounts,
      insights: dashboardData.insights,
      trends: enhancedTrends,
      topAccounts: {
        revenue: latestReport.parsedData
          .filter(d => d.dataType === 'REVENUE')
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .slice(0, 5)
          .map(d => ({
            accountName: d.accountName,
            amount: d.amount,
            dataType: d.dataType
          })),
        expenses: latestReport.parsedData
          .filter(d => d.dataType === 'EXPENSE')
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .slice(0, 5)
          .map(d => ({
            accountName: d.accountName,
            amount: d.amount,
            dataType: d.dataType
          })),
        assets: latestReport.parsedData
          .filter(d => d.dataType === 'ASSET')
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .slice(0, 5)
          .map(d => ({
            accountName: d.accountName,
            amount: d.amount,
            dataType: d.dataType
          })),
        liabilities: latestReport.parsedData
          .filter(d => d.dataType === 'LIABILITY')
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .slice(0, 5)
          .map(d => ({
            accountName: d.accountName,
            amount: d.amount,
            dataType: d.dataType
          }))
      },
      reportInfo: {
        latestReport: {
          id: latestReport.id,
          fileName: latestReport.fileName,
          reportType: latestReport.reportType,
          year: latestReport.year,
          month: latestReport.month,
          uploadDate: latestReport.uploadDate,
          totalRecords: latestReport.parsedData.length
        },
        totalReports: reports.length,
        totalRecords: reports.reduce((sum, report) => sum + report.parsedData.length, 0),
        analysisDate: new Date().toISOString(),
        dataFreshness: 'real-time'
      }
    }

    return NextResponse.json({
      success: true,
      data: enhancedData
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({
      error: 'Failed to generate dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getOrCreateUser(clerkUser)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Get the specific report for analysis
    const report = await prisma.financialReport.findUnique({
      where: { id: reportId, userId: dbUser.id },
      include: { parsedData: true }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Get previous report for comparison if available
    const previousReport = await prisma.financialReport.findFirst({
      where: { 
        userId: dbUser.id,
        uploadDate: { lt: report.uploadDate }
      },
      include: { parsedData: true },
      orderBy: { uploadDate: 'desc' }
    })

    // Analyze the specific report
    const dashboardData = await AIFinancialAnalyzer.analyzeFinancialData(
      [], // rawData - we don't have this in the database
      report.parsedData,
      report.reportType
    )

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard analysis error:', error)
    return NextResponse.json({
      error: 'Failed to analyze report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchIds = searchParams.get('branchIds')?.split(',') || []
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Build where clause for financial analyses
    const whereClause: any = {
      companyId: user.companyId,
    }

    if (branchIds.length > 0) {
      whereClause.branchId = { in: branchIds }
    }

    // Get financial analyses for the specified period
    const analyses = await prisma.financialAnalysis.findMany({
      where: whereClause,
      include: {
        branch: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    
    // Process the data to create comparison metrics
    const branchMetrics = new Map()
    
    for (const analysis of analyses) {
      const branchId = analysis.branchId || 'unassigned'
      const branchName = analysis.branch?.name || 'Unassigned'
      
      if (!branchMetrics.has(branchId)) {
        branchMetrics.set(branchId, {
          branchId,
          branchName,
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          analysisCount: 0,
          ebitda: 0,
          grossMargin: 0,
          businessHealthScore: 0,
          cashFlow: 0,
          currentRatio: 0,
          debtToEquity: 0,
          workingCapital: 0,
          criticalAlerts: []
        })
      }
      
      const metrics = branchMetrics.get(branchId)
      
      try {
        // Fetch the actual analysis data from your backend
        const backendResponse = await fetch(
          `${BACKEND_URL}/get-analysis?analysis_id=${analysis.id}`,
          { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )
        
        if (backendResponse.ok) {
          const analysisData = await backendResponse.json()
          
          if (analysisData?.analysis) {
            const data = analysisData.analysis
            
            // Extract financial metrics from your new data structure
            const revenue = data.profit_and_loss?.revenue_analysis?.total_revenue || 0
            const expenses = data.profit_and_loss?.cost_structure?.total_expenses || 0
            const netProfit = data.profit_and_loss?.profitability_metrics?.net_income || 0
            const ebitda = data.profit_and_loss?.profitability_metrics?.ebitda || 0
            const grossMargin = data.profit_and_loss?.profitability_metrics?.margins?.gross_margin || 0
            const businessHealthScore = data.executive_summary?.business_health_score || 0
            const cashFlow = data.cash_flow_analysis?.cash_position?.free_cash_flow || 0
            const currentRatio = data.financial_ratios?.liquidity_ratios?.current_ratio || 0
            const debtToEquity = data.financial_ratios?.leverage_ratios?.debt_to_equity || 0
            const workingCapital = data.key_kpis?.working_capital || 0
            const criticalAlerts = data.executive_summary?.critical_alerts || []
            
            // Aggregate metrics (for multiple analyses per branch)
            metrics.totalRevenue += revenue
            metrics.totalExpenses += expenses
            metrics.netProfit += netProfit
            metrics.ebitda += ebitda
            metrics.grossMargin = grossMargin // Use latest value
            metrics.businessHealthScore = businessHealthScore // Use latest value
            metrics.cashFlow += cashFlow
            metrics.currentRatio = currentRatio // Use latest value
            metrics.debtToEquity = debtToEquity // Use latest value
            metrics.workingCapital += workingCapital
            metrics.criticalAlerts = criticalAlerts // Use latest alerts
          }
        } else {
          console.warn(`Failed to fetch analysis data for ${analysis.id}`)
        }
      } catch (fetchError) {
        console.error(`Error fetching analysis for ${analysis.id}:`, fetchError)
      }
      
      metrics.analysisCount++
    }

    const comparisonData = Array.from(branchMetrics.values()).map(metrics => ({
      ...metrics,
      profitMargin: metrics.totalRevenue > 0 ? (metrics.netProfit / metrics.totalRevenue) * 100 : 0,
      // Calculate averages for ratio-based metrics
      ebitda: metrics.analysisCount > 0 ? metrics.ebitda / metrics.analysisCount : 0,
      cashFlow: metrics.analysisCount > 0 ? metrics.cashFlow / metrics.analysisCount : 0,
      workingCapital: metrics.analysisCount > 0 ? metrics.workingCapital / metrics.analysisCount : 0,
    }))

    // Calculate consolidated metrics
    const consolidated = {
      totalRevenue: comparisonData.reduce((sum, branch) => sum + branch.totalRevenue, 0),
      totalExpenses: comparisonData.reduce((sum, branch) => sum + branch.totalExpenses, 0),
      netProfit: comparisonData.reduce((sum, branch) => sum + branch.netProfit, 0),
      totalBranches: comparisonData.length,
      totalAnalyses: analyses.length,
      averageEbitda: comparisonData.length > 0 ? comparisonData.reduce((sum, branch) => sum + branch.ebitda, 0) / comparisonData.length : 0,
      averageGrossMargin: comparisonData.length > 0 ? comparisonData.reduce((sum, branch) => sum + branch.grossMargin, 0) / comparisonData.length : 0,
      averageHealthScore: comparisonData.length > 0 ? comparisonData.reduce((sum, branch) => sum + branch.businessHealthScore, 0) / comparisonData.length : 0,
      totalCashFlow: comparisonData.reduce((sum, branch) => sum + branch.cashFlow, 0),
      averageCurrentRatio: comparisonData.length > 0 ? comparisonData.reduce((sum, branch) => sum + branch.currentRatio, 0) / comparisonData.length : 0,
      totalWorkingCapital: comparisonData.reduce((sum, branch) => sum + branch.workingCapital, 0),
      averageProfitMargin: 0
    }

    consolidated.averageProfitMargin = consolidated.totalRevenue > 0 
      ? (consolidated.netProfit / consolidated.totalRevenue) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        branches: comparisonData,
        consolidated,
        period: { year, month },
      }
    })

  } catch (error) {
    console.error('Error fetching company analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
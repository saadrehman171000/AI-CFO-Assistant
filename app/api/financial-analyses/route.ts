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
    const branchId = searchParams.get('branchId')
    const latest = searchParams.get('latest') === 'true'
    const analysisId = searchParams.get('analysisId')

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // If specific analysis is requested
    if (analysisId) {
      const analysis = await prisma.financialAnalysis.findFirst({
        where: { 
          id: analysisId,
          companyId: user.companyId
        },
        include: {
          branch: true,
        }
      })

      if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        analysis: {
          id: analysis.id,
          fileName: analysis.fileName,
          reportType: analysis.reportType,
          createdAt: analysis.createdAt.toISOString(),
          year: analysis.year,
          month: analysis.month,
          branchId: analysis.branchId,
          branchName: analysis.branch?.name
        }
      })
    }

    // Build where clause
    const whereClause: any = {
      companyId: user.companyId,
    }

    if (branchId && branchId !== 'all') {
      whereClause.branchId = branchId
    }

    // Fetch analyses
    const analyses = await prisma.financialAnalysis.findMany({
      where: whereClause,
      include: {
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
      ...(latest ? { take: 1 } : {})
    })

    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      fileName: analysis.fileName,
      reportType: analysis.reportType,
      createdAt: analysis.createdAt.toISOString(),
      year: analysis.year,
      month: analysis.month,
      branchId: analysis.branchId,
      branchName: analysis.branch?.name || 'Unassigned'
    }))

    if (latest && formattedAnalyses.length > 0) {
      return NextResponse.json({
        success: true,
        analysis: formattedAnalyses[0]
      })
    }

    return NextResponse.json({
      success: true,
      analyses: formattedAnalyses
    })

  } catch (error) {
    console.error('Error fetching financial analyses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const branchId = formData.get('branchId') as string || null
    const companyId = formData.get('companyId') as string || null

    if (!file) {
      return NextResponse.json({
        error: 'File is required'
      }, { status: 400 })
    }

    // Get user and validate company
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'xlsx', 'xls', 'csv'].includes(fileType || '')) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload PDF, Excel, or CSV files.'
      }, { status: 400 })
    }

    // Create financial analysis record
    const financialAnalysis = await prisma.financialAnalysis.create({
      data: {
        userId: userId,
        fileName: file.name,
        fileType: fileType.toUpperCase(),
        reportType: 'PROFIT_LOSS', // Default, could be determined from file
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        fileSize: file.size,
        status: 'PROCESSING',
        companyId: user.companyId,
        branchId: branchId
      }
    })

    // Here you would typically send the file to your backend for processing
    // For now, we'll just return the created record
    
    return NextResponse.json({
      success: true,
      analysis: {
        id: financialAnalysis.id,
        fileName: financialAnalysis.fileName,
        status: financialAnalysis.status
      }
    })

  } catch (error) {
    console.error('Error creating financial analysis:', error)
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma, getOrCreateUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // const { userId } = await auth()
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await getOrCreateUser(clerkUser)
    const userId = user.id
    console.log('userId', userId)   
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Fetch the analysis data directly from PostgreSQL database
    const financialAnalysis = await prisma.financialAnalysis.findFirst({
      where: {
        id: analysisId,
        userId: userId, // Ensure user can only access their own data
      },
      include: {
        company: true,
        branch: true,
      }
    })

    if (!financialAnalysis) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      )
    }

    // The analysisData is stored as JSON in the analysisData column
    const analysisData = financialAnalysis.analysisData as any

    if (!analysisData) {
      return NextResponse.json(
        { error: 'No analysis data found in database' },
        { status: 404 }
      )
    }

    // Return the analysis data in the expected format
    return NextResponse.json({
      success: true,
      analysisData: {
        file_info: {
          filename: financialAnalysis.fileName,
          file_type: financialAnalysis.fileType,
          file_size_mb: financialAnalysis.fileSizeMb
        },
        analysis: analysisData
      },
      metadata: {
        id: financialAnalysis.id,
        fileName: financialAnalysis.fileName,
        fileType: financialAnalysis.fileType,
        createdAt: financialAnalysis.createdAt.toISOString(),
        uploadDate: financialAnalysis.uploadDate.toISOString(),
        fileSizeMb: financialAnalysis.fileSizeMb,
        branchId: financialAnalysis.branchId,
        branchName: financialAnalysis.branch?.name || 'Unassigned',
        companyId: financialAnalysis.companyId,
        companyName: financialAnalysis.company?.name || 'Unknown'
      }
    })

  } catch (error) {
    console.error('Error fetching analysis data from PostgreSQL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
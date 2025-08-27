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

          createdAt: analysis.createdAt.toISOString(),

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

      createdAt: analysis.createdAt.toISOString(),

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

    // Get user's internal DB ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Forward the file to the backend for analysis
    const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!BACKEND_URL) {
      return NextResponse.json({
        error: 'Backend URL not configured. Please set NEXT_PUBLIC_BASE_URL in your environment variables.'
      }, { status: 500 });
    }

    // Prepare the form data to send to the backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Build the backend URL with query parameters
    const backendUrl = `${BACKEND_URL}/upload-financial-document?user_id=${encodeURIComponent(userId)}&store_in_vector_db=true`;

    try {
      console.log("Sending file to backend for analysis:", backendUrl);
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        body: backendFormData,
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend error:', errorText);
        return NextResponse.json({
          error: 'Failed to process file with AI backend',
          details: errorText
        }, { status: backendResponse.status });
      }

      // Get the analysis result from the backend
      const result = await backendResponse.json();

      // Create financial analysis record with the data from the backend
      const financialAnalysis = await prisma.financialAnalysis.create({
        data: {
          userId: dbUser.id, // Use the database internal ID
          fileName: file.name,
          fileType: fileType?.toUpperCase() || 'UNKNOWN',
          fileSizeMb: Number((file.size / (1024 * 1024)).toFixed(2)), // Convert bytes to MB
          analysisData: result, // Use the analysis data from the backend
          companyId: user.companyId,
          branchId: branchId
        }
      });

      // Return the success response with the analysis record
      return NextResponse.json({
        success: true,
        analysis: {
          id: financialAnalysis.id,
          fileName: financialAnalysis.fileName,
          createdAt: financialAnalysis.createdAt
        }
      });
    } catch (error) {
      console.error("Backend processing error:", error);
      return NextResponse.json({
        error: 'Failed to process file with backend service',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating financial analysis:', error)
    return NextResponse.json(
      { error: `Failed to create analysis: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
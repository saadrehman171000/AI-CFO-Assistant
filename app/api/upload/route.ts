import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma, getOrCreateUser } from '@/lib/db'
import { parseFinancialReport } from '@/lib/parsers'
import { AIFinancialAnalyzer } from '@/lib/ai-financial-analyzer'
import { ReportType, ParsedFinancialData } from '@prisma/client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL

export async function DELETE(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getOrCreateUser(clerkUser)

    const { reportId } = await request.json()
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Delete the report and all associated parsed data
    await prisma.financialReport.delete({
      where: {
        id: reportId,
        userId: user.id // Ensure user can only delete their own reports
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ 
      error: 'Failed to delete report',
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const reportType = formData.get('reportType') as string
    const year = parseInt(formData.get('year') as string)
    const month = parseInt(formData.get('month') as string)

    if (!file || !reportType || !year || !month) {
      return NextResponse.json({
        error: 'Missing required fields: file, reportType, year, month'
      }, { status: 400 })
    }

    // Validate file type - now supporting Excel files
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !['csv', 'pdf', 'xlsx', 'xls'].includes(fileType)) {
      return NextResponse.json({
        error: 'Only CSV, PDF, and Excel files (.xlsx, .xls) are supported'
      }, { status: 400 })
    }

    // Validate report type
    if (!Object.values(ReportType).includes(reportType as ReportType)) {
      return NextResponse.json({
        error: 'Invalid report type'
      }, { status: 400 })
    }

    // Get or create user in our database
    const user = await getOrCreateUser(clerkUser)

    // Read file content based on file type
    let fileContent: string | Buffer
    if (fileType === 'csv') {
      fileContent = await file.text()
    } else {
      // For PDF and Excel, get the buffer
      const arrayBuffer = await file.arrayBuffer()
      fileContent = Buffer.from(arrayBuffer)
    }

    // Parse the financial report
    const parsingResult = await parseFinancialReport(
      fileContent,
      fileType,
      reportType as ReportType
    )

    if (!parsingResult.success) {
      return NextResponse.json({
        error: parsingResult.error || 'Failed to parse file'
      }, { status: 400 })
    }

    // Create financial report record
    const financialReport = await prisma.financialReport.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileType: fileType.toUpperCase(),
        reportType: reportType as ReportType,
        year,
        month,
        fileSize: file.size,
        status: 'COMPLETED'
      }
    })

    // Store parsed data
    let recordsToStore: ParsedFinancialData[] = []
    
    if (parsingResult.data) {
      // Handle new structured format
      if ('records' in parsingResult.data && Array.isArray(parsingResult.data.records)) {
        recordsToStore = parsingResult.data.records
      }
      // Handle old array format
      else if (Array.isArray(parsingResult.data)) {
        recordsToStore = parsingResult.data
      }
    }
    
    if (recordsToStore.length > 0) {
      const parsedDataRecords = recordsToStore.map(record => ({
        reportId: financialReport.id,
        userId: user.id,
        accountName: record.accountName,
        accountCategory: record.accountCategory,
        amount: record.amount,
        dataType: record.dataType,
        period: record.period,
        notes: record.notes
      }))

      await prisma.parsedFinancialData.createMany({
        data: parsedDataRecords
      })
    }

    // Also send to Python backend for vector storage and AI analysis
    let vectorStorageResult = null;
    try {
      // Create FormData for the backend request
      const backendFormData = new FormData();

      // We need to recreate the file since it may have been consumed
      let backendFile: File;
      if (typeof fileContent === 'string') {
        // CSV file
        backendFile = new File([fileContent], file.name, { type: 'text/csv' });
      } else {
        // PDF or Excel file
        backendFile = new File([fileContent], file.name, { type: file.type });
      }

      backendFormData.append('file', backendFile);

      const backendResponse = await fetch(
        `${BACKEND_URL}/upload-financial-document?user_id=${encodeURIComponent(clerkUser.id)}&store_in_vector_db=true`,
        {
          method: 'POST',
          body: backendFormData,
        }
      );

      if (backendResponse.ok) {
        vectorStorageResult = await backendResponse.json();
        console.log('Successfully stored in vector database:', vectorStorageResult.vector_storage);
      } else {
        console.error('Failed to store in vector database:', await backendResponse.text());
      }
    } catch (vectorError) {
      console.error('Vector storage error:', vectorError);
      // Don't fail the entire request if vector storage fails
    }

    // Return the created report with parsed data
    const createdReport = await prisma.financialReport.findUnique({
      where: { id: financialReport.id },
      include: {
        parsedData: true
      }
    })

    return NextResponse.json({ 
      success: true,
      report: createdReport,
      vectorStorage: vectorStorageResult?.vector_storage || { stored: false, document_id: null },
      message: `Successfully processed ${file.name}. Found ${recordsToStore.length} financial records.${vectorStorageResult?.vector_storage?.stored ? ' Data also stored for AI chatbot.' : ''}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Failed to process financial report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')

    if (reportId) {
      // Get specific report
      const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
      
      const report = await prisma.financialReport.findFirst({
        where: { 
          id: reportId,
          userId: user?.id
        },
        include: {
          parsedData: true
        }
      })

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      return NextResponse.json({ report })
    } else {
      // Get all reports for user
      let user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
      
      if (!user) {
        try {
          user = await getOrCreateUser(clerkUser)
        } catch (createError) {
          console.error('Failed to create user:', createError)
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }
      }

      const reports = await prisma.financialReport.findMany({
        where: { userId: user.id },
        include: {
          parsedData: true
        },
        orderBy: { uploadDate: 'desc' }
      })

      return NextResponse.json({ reports })
    }

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

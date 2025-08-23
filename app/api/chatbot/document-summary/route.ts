import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId || !clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    // Get or create user in database
    const user = await getOrCreateUser(clerkUser);

    // Get financial analyses for the user
    const whereClause: any = { userId: user.id };
    if (filename) {
      whereClause.fileName = { contains: filename, mode: 'insensitive' };
    }

    const financialAnalyses = await prisma.financialAnalysis.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSizeMb: true,
        uploadDate: true,
        isMultiFileAnalysis: true,
        analysisData: true
      }
    });

    // Also get financial reports for backward compatibility
    const financialReports = await prisma.financialReport.findMany({
      where: { userId: user.id },
      orderBy: { uploadDate: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        uploadDate: true,
        reportType: true,
        status: true
      }
    });

    // Transform data to match expected format
    const documents = [
      ...financialAnalyses.map(analysis => ({
        filename: analysis.fileName,
        chunk_types: analysis.analysisData ? [
          'profit_and_loss',
          'balance_sheet', 
          'financial_ratios',
          'ai_insights'
        ] : ['financial_data'],
        timestamp: analysis.uploadDate.toISOString(),
        file_type: analysis.fileType,
        id: analysis.id,
        source: 'analysis'
      })),
      ...financialReports.map(report => ({
        filename: report.fileName,
        chunk_types: [report.reportType.toLowerCase().replace('_', '-')],
        timestamp: report.uploadDate.toISOString(),
        file_type: report.fileType,
        id: report.id,
        source: 'report'
      }))
    ];

    // Remove duplicates based on filename
    const uniqueDocuments = documents.filter((doc, index, self) =>
      index === self.findIndex(d => d.filename === doc.filename)
    );

    const totalDocuments = uniqueDocuments.length;
    const totalChunks = uniqueDocuments.reduce((sum, doc) => sum + doc.chunk_types.length, 0);

    let summary = "";
    if (totalDocuments === 0) {
      summary = "No financial documents uploaded yet. Upload documents to start chatting with AI about your financial data.";
    } else if (filename) {
      const filteredDocs = uniqueDocuments.filter(doc => 
        doc.filename.toLowerCase().includes(filename.toLowerCase())
      );
      summary = `Found ${filteredDocs.length} document(s) matching "${filename}" with ${filteredDocs.reduce((sum, doc) => sum + doc.chunk_types.length, 0)} data sections.`;
    } else {
      summary = `Found ${totalDocuments} financial document(s) with ${totalChunks} data sections available for AI analysis.`;
    }

    return NextResponse.json({
      summary,
      documents: uniqueDocuments,
      total_chunks: totalChunks
    });

  } catch (error) {
    console.error("Document summary API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

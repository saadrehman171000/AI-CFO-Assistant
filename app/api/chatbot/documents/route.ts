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

    // Get or create user in database
    const user = await getOrCreateUser(clerkUser);

    // Get financial analyses
    const financialAnalyses = await prisma.financialAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSizeMb: true,
        uploadDate: true,
        isMultiFileAnalysis: true,
        multiFileAnalysisGroupId: true
      }
    });

    // Get financial reports for backward compatibility
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

    // Transform to expected format
    const documents = [
      ...financialAnalyses.map(analysis => ({
        document_id: analysis.id,
        filename: analysis.fileName,
        file_type: analysis.fileType,
        timestamp: analysis.uploadDate.toISOString(),
        chunks: 4, // Estimate based on typical analysis sections
        source: 'analysis'
      })),
      ...financialReports.map(report => ({
        document_id: report.id,
        filename: report.fileName,
        file_type: report.fileType,
        timestamp: report.uploadDate.toISOString(),
        chunks: 1, // Single report type
        source: 'report'
      }))
    ];

    // Remove duplicates based on filename
    const uniqueDocuments = documents.filter((doc, index, self) =>
      index === self.findIndex(d => d.filename === doc.filename)
    );

    return NextResponse.json({
      user_id: userId,
      documents: uniqueDocuments,
      total_documents: uniqueDocuments.length
    });

  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("document_id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkUser);

    // Try to delete from financial analyses first
    let deleted = false;
    try {
      const deletedAnalysis = await prisma.financialAnalysis.deleteMany({
        where: {
          id: documentId,
          userId: user.id
        }
      });
      deleted = deletedAnalysis.count > 0;
    } catch (error) {
      console.log("Document not found in financial analyses, trying financial reports...");
    }

    // If not found in analyses, try financial reports
    if (!deleted) {
      try {
        const deletedReport = await prisma.financialReport.deleteMany({
          where: {
            id: documentId,
            userId: user.id
          }
        });
        deleted = deletedReport.count > 0;
      } catch (error) {
        console.log("Document not found in financial reports either");
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: `Document ${documentId} not found for user ${userId}` },
        { status: 404 }
      );
    }

    // Also try to delete from vector database if backend is available
    try {
      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/document/${encodeURIComponent(documentId)}?user_id=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!backendResponse.ok) {
        console.log("Failed to delete from vector database, but PostgreSQL deletion succeeded");
      }
    } catch (error) {
      console.log("Backend not available for vector deletion, but PostgreSQL deletion succeeded");
    }

    return NextResponse.json({
      message: `Document ${documentId} deleted successfully`,
      document_id: documentId
    });

  } catch (error) {
    console.error("Delete document API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// Backend API URL - you can configure this via environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { message, conversation_history } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getOrCreateUser(clerkUser);

    // Get user's financial data from PostgreSQL to provide context
    const [financialAnalyses, financialReports] = await Promise.all([
      prisma.financialAnalysis.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5, // Latest 5 analyses
        select: {
          fileName: true,
          fileType: true,
          analysisData: true,
          uploadDate: true
        }
      }),
      prisma.financialReport.findMany({
        where: { userId: user.id },
        orderBy: { uploadDate: 'desc' },
        take: 5, // Latest 5 reports
        include: {
          parsedData: {
            take: 20 // Latest 20 parsed data entries per report
          }
        }
      })
    ]);

    // If user has no data in vector database but has PostgreSQL data, provide a fallback response
    let fallbackData = null;
    if (financialAnalyses.length > 0 || financialReports.length > 0) {
      // Prepare summary of available data
      const documentSummary = {
        total_documents: financialAnalyses.length + financialReports.length,
        latest_analyses: financialAnalyses.map(a => ({
          filename: a.fileName,
          upload_date: a.uploadDate,
          has_analysis: !!a.analysisData
        })),
        latest_reports: financialReports.map(r => ({
          filename: r.fileName,
          type: r.reportType,
          data_points: r.parsedData.length
        }))
      };

      fallbackData = documentSummary;
    }

    // Try to forward request to Python backend for vector search
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          user_id: userId,
          conversation_history: conversation_history || [],
        }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data);
      } else {
        // Backend failed, but we have PostgreSQL data
        throw new Error("Backend not available, using fallback");
      }

    } catch (backendError) {
      console.warn("Backend not available, providing fallback response based on PostgreSQL data");
      
      // Provide a helpful fallback response based on PostgreSQL data
      if (!fallbackData || (financialAnalyses.length === 0 && financialReports.length === 0)) {
        return NextResponse.json({
          response: "I'd love to help you with your financial questions! However, I notice that either you haven't uploaded any financial documents yet, or the AI backend service is currently unavailable. Please upload some financial documents first, and make sure the Python backend service is running for full AI analysis capabilities.",
          sources_used: 0,
          relevant_documents: [],
          context_chunks: []
        });
      }

      // Generate a basic response based on available data
      const totalDocs = fallbackData.total_documents;
      const hasAnalyses = financialAnalyses.some(a => a.analysisData);
      
      let fallbackResponse = `I can see you have ${totalDocs} financial document(s) uploaded. `;
      
      if (hasAnalyses) {
        fallbackResponse += "Your documents include comprehensive AI analysis with profit & loss statements, balance sheets, and financial insights. ";
      }
      
      if (financialReports.length > 0) {
        const reportTypes = [...new Set(financialReports.map(r => r.reportType))];
        fallbackResponse += `You have ${reportTypes.join(', ').toLowerCase()} reports available. `;
      }

      fallbackResponse += "\n\nFor more detailed AI-powered analysis and conversation about your financial data, please ensure the Python backend service is running. In the meantime, you can view your detailed financial analysis on the Dashboard, Reports, and Analytics pages.";

      return NextResponse.json({
        response: fallbackResponse,
        sources_used: totalDocs,
        relevant_documents: [
          ...financialAnalyses.map(a => a.fileName),
          ...financialReports.map(r => r.fileName)
        ].slice(0, 5),
        context_chunks: [{
          filename: "Database Summary",
          chunk_type: "metadata",
          relevance_score: 1.0
        }],
        fallback_mode: true
      });
    }

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

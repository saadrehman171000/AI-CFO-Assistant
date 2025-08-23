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

    // Get user's financial data to generate relevant questions
    const financialAnalyses = await prisma.financialAnalysis.findMany({
      where: { userId: user.id },
      select: {
        fileName: true,
        fileType: true,
        analysisData: true,
        isMultiFileAnalysis: true
      }
    });

    const financialReports = await prisma.financialReport.findMany({
      where: { userId: user.id },
      select: {
        fileName: true,
        reportType: true,
        status: true
      }
    });

    // Generate suggested questions based on available data
    const suggestedQuestions: string[] = [];

    if (financialAnalyses.length === 0 && financialReports.length === 0) {
      // No documents uploaded yet
      suggestedQuestions.push(
        "How do I upload my financial documents?",
        "What file formats are supported?",
        "What can I ask about my financial data?",
        "How does the AI analysis work?"
      );
    } else {
      // User has uploaded documents
      suggestedQuestions.push(
        "What is my total revenue for this period?",
        "How is my cash flow looking?",
        "What are my biggest expenses?",
        "Show me my profit margins"
      );

      // Add questions based on specific document types
      const hasBalanceSheet = financialReports.some(r => r.reportType === 'BALANCE_SHEET') ||
                             financialAnalyses.some(a => a.analysisData && 
                               JSON.stringify(a.analysisData).includes('balance_sheet'));
      
      const hasProfitLoss = financialReports.some(r => r.reportType === 'PROFIT_LOSS') ||
                           financialAnalyses.some(a => a.analysisData && 
                             JSON.stringify(a.analysisData).includes('profit_and_loss'));

      const hasCashFlow = financialReports.some(r => r.reportType === 'CASH_FLOW') ||
                         financialAnalyses.some(a => a.analysisData && 
                           JSON.stringify(a.analysisData).includes('cash_flow'));

      if (hasBalanceSheet) {
        suggestedQuestions.push(
          "What is my current asset position?",
          "How much debt do I have?",
          "What is my equity ratio?"
        );
      }

      if (hasProfitLoss) {
        suggestedQuestions.push(
          "What is my gross profit margin?",
          "Which revenue streams are performing best?",
          "How can I reduce my operating expenses?"
        );
      }

      if (hasCashFlow) {
        suggestedQuestions.push(
          "What is my operating cash flow?",
          "How many months of cash runway do I have?",
          "What are my cash flow trends?"
        );
      }

      // Add questions for multiple documents
      if (financialAnalyses.length > 1 || financialReports.length > 1) {
        suggestedQuestions.push(
          "Compare my financial performance across periods",
          "What trends do you see in my financial data?",
          "Which document shows the best performance?"
        );
      }

      // Add AI-specific questions if analysis data is available
      const hasAIAnalysis = financialAnalyses.some(a => a.analysisData);
      if (hasAIAnalysis) {
        suggestedQuestions.push(
          "What financial risks should I be aware of?",
          "What are your key recommendations for my business?",
          "What growth opportunities do you see?",
          "How does my business compare to industry standards?"
        );
      }
    }

    // Limit to 8 suggestions and ensure uniqueness
    const uniqueQuestions = [...new Set(suggestedQuestions)].slice(0, 8);

    return NextResponse.json({
      user_id: userId,
      suggested_questions: uniqueQuestions
    });

  } catch (error) {
    console.error("Suggested questions API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

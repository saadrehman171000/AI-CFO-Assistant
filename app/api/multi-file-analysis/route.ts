import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);
    const data = await request.json();

    if (
      !data ||
      !data.files ||
      !Array.isArray(data.files) ||
      data.files.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required files data" },
        { status: 400 }
      );
    }

    // Store each financial analysis in the database
    const savedAnalyses = [];
    for (const fileAnalysis of data.files) {
      if (
        !fileAnalysis.fileName ||
        !fileAnalysis.fileType ||
        !fileAnalysis.fileSizeMb ||
        !fileAnalysis.analysisData
      ) {
        continue; // Skip invalid entries
      }

      const financialAnalysis = await prisma.financialAnalysis.create({
        data: {
          userId: user.id,
          fileName: fileAnalysis.fileName,
          fileType: fileAnalysis.fileType,
          fileSizeMb: fileAnalysis.fileSizeMb,
          analysisData: fileAnalysis.analysisData,
          isMultiFileAnalysis: true,
          multiFileAnalysisGroupId: data.groupId || new Date().toISOString(),
        },
      });

      savedAnalyses.push({
        id: financialAnalysis.id,
        fileName: fileAnalysis.fileName,
      });
    }

    return NextResponse.json({
      success: true,
      savedFiles: savedAnalyses,
      totalSaved: savedAnalyses.length,
    });
  } catch (error) {
    console.error("Error storing multi-file financial analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to store multi-file financial analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

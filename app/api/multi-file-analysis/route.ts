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

    // Validate the new combined analysis data format
    if (
      !data ||
      !data.fileName ||
      !data.fileNames ||
      !Array.isArray(data.fileNames) ||
      data.fileNames.length === 0 ||
      !data.analysisData
    ) {
      return NextResponse.json(
        { error: "Missing required combined analysis data" },
        { status: 400 }
      );
    }

    // Extract file info from the backend response
    const backendAnalysis = data.analysisData;
    const fileInfo = backendAnalysis.file_info || {};

    // Add metadata to the analysis data
    const analysisDataWithMetadata = {
      ...backendAnalysis,
      multiFileMetadata: {
        originalFiles: data.fileNames,
        analysisType: "combined_multi_file",
        filesCount: data.fileNames.length
      }
    };

    // Create a single combined analysis entry
    const financialAnalysis = await prisma.financialAnalysis.create({
      data: {
        userId: user.id,
        fileName: data.fileName, // Combined filename (e.g., "file1_file2_combined")
        fileType: fileInfo.file_type || "combined",
        fileSizeMb: fileInfo.file_size_mb || 0,
        analysisData: analysisDataWithMetadata,
        isMultiFileAnalysis: true,
        multiFileAnalysisGroupId: new Date().toISOString(),
        companyId: data.companyId || null,
        branchId: data.branchId || null,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: financialAnalysis.id,
        fileName: financialAnalysis.fileName,
        fileType: financialAnalysis.fileType,
        fileSizeMb: financialAnalysis.fileSizeMb,
        uploadDate: financialAnalysis.createdAt,
        isMultiFileAnalysis: true,
        originalFiles: data.fileNames,
        branchId: financialAnalysis.branchId,
        companyId: financialAnalysis.companyId,
      },
      message: "Combined analysis stored successfully"
    });
  } catch (error) {
    console.error("Error storing combined multi-file analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to store combined multi-file analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

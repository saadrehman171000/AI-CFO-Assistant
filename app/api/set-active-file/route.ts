import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";

// Set the active file for analysis across the app
export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Verify the file belongs to the user
    const analysis = await prisma.financialAnalysis.findUnique({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "File not found or unauthorized" },
        { status: 404 }
      );
    }

    // Return the analysis data
    return NextResponse.json({
      success: true,
      data: analysis.analysisData,
      fileInfo: {
        id: analysis.id,
        fileName: analysis.fileName,
        fileType: analysis.fileType,
        uploadDate: analysis.uploadDate,
      },
    });
  } catch (error) {
    console.error("Error setting active file:", error);
    return NextResponse.json(
      {
        error: "Failed to set active file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

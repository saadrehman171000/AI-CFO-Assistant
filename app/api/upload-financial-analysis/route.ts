import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";

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
      !data.fileName ||
      !data.fileType ||
      !data.fileSizeMb ||
      !data.analysisData
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store the financial analysis in the database
    const financialAnalysis = await prisma.financialAnalysis.create({
      data: {
        userId: user.id,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSizeMb: data.fileSizeMb,
        analysisData: data.analysisData, // Store the complete analysis JSON
      },
    });

    return NextResponse.json({
      success: true,
      id: financialAnalysis.id,
    });
  } catch (error) {
    console.error("Error storing financial analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to store financial analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

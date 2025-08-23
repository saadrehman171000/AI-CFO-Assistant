import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";

// Get all user files
export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);

    // Get all financial analyses for the user
    const analyses = await prisma.financialAnalysis.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        uploadDate: "desc",
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSizeMb: true,
        uploadDate: true,
        isMultiFileAnalysis: true,
        multiFileAnalysisGroupId: true,
      },
    });

    return NextResponse.json({ success: true, data: analyses });
  } catch (error) {
    console.error("Error fetching user files:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

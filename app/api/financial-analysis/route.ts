import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma, getOrCreateUser } from "@/lib/db";

// A single API endpoint to retrieve financial analysis data for the user
export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);

    // Get query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const latest = url.searchParams.get("latest") === "true";
    const all = url.searchParams.get("all") === "true";

    // Query the database based on parameters
    if (id) {
      // Get a specific financial analysis by ID
      const analysis = await prisma.financialAnalysis.findUnique({
        where: {
          id: id,
          userId: user.id,
        },
      });

      if (!analysis) {
        return NextResponse.json(
          { error: "Financial analysis not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(analysis);
    } else if (latest) {
      // Get the latest financial analysis
      const analysis = await prisma.financialAnalysis.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          uploadDate: "desc",
        },
      });

      if (!analysis) {
        return NextResponse.json(
          {
            success: true,
            data: null,
          },
          { status: 200 }
        );
      }

      // Return the analysis data directly - it's already parsed by Prisma
      return NextResponse.json(analysis.analysisData);
    } else if (all) {
      // Get all financial analyses
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
          // Don't include the full analysisData to keep response size manageable
        },
      });

      return NextResponse.json(analyses);
    } else {
      // Default: get all financial analyses with pagination
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      const analyses = await prisma.financialAnalysis.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          uploadDate: "desc",
        },
        take: limit,
        skip: skip,
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSizeMb: true,
          uploadDate: true,
        },
      });

      const total = await prisma.financialAnalysis.count({
        where: {
          userId: user.id,
        },
      });

      return NextResponse.json({
        data: analyses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching financial analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch financial analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

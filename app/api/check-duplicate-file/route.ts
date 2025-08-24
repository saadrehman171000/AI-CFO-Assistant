import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileSize, files } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let duplicates: string[] = [];

    if (files && Array.isArray(files)) {
      // Multi-file check
      for (const file of files) {
        const fileSizeMb = file.size / 1024 / 1024;
        
        // First check by name only (primary duplicate detection)
        const existingFileByName = await prisma.financialAnalysis.findFirst({
          where: {
            userId: user.id,
            fileName: file.name,
          },
          select: {
            id: true,
            fileName: true,
            uploadDate: true,
            fileSizeMb: true,
          },
        });

        // If we find a file with the same name, check if size is similar
        let existingFile = null;
        if (existingFileByName) {
          const sizeDiff = Math.abs(existingFileByName.fileSizeMb - fileSizeMb);
          // Allow up to 10% size difference or 0.01MB, whichever is larger
          const tolerance = Math.max(0.01, fileSizeMb * 0.1);
          
          if (sizeDiff <= tolerance) {
            existingFile = existingFileByName;
          }
        }

        if (existingFile) {
          duplicates.push(file.name);
        }
      }
    } else {
      // Single file check
      const fileSizeMb = fileSize / 1024 / 1024;
      
      // First check by name only (primary duplicate detection)
      const existingFileByName = await prisma.financialAnalysis.findFirst({
        where: {
          userId: user.id,
          fileName: fileName,
        },
        select: {
          id: true,
          fileName: true,
          uploadDate: true,
          fileSizeMb: true,
        },
      });

      // If we find a file with the same name, check if size is similar
      let existingFile = null;
      if (existingFileByName) {
        const sizeDiff = Math.abs(existingFileByName.fileSizeMb - fileSizeMb);
        // Allow up to 10% size difference or 0.01MB, whichever is larger
        const tolerance = Math.max(0.01, fileSizeMb * 0.1);
        
        if (sizeDiff <= tolerance) {
          existingFile = existingFileByName;
        }
      }

      if (existingFile) {
        duplicates.push(fileName);
      }
    }

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
      message: duplicates.length > 0 
        ? `${duplicates.length === 1 ? 'File' : 'Files'} already uploaded: ${duplicates.join(', ')}`
        : "No duplicates found"
    });

  } catch (error) {
    console.error("Duplicate check error:", error);
    return NextResponse.json(
      { error: "Failed to check for duplicates" },
      { status: 500 }
    );
  }
}

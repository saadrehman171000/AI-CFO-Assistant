import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user setup status
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        hasCompletedSetup: true, 
        companyId: true,
        isCompanyAdmin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      hasCompletedSetup: user.hasCompletedSetup || false,
      companyId: user.companyId,
      isCompanyAdmin: user.isCompanyAdmin || false,
    })

  } catch (error) {
    console.error('Error checking setup status:', error)
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    )
  }
}

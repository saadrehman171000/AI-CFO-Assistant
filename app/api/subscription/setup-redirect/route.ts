import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Check if user has completed setup
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { hasCompletedSetup: true, companyId: true }
    })

    if (user?.hasCompletedSetup && user?.companyId) {
      // User has completed setup, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      // User needs to complete setup
      return NextResponse.redirect(new URL('/company-setup', request.url))
    }

  } catch (error) {
    console.error('Setup redirect error:', error)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}


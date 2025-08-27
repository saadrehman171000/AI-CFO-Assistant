
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, industry, website, phone, address } = body

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        description,
        industry,
        website,
        phone,
        address,
      }
    })

    // Update user to be company admin and link to company
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        companyId: company.id,
        isCompanyAdmin: true,
        hasCompletedSetup: true,
      }
    })

    return NextResponse.json({
      success: true,
      company,
    })

  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with company data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        company: {
          include: {
            branches: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })

    if (!user?.company) {
      return NextResponse.json({ company: null })
    }

    return NextResponse.json({
      company: user.company,
      isCompanyAdmin: user.isCompanyAdmin,
    })

  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, industry, website, phone, address } = body

    // Get user to verify company ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true, isCompanyAdmin: true }
    })

    if (!user?.companyId || !user.isCompanyAdmin) {
      return NextResponse.json({ error: 'Not authorized to update company' }, { status: 403 })
    }

    const company = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name,
        description,
        industry,
        website,
        phone,
        address,
      },
      include: {
        branches: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      company,
    })

  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}
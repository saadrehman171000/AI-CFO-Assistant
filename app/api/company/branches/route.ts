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
    const { name, location, address, phone, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 })
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true, isCompanyAdmin: true }
    })

    if (!user?.companyId || !user.isCompanyAdmin) {
      return NextResponse.json({ error: 'Not authorized to create branches' }, { status: 403 })
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        location,
        address,
        phone,
        description,
        companyId: user.companyId,
      }
    })

    return NextResponse.json({
      success: true,
      branch,
    })

  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Failed to create branch' },
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

    // Get user's company branches
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json({ branches: [] })
    }

    const branches = await prisma.branch.findMany({
      where: { 
        companyId: user.companyId,
        isActive: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ branches })

  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, address, phone, description, isActive } = body

    // Verify user has access to this branch
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true, isCompanyAdmin: true }
    })

    if (!user?.companyId || !user.isCompanyAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const branch = await prisma.branch.update({
      where: { 
        id: params.branchId,
        companyId: user.companyId
      },
      data: {
        name,
        location,
        address,
        phone,
        description,
        isActive,
      }
    })

    return NextResponse.json({
      success: true,
      branch,
    })

  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json(
      { error: 'Failed to update branch' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this branch
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true, isCompanyAdmin: true }
    })

    if (!user?.companyId || !user.isCompanyAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Soft delete by setting isActive to false
    const branch = await prisma.branch.update({
      where: { 
        id: params.branchId,
        companyId: user.companyId
      },
      data: {
        isActive: false,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json(
      { error: 'Failed to delete branch' },
      { status: 500 }
    )
  }
}


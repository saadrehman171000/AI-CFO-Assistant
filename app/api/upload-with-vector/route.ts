import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const storeInVectorDb = formData.get('store_in_vector_db') === 'true'

    if (!file) {
      return NextResponse.json({
        error: 'No file provided'
      }, { status: 400 })
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !['csv', 'pdf', 'xlsx', 'xls'].includes(fileType)) {
      return NextResponse.json({
        error: 'Only CSV, PDF, and Excel files (.xlsx, .xls) are supported'
      }, { status: 400 })
    }

    // Forward to Python backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const backendUrl = `${BACKEND_URL}/upload-financial-document?user_id=${encodeURIComponent(clerkUser.id)}&store_in_vector_db=${storeInVectorDb}`
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error:', errorText)
      
      return NextResponse.json({
        error: 'Failed to process file with AI backend',
        details: errorText
      }, { status: backendResponse.status })
    }

    const result = await backendResponse.json()

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Upload with vector error:', error)
    return NextResponse.json({
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

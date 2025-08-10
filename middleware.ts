import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/forgot-password', '/sign-in/sso-callback']
  
  // Define API routes that should be accessible
  const apiRoutes = ['/api/webhook/clerk']

  // Allow public routes and API routes
  if (publicRoutes.includes(path) || path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // For all other routes, let them pass through
  // Authentication will be handled client-side by the ProtectedRoute component
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

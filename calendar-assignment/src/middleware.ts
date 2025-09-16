import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect unauthenticated users trying to access /user/* routes
    if (pathname.startsWith('/user') && !token) {
      return NextResponse.redirect(new URL('/unauthenticated', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to these public routes
        const publicPaths = [
          '/',
          '/signin', 
          '/unauthenticated',
          '/api/auth'
        ]
        
        // Allow access to public pages and API auth routes
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }
        
        // Check if the current path is a protected user route
        if (pathname.startsWith('/user')) {
          return !!token
        }
        
        // Allow access to any other pages by default
        return true
      },
    },
  }
)

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

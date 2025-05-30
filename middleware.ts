import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const POSSIBLE_SESSION_COOKIES = [
    'better-auth.session-token',
    'better-auth.session',
    'session-token',
    'auth-token',
    'next-auth.session-token',
    'ba-st'
]

const protectedRoutes = ['/section']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isProtectedRoute = protectedRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    )

    if ( !isProtectedRoute ) return NextResponse.next()

    let isAuthenticated = false

    const allCookies = request.cookies.getAll()
    const authCookieExists = allCookies.some( cookie => {
        const name = cookie.name.toLowerCase()
        return name.includes('auth') || name.includes('session') || name.includes('token')
    })

    const specificCookieExists = POSSIBLE_SESSION_COOKIES.some( cookieName => {
        return request.cookies.has( cookieName );
    })

    isAuthenticated = authCookieExists || specificCookieExists

    if ( !isAuthenticated ) {
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('requireAuth', 'true')
        return NextResponse.redirect(redirectUrl)
    }
}

export const config = {
    matcher: [
        '/section',
        '/section/:path*',
    ],
}

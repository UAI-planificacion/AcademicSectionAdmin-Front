import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BETTER_AUTH_SESSION_COOKIE_NAME = 'better-auth.session_token';

const protectedRoutes = [
    '/sections',
    '/modules',
    '/days',
    '/periods',
    '/spaces',
    '/sizes',
    '/subjects',
    '/professors',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    )

    if ( !isProtectedRoute ) return NextResponse.next();

    let isAuthenticated = request.cookies.has(BETTER_AUTH_SESSION_COOKIE_NAME);

    if (!isAuthenticated) {
        try {
            const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
                headers: {
                    'Cookie': request.headers.get('cookie') || ''
                }
            });
            
            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                isAuthenticated = !!(sessionData?.user);
            }
        } catch (error) {
            isAuthenticated = false;
        }
    }

    if ( !isAuthenticated ) {
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('requireAuth', 'true')
        return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next();
}

export const config = {
    matcher: protectedRoutes
}
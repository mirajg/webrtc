
import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token')?.value;

    const pathname = request.nextUrl.pathname;

    // If user is logged in and tries to access login or signup, redirect to homepage
    if (token && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/signup'], // Only apply to these routes
};


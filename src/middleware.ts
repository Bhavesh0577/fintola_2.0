import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/finance',
    '/api/ai-prediction'
]);

export default clerkMiddleware(async (auth, req) => {
    // If it's a public route, allow access
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // For protected routes, auth.protect() will handle redirecting to sign-in if needed
    await auth.protect();
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.[\\w]+$).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}; 
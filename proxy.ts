import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define protected routes that require authentication
const PROTECTED_ROUTES = ["/profile", "/settings", "/dashboard"];

// Define auth routes (should redirect to home if already authenticated)
const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Create a response object that we can modify
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create Supabase client for Server Components
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Get the current session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route),
    );

    // Check if route is an auth route
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect to home if accessing auth routes with active session
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (handled separately)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

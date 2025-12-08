import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Fetch user role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        // 1. Admin Route Protection
        if (request.nextUrl.pathname.startsWith('/admin')) {
            // Allow access to login page
            if (request.nextUrl.pathname === '/admin/login') {
                // If already logged in as admin, redirect to dashboard
                if (role === 'admin') {
                    return NextResponse.redirect(new URL('/admin', request.url))
                }
                // If logged in as other role, let them see login page (or maybe redirect to their dashboard? 
                // Plan says: "Strictly reject". So if they are on login page, they can try to login. 
                // But if they are already logged in as USER, they should probably be signed out or redirected.
                // Let's just allow them to see the login page so they can switch accounts if needed, 
                // OR we can force them to logout first.
                // For now, let's just let them stay on login page.
                return response
            }

            // For other admin routes, must be admin
            if (role !== 'admin') {
                return NextResponse.redirect(new URL('/admin/login', request.url))
            }
        }

        // 3. Auth Route Protection (User Portal)
        if (request.nextUrl.pathname.startsWith('/auth')) {
            if (role === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            if (role === 'organizer') {
                return NextResponse.redirect(new URL('/organizer/dashboard', request.url))
            }
            // Regular users stay here or go to home? 
            // Usually /auth/login redirects to home if logged in.
            return NextResponse.redirect(new URL('/', request.url))
        }
    } else {
        // Not logged in
        if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        if (request.nextUrl.pathname.startsWith('/organizer') && request.nextUrl.pathname !== '/organizer/login' && request.nextUrl.pathname !== '/organizer/register') {
            return NextResponse.redirect(new URL('/organizer/login', request.url))
        }
        // Protected user routes? Maybe profile?
        if (request.nextUrl.pathname.startsWith('/profile')) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return response
}

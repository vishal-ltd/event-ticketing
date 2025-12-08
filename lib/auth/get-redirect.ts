'use client'

import { SupabaseClient } from '@supabase/supabase-js'

export type UserRole = 'user' | 'admin' | 'organizer' | 'staff'

export interface UserRoleInfo {
    role: UserRole
    isOrganizer: boolean
    redirectPath: string
}

/**
 * Gets the user's role and determines the appropriate redirect path.
 * Checks both user_profiles.role and organizers table for organizer status.
 */
export async function getUserRoleAndRedirect(
    supabase: SupabaseClient,
    userId: string
): Promise<UserRoleInfo> {
    // Get user profile role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single()

    const role = (profile?.role as UserRole) || 'user'

    // Check if user is an approved organizer
    const { data: organizer } = await supabase
        .from('organizers')
        .select('approved')
        .eq('user_id', userId)
        .single()

    const isOrganizer = !!(organizer?.approved)

    // Determine redirect path based on role
    let redirectPath = '/'

    if (role === 'admin') {
        redirectPath = '/admin'
    } else if (role === 'staff') {
        redirectPath = '/staff'
    } else if (isOrganizer || role === 'organizer') {
        redirectPath = '/organizer/dashboard'
    } else {
        redirectPath = '/' // Regular users go to homepage
    }

    return { role, isOrganizer, redirectPath }
}

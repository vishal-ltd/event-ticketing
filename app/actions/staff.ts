'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserToStaff(userId: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Check if current user is admin or organizer
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'organizer'].includes(profile.role)) {
            throw new Error('Unauthorized: Only admins and organizers can create staff')
        }

        // Check target user exists and is currently a regular user
        const { data: targetUser } = await adminSupabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .single()

        if (!targetUser) {
            throw new Error('User not found')
        }

        if (targetUser.role !== 'user') {
            throw new Error('Can only promote regular users to staff')
        }

        // Update role to staff
        const { error } = await adminSupabase
            .from('user_profiles')
            .update({ role: 'staff' })
            .eq('id', userId)

        if (error) throw error

        revalidatePath('/admin/staff')
        revalidatePath('/admin/users')
        revalidatePath('/organizer/staff')
        return { success: true }

    } catch (error: unknown) {
        console.error('Error updating to staff:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

export async function removeStaffRole(userId: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Check if current user is admin or organizer
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'organizer'].includes(profile.role)) {
            throw new Error('Unauthorized: Only admins and organizers can manage staff')
        }

        // Update role back to user
        const { error } = await adminSupabase
            .from('user_profiles')
            .update({ role: 'user' })
            .eq('id', userId)

        if (error) throw error

        revalidatePath('/admin/staff')
        revalidatePath('/admin/users')
        revalidatePath('/organizer/staff')
        return { success: true }

    } catch (error: unknown) {
        console.error('Error removing staff role:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

export async function getAvailableUsers() {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Check if current user is admin or organizer
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'organizer'].includes(profile.role)) {
            throw new Error('Unauthorized')
        }

        // Get all regular users who can be promoted to staff
        const { data: users, error } = await adminSupabase
            .from('user_profiles')
            .select('id, name, created_at')
            .eq('role', 'user')
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, users: users || [] }

    } catch (error: unknown) {
        console.error('Error fetching users:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage, users: [] }
    }
}

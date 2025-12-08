'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: 'user' | 'organizer' | 'admin' | 'staff') {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Check if current user is admin
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            throw new Error('Unauthorized: Only admins can change roles')
        }

        // Update role
        const { error } = await adminSupabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) throw error

        revalidatePath('/admin/users')
        return { success: true }

    } catch (error: unknown) {
        console.error('Error updating role:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

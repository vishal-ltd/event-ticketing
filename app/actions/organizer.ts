'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createOrganizerAction(formData: FormData) {
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        return { error: 'Unauthorized' }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const orgName = formData.get('orgName') as string
    const description = formData.get('description') as string

    if (!email || !password || !name || !orgName) {
        return { error: 'Missing required fields' }
    }

    const adminClient = createAdminClient()

    try {
        // 2. Create user
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
            }
        })

        if (createError) throw createError
        if (!newUser.user) throw new Error('Failed to create user')

        // 3. Update profile role
        // Note: user_profiles should be created by trigger usually, but we might need to update it.
        // If trigger exists, we wait or update. If no trigger, we insert.
        // Assuming trigger exists (based on previous context), we update.
        // But to be safe with admin client, we can upsert.

        const { error: profileError } = await adminClient
            .from('user_profiles')
            .upsert({
                id: newUser.user.id,
                role: 'organizer',
                name: name // Ensure name is set
            })

        if (profileError) throw profileError

        // 4. Create organizer entry
        const { error: orgError } = await adminClient
            .from('organizers')
            .insert({
                user_id: newUser.user.id,
                org_name: orgName,
                description,
                approved: true
            })

        if (orgError) throw orgError

        revalidatePath('/admin/organizers')
        return { success: true }
    } catch (error: unknown) {
        console.error('Create organizer error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { error: errorMessage }
    }
}

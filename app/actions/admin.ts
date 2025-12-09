'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateSystemQrCode(formData: FormData) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    try {
        // 1. Verify Admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Unauthorized: Admin access required')
        }

        // 2. Handle File Upload
        const file = formData.get('file') as File
        if (!file || file.size === 0) {
            throw new Error('No file provided')
        }

        const fileName = `upi-qr-${Date.now()}.png` // Force PNG or keep extension

        // Remove old file if exists? 
        // For simplicity, we just upload new one. We could cleanup old ones later.

        const { error: uploadError } = await adminClient.storage
            .from('system-assets')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = adminClient.storage
            .from('system-assets')
            .getPublicUrl(fileName)

        // 3. Update system_settings
        const { error: dbError } = await adminClient
            .from('system_settings')
            .upsert({
                key: 'upi_qr_code_url',
                value: publicUrl,
                updated_at: new Date().toISOString()
            })

        if (dbError) throw dbError

        revalidatePath('/')
        revalidatePath('/admin/settings')

        return { success: true, url: publicUrl }

    } catch (error: unknown) {
        console.error('Update QR code error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

export async function getSystemQrCode() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'upi_qr_code_url')
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            throw error
        }

        return { success: true, url: data?.value || null }
    } catch (error: unknown) {
        console.error('Get QR code error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

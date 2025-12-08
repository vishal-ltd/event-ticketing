'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function uploadPaymentProof(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient()

    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    if (!file || !orderId) {
        return { success: false, error: 'Missing file or order ID' }
    }

    // Verify order ownership
    const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single()

    if (!order || order.user_id !== user.id) {
        return { success: false, error: 'Order not found or unauthorized' }
    }

    try {
        // 1. Ensure bucket exists
        const { data: buckets } = await adminClient.storage.listBuckets()
        const bucketExists = buckets?.some(b => b.name === 'payment_proofs')

        if (!bucketExists) {
            await adminClient.storage.createBucket('payment_proofs', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/*']
            })
        }

        // 2. Upload file
        const fileExt = file.name.split('.').pop()
        const fileName = `${orderId}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await adminClient.storage
            .from('payment_proofs')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) throw uploadError

        // 3. Get public URL
        const { data: { publicUrl } } = adminClient.storage
            .from('payment_proofs')
            .getPublicUrl(filePath)

        // 4. Update order
        const { error: updateError } = await adminClient
            .from('orders')
            .update({
                payment_screenshot_url: publicUrl,
                payment_status: 'pending'
            })
            .eq('id', orderId)

        if (updateError) throw updateError

        revalidatePath(`/events`)
        revalidatePath(`/tickets`)
        return { success: true, url: publicUrl }

    } catch (error: unknown) {
        console.error('Upload failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

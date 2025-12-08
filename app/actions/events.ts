'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to extract filename from payment_screenshot_url
function extractFileNameFromUrl(url: string | null): string | null {
    if (!url) return null
    try {
        // URL format: {supabaseUrl}/storage/v1/object/public/payment_proofs/{filename}
        const match = url.match(/payment_proofs\/([^?]+)/)
        return match ? match[1] : null
    } catch {
        return null
    }
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    // If not admin, verify ownership
    if (!isAdmin) {
        // Verify ownership
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('organizer_id')
            .eq('id', eventId)
            .single()

        if (eventError || !event) {
            return { error: 'Event not found' }
        }

        // Get organizer profile for this user
        const { data: organizer, error: organizerError } = await supabase
            .from('organizers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (organizerError || !organizer) {
            return { error: 'Unauthorized: You are not an organizer' }
        }

        if (organizer.id !== event.organizer_id) {
            return { error: 'Unauthorized: You do not own this event' }
        }
    }

    // Delete dependencies manually (simulating cascade)
    // using adminClient to bypass RLS policies for cleanup

    // 1. Get orders to delete tickets and payment proofs
    const { data: orders } = await adminClient
        .from('orders')
        .select('id, payment_screenshot_url')
        .eq('event_id', eventId)

    const orderIds = orders?.map(o => o.id) || []

    // 2. Delete payment proof files from storage
    const filesToDelete = orders
        ?.map(o => extractFileNameFromUrl(o.payment_screenshot_url))
        .filter((f): f is string => f !== null) || []

    if (filesToDelete.length > 0) {

        const { error: storageError } = await adminClient.storage
            .from('payment_proofs')
            .remove(filesToDelete)

        if (storageError) {
            console.error('Error deleting payment proofs from storage:', storageError)
            // Continue with deletion even if storage cleanup fails
        }
    }

    if (orderIds.length > 0) {
        // Delete tickets
        await adminClient
            .from('tickets')
            .delete()
            .in('order_id', orderIds)

        // Delete orders
        await adminClient
            .from('orders')
            .delete()
            .eq('event_id', eventId)
    }

    // 3. Delete seats
    await adminClient
        .from('seats')
        .delete()
        .eq('event_id', eventId)

    // 4. Delete event
    const { error } = await adminClient
        .from('events')
        .delete()
        .eq('id', eventId)

    if (error) {
        console.error('Delete event error:', error)
        return { error: error.message }
    }

    revalidatePath('/organizer/dashboard')
    revalidatePath('/admin/events')
    revalidatePath('/')
    return { success: true }
}


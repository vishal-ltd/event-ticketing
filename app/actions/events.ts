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

    // Fetch event details to check ownership and get banner_url
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('organizer_id, banner_url')
        .eq('id', eventId)
        .single()

    if (eventError || !event) {
        return { error: 'Event not found' }
    }

    // If not admin, verify ownership
    if (!isAdmin) {
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
    const paymentProofsToDelete = orders
        ?.map(o => extractFileNameFromUrl(o.payment_screenshot_url))
        .filter((f): f is string => f !== null) || []

    if (paymentProofsToDelete.length > 0) {
        const { error: storageError } = await adminClient.storage
            .from('payment_proofs')
            .remove(paymentProofsToDelete)

        if (storageError) {
            console.error('Error deleting payment proofs:', storageError)
        }
    }

    // 3. Delete event banner from storage
    if (event.banner_url) {
        try {
            // URL format: {supabaseUrl}/storage/v1/object/public/event-banners/{filename}
            const match = event.banner_url.match(/event-banners\/([^?]+)/)
            const bannerFileName = match ? match[1] : null

            if (bannerFileName) {
                const { error: bannerResult } = await adminClient.storage
                    .from('event-banners')
                    .remove([bannerFileName])

                if (bannerResult) {
                    console.error('Error deleting event banner:', bannerResult)
                }
            }
        } catch (e) {
            console.error('Error parsing banner URL:', e)
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

    // 4. Delete seats
    await adminClient
        .from('seats')
        .delete()
        .eq('event_id', eventId)

    // 5. Delete event
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


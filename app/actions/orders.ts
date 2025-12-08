'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendTicketEmail } from '@/app/actions/email'

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

export async function approveOrder(orderId: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Check role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
            throw new Error('Unauthorized: Insufficient permissions')
        }

        // 1. Get order details with relations
        const { data: order, error: orderError } = await adminSupabase
            .from('orders')
            .select(`
                *,
                events (title, event_date, venue),
                user_profiles (email)
            `)
            .eq('id', orderId)
            .single()

        if (orderError) throw orderError

        // 2. Get tickets to find associated seats
        const { data: tickets, error: ticketsError } = await adminSupabase
            .from('tickets')
            .select('id, seat_id')
            .eq('order_id', orderId)

        if (ticketsError) throw ticketsError

        const seatIds = tickets.map((t: { seat_id: string }) => t.seat_id)

        // 3. Update order status
        const { error: updateOrderError } = await adminSupabase
            .from('orders')
            .update({ payment_status: 'completed' })
            .eq('id', orderId)

        if (updateOrderError) throw updateOrderError

        // 4. Mark seats as booked
        if (seatIds.length > 0) {
            const { error: updateSeatsError } = await adminSupabase
                .from('seats')
                .update({ is_booked: true })
                .in('id', seatIds)

            if (updateSeatsError) {
                console.error('Error updating seats:', updateSeatsError)
                throw updateSeatsError
            }
        } else {
            console.warn(`Approving order ${orderId}: No seats found to mark as booked`)
        }

        // 5. Send Confirmation Email
        if (order.user_profiles?.email) {
            const ticketIds = tickets.map((t: any) => t.id.slice(0, 8)).join(', ')
            await sendTicketEmail({
                to: order.user_profiles.email,
                eventName: order.events?.title || 'Event',
                ticketId: ticketIds,
                amount: `₹${order.total_amount}`,
                date: order.events?.event_date ? new Date(order.events.event_date).toLocaleDateString() : 'TBD',
                venue: order.events?.venue || 'TBD'
            })
        }

        revalidatePath('/admin/orders')
        revalidatePath('/organizer/dashboard')
        return { success: true }

    } catch (error: unknown) {
        console.error('Approval failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

export async function rejectOrder(orderId: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Check role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
            throw new Error('Unauthorized: Insufficient permissions')
        }

        // 1. Get order details to extract payment screenshot URL
        const { data: order, error: orderFetchError } = await adminSupabase
            .from('orders')
            .select('payment_screenshot_url')
            .eq('id', orderId)
            .single()

        if (orderFetchError) throw orderFetchError

        // 2. Delete payment proof file from storage if exists
        const fileName = extractFileNameFromUrl(order?.payment_screenshot_url)
        if (fileName) {

            const { error: storageError } = await adminSupabase.storage
                .from('payment_proofs')
                .remove([fileName])

            if (storageError) {
                console.error('Error deleting payment proof from storage:', storageError)
                // Continue with rejection even if storage cleanup fails
            }
        }

        // 3. Delete associated tickets first (to avoid FK constraints if no cascade)
        const { error: deleteTicketsError } = await adminSupabase
            .from('tickets')
            .delete()
            .eq('order_id', orderId)

        if (deleteTicketsError) throw deleteTicketsError

        // 4. Delete the order
        // We delete instead of marking 'rejected' to avoid DB constraint issues
        const { error: deleteOrderError } = await adminSupabase
            .from('orders')
            .delete()
            .eq('id', orderId)

        if (deleteOrderError) throw deleteOrderError

        revalidatePath('/admin/orders')
        return { success: true }

    } catch (error: unknown) {
        console.error('Rejection failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

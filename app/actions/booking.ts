'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createBooking(eventId: string, userId: string, seatIds: string[]) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    try {
        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user || user.id !== userId) {
            throw new Error('Unauthorized')
        }

        // 1. Fetch seat details to calculate total amount and verify availability
        // Use admin client to bypass RLS if needed, though reading seats should be public
        const { data: seats, error: seatsError } = await adminClient
            .from('seats')
            .select('*')
            .in('id', seatIds)
            .eq('event_id', eventId)

        if (seatsError || !seats || seats.length !== seatIds.length) {
            throw new Error('Could not fetch seat details')
        }

        // Check for existing tickets for these seats
        const { data: existingTickets } = await adminClient
            .from('tickets')
            .select('*, orders!inner(payment_status)')
            .in('seat_id', seatIds)

        if (existingTickets && existingTickets.length > 0) {
            // Check if any are confirmed or belong to another user
            const unavailable = existingTickets.some(t =>
                t.orders.payment_status === 'completed' ||
                (t.user_id !== userId && t.orders.payment_status === 'pending')
            )

            if (unavailable) {
                throw new Error('One or more seats are already booked or reserved')
            }

            // If we are here, it means the tickets exist but are pending and belong to this user.
            // We should find the order ID and return it.
            // Assuming all seats belong to the same order (simplification).
            const existingOrder = existingTickets[0].order_id
            return { success: true, orderId: existingOrder }
        }

        // Check if any seat is already booked (double check)
        const alreadyBooked = seats.some(seat => seat.is_booked)
        if (alreadyBooked) {
            throw new Error('One or more seats are already booked')
        }

        const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0)

        // 2. Create Order using Admin Client
        const { data: order, error: orderError } = await adminClient
            .from('orders')
            .insert({
                user_id: userId,
                event_id: eventId,
                total_amount: totalAmount,
                payment_status: 'pending',
                payment_method: 'upi',
                payment_id: null
            })
            .select()
            .single()

        if (orderError) throw orderError

        // Helper to generate a short unique code
        const generateTicketCode = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like I, 1, O, 0
            let code = ''
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return code
        }

        // 3. Create Tickets (Pending) using Admin Client
        const tickets = seats.map(seat => ({
            order_id: order.id,
            user_id: userId,
            event_id: eventId,
            seat_id: seat.id,
            qr_code_data: `TICKET-${order.id}-${seat.id}-${Date.now()}`,
            qr_code_url: 'placeholder-url',
            ticket_code: generateTicketCode()
        }))

        const { error: ticketError } = await adminClient
            .from('tickets')
            .insert(tickets)

        if (ticketError) throw ticketError

        return { success: true, orderId: order.id }

    } catch (error: unknown) {
        console.error('Booking creation failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return { success: false, error: errorMessage }
    }
}

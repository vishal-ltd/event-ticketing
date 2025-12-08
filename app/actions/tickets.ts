'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function validateAndCheckInTicket(qrData: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Verify role (organizer or admin)
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['organizer', 'admin', 'staff'].includes(profile.role)) {
            throw new Error('Unauthorized: Insufficient permissions')
        }



        // 1. Find ticket using the robust search RPC
        // We fetch user_profile separately to avoid relationship issues
        const { data: tickets, error: fetchError } = await adminSupabase
            .rpc('search_tickets', { search_query: qrData })
            .select('*, events(title), seats(row_number, seat_number, seat_type)')
            .limit(1)

        if (fetchError) {
            console.error('Error searching tickets:', fetchError)
            return { success: false, error: `Error searching: ${fetchError.message}` }
        }

        let ticket = tickets && tickets.length > 0 ? tickets[0] : null

        if (!ticket) {

            return { success: false, error: 'Invalid ticket code or ID' }
        }

        // Fetch user profile separately
        if (ticket.user_id) {
            const { data: userProfile } = await adminSupabase
                .from('user_profiles')
                .select('full_name')
                .eq('id', ticket.user_id)
                .single()

            if (userProfile) {
                ticket = { ...ticket, user_profiles: userProfile }
            }
        }

        // 2. Check if already used
        if (ticket.check_in_status === 'checked_in') {
            return {
                success: false,
                error: 'Ticket already used',
                ticket: ticket
            }
        }

        // 3. Mark as checked in
        const { error: updateError } = await adminSupabase
            .from('tickets')
            .update({
                check_in_status: 'checked_in',
                checked_in_at: new Date().toISOString()
            })
            .eq('id', ticket.id)

        if (updateError) throw updateError

        return {
            success: true,
            message: 'Check-in successful',
            ticket: ticket
        }

    } catch (error: unknown) {
        console.error('Ticket validation failed:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

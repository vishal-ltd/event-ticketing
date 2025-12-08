import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TicketCard } from '@/components/tickets/ticket-card'
import { Ticket as TicketIcon } from 'lucide-react'

interface TicketData {
    id: string
    ticket_code?: string
    qr_code_data: string
    check_in_status: string
    events: {
        title: string
        event_date: string
        venue: string
        banner_url: string | null
    }
    seats: {
        row_number: string
        seat_number: string
        seat_type: string
    }
    orders: {
        payment_status: string
    }
}

export default async function MyTicketsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?next=/tickets')
    }

    const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
            *,
            events (
                title,
                event_date,
                venue,
                banner_url
            ),
            seats (
                row_number,
                seat_number
            ),
            orders!inner (
                payment_status
            )
        `)
        .eq('user_id', user.id)
        .eq('orders.payment_status', 'completed')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tickets:', JSON.stringify(error, null, 2))
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        return <div className="p-8 text-center text-red-500">Error loading tickets: {error.message}. Please try again.</div>
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">My Tickets</h1>

            {tickets.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                    <p className="text-muted-foreground mb-6">You haven't booked any tickets yet.</p>
                    <Button asChild>
                        <Link href="/events">Browse Events</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tickets.map((ticket: TicketData) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    )
}

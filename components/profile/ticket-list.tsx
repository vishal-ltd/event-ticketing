import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'

export async function TicketList({ userId }: { userId: string }) {
    const supabase = await createClient()

    const { data: tickets } = await supabase
        .from('tickets')
        .select(`
      *,
      events (
        title,
        event_date,
        event_time,
        venue
      ),
      seats (
        row_number,
        seat_number,
        seat_type
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (!tickets?.length) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    No tickets found. <Link href="/" className="text-primary hover:underline">Browse events</Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
                <Card key={ticket.id}>
                    <CardHeader>
                        <CardTitle className="line-clamp-1">{ticket.events.title}</CardTitle>
                        <CardDescription>
                            {format(new Date(ticket.events.event_date), 'PPP')} at {ticket.events.event_time}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <Badge variant={ticket.check_in_status === 'checked_in' ? 'secondary' : 'default'}>
                                {ticket.check_in_status === 'checked_in' ? 'Used' : 'Valid'}
                            </Badge>
                            <span className="text-sm font-medium">
                                {ticket.seats.seat_type} - {ticket.seats.row_number}{ticket.seats.seat_number}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                            {ticket.events.venue}
                        </div>
                        <Link href={`/tickets/${ticket.id}`} className="text-primary hover:underline text-sm">
                            View Ticket
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

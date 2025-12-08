import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TicketDisplay } from '@/components/tickets/ticket-display'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user) {
        redirect('/auth/login')
    }

    const { data: ticket } = await supabase
        .from('tickets')
        .select('*, events(*), seats(*)')
        .eq('id', id)
        .single()

    if (!ticket) {
        redirect('/profile')
    }

    // Verify ownership
    if (ticket.user_id !== user.id) {
        redirect('/profile')
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tickets
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Ticket Details</h1>
            </div>

            <TicketDisplay ticket={ticket} event={ticket.events} />

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Show this QR code at the entrance.</p>
                <p>Ticket ID: {ticket.id}</p>
            </div>
        </div>
    )
}

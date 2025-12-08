import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingSummary } from '@/components/booking/booking-summary'
import { PaymentForm } from '@/components/booking/payment-form'
import { CountdownTimer } from '@/components/booking/countdown-timer'

export default async function BookingPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ seats?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params
    const { seats: seatsParam } = await searchParams

    if (!user) {
        redirect(`/auth/login?next=/events/${id}/booking`)
    }

    if (!seatsParam) {
        redirect(`/events/${id}`)
    }

    const seatIds = seatsParam.split(',')

    // Verify locks
    const { data: locks } = await supabase
        .from('seat_locks')
        .select('expires_at')
        .in('seat_id', seatIds)
        .eq('user_id', user.id)

    if (!locks || locks.length !== seatIds.length) {
        // Locks expired or invalid
        redirect(`/events/${id}?error=expired`)
    }

    // Get event and seat details
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    const { data: seats } = await supabase
        .from('seats')
        .select('*')
        .in('id', seatIds)

    // Calculate expiry from the earliest lock
    const expiresAt = new Date(Math.min(...locks.map(l => new Date(l.expires_at).getTime())))

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Complete Your Booking</h1>
                <CountdownTimer expiresAt={expiresAt} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <BookingSummary event={event} seats={seats || []} />
                <PaymentForm event={event} seats={seats || []} />
            </div>
        </div>
    )
}

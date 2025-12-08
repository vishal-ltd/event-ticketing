'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EventData {
    id: string
    title: string
}

interface SeatData {
    id: string
    price: number
}

export function PaymentForm({ event, seats }: { event: EventData, seats: SeatData[] }) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    async function handlePayment() {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not found')

            const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0)

            // 1. Create Order with pending status
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    event_id: event.id,
                    total_amount: totalAmount,
                    payment_status: 'pending',
                    payment_method: 'upi',
                    payment_id: null
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Generate Tickets (Pending)
            const tickets = seats.map(seat => ({
                order_id: order.id,
                user_id: user.id,
                event_id: event.id,
                seat_id: seat.id,
                qr_code_data: `TICKET-${order.id}-${seat.id}-${Date.now()}`,
                qr_code_url: 'placeholder-url'
            }))

            const { error: ticketError } = await supabase
                .from('tickets')
                .insert(tickets)

            if (ticketError) throw ticketError

            // Redirect to payment page
            router.push(`/events/${event.id}/payment/${order.id}`)

        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            alert('Booking failed: ' + errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter your card information to complete the purchase</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 border rounded-md bg-muted/50 text-center space-y-2">
                    <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        This is a demo payment form. No actual charge will be made.
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={handlePayment} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Booking & Pay
                </Button>
            </CardFooter>
        </Card>
    )
}

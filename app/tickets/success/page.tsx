import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { TicketDisplay } from '@/components/tickets/ticket-display'
import { SlideUp, ScaleIn, StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/motion'

export default async function TicketSuccessPage({
    searchParams
}: {
    searchParams: Promise<{ orderId: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { orderId } = await searchParams

    if (!user || !orderId) {
        redirect('/')
    }

    const { data: order } = await supabase
        .from('orders')
        .select('*, events(*)')
        .eq('id', orderId)
        .single()

    if (!order) redirect('/')

    const { data: tickets } = await supabase
        .from('tickets')
        .select('*, seats(*)')
        .eq('order_id', order.id)

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl text-center">
            <SlideUp className="mb-8 flex flex-col items-center">
                <ScaleIn delay={0.2}>
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                </ScaleIn>
                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-muted-foreground">
                    Thank you for your purchase. Your tickets have been sent to your email.
                </p>
            </SlideUp>

            <StaggerContainer className="grid gap-6 mb-8">
                {tickets?.map((ticket) => (
                    <StaggerItem key={ticket.id}>
                        <TicketDisplay ticket={ticket} event={order.events} />
                    </StaggerItem>
                ))}
            </StaggerContainer>

            <FadeIn delay={0.5} className="flex justify-center gap-4">
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/profile">
                        View My Tickets
                    </Link>
                </Button>
            </FadeIn>
        </div>
    )
}

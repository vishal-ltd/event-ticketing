import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PaymentUploadForm } from '@/components/booking/payment-upload-form'

export default async function PaymentPage({
    params
}: {
    params: Promise<{ id: string; orderId: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id, orderId } = await params

    if (!user) {
        redirect('/auth/login')
    }

    // Get order details
    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

    if (!order) {
        redirect(`/events/${id}`)
    }

    // Get event details
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    // Get system QR code
    const { data: qrSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'upi_qr_code_url')
        .single()

    const qrCodeUrl = qrSetting?.value || '/payment-qr.jpg'

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-md mx-auto mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
                <p className="text-muted-foreground">
                    Order #{orderId.slice(0, 8)}
                </p>
            </div>

            <PaymentUploadForm order={order} event={event} qrCodeUrl={qrCodeUrl} />
        </div>
    )
}

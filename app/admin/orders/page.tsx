import { createAdminClient } from '@/lib/supabase/admin'
import { OrderApprovalList } from '@/components/admin/order-approval-list'

interface OrderData {
    id: string
    user_id: string
    event_id: string
    total_amount: number
    payment_status: string
    payment_screenshot_url?: string
    created_at: string
    events?: { title: string } | null
}

interface ProfileData {
    id: string
    full_name: string | null
    email: string | null
}

export default async function AdminOrdersPage() {
    const supabase = createAdminClient()

    // Fetch pending orders with event details (removed user_profiles join due to missing FK)
    const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
            *,
            events (title)
        `)
        .order('created_at', { ascending: false })

    if (ordersError) {
        console.error('AdminOrdersPage: Error fetching orders:', JSON.stringify(ordersError, null, 2))
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-bold mb-2">Error Loading Orders</h3>
                <p>{ordersError.message}</p>
                <p className="text-sm text-muted-foreground mt-2">
                    {ordersError.details || 'Please check the database connection and schema.'}
                </p>
            </div>
        )
    }

    // Manually fetch user profiles to workaround missing FK
    const userIds = Array.from(new Set((ordersData as OrderData[])?.map((o) => o.user_id) || []))
    let profiles: ProfileData[] = []

    if (userIds.length > 0) {
        const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .in('id', userIds)

        profiles = profilesData || []
    }

    // Combine data
    const orders = (ordersData as OrderData[])?.map((order) => ({
        ...order,
        user_profiles: profiles.find(p => p.id === order.user_id) || null
    }))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Payment Approvals</h1>
            </div>

            <OrderApprovalList orders={orders || []} />
        </div>
    )
}

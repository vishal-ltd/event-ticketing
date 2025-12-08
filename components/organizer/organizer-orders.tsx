import { createAdminClient } from '@/lib/supabase/admin'
import { OrderApprovalList } from '@/components/admin/order-approval-list'

interface OrderData {
    id: string
    user_id: string
    total_amount: number
    payment_status: string
    payment_screenshot_url?: string
    created_at: string
    events?: { title: string; organizer_id: string } | null
}

interface ProfileData {
    id: string
    full_name: string | null
    email: string | null
}

export async function OrganizerOrders({ organizerId }: { organizerId: string }) {
    const supabase = createAdminClient()

    // Fetch all orders for events created by this organizer
    // Removed user_profiles join to avoid PGRST200 error
    const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
            *,
            events!inner (
                title,
                organizer_id
            )
        `)
        .eq('events.organizer_id', organizerId)
        .order('created_at', { ascending: false })

    if (ordersError) {
        console.error('OrganizerOrders: Error fetching orders:', ordersError)
        return <div className="text-red-500">Error loading orders: {ordersError.message}</div>
    }

    // Manually fetch user profiles
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
            <h2 className="text-2xl font-bold">Orders Management</h2>
            <OrderApprovalList orders={(orders || []) as Parameters<typeof OrderApprovalList>[0]['orders']} />
        </div>
    )
}

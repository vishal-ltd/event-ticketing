import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndianRupee, Ticket, Calendar, TrendingUp, Users, Star } from 'lucide-react'

export async function OrganizerAnalytics({ organizerId }: { organizerId: string }) {
    const supabase = createAdminClient()

    // 1. Get all events for organizer
    const { data: events } = await supabase
        .from('events')
        .select('id, title, total_capacity')
        .eq('organizer_id', organizerId)

    if (!events?.length) return <div>No data available</div>

    const eventIds = events.map(e => e.id)

    // 2. Get completed orders for revenue
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .in('event_id', eventIds)
        .eq('payment_status', 'completed')

    // 3. Get total tickets sold (count tickets directly)
    const { count: ticketsSold } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)

    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
    const totalOrders = orders?.length || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // 4. Get waitlist count
    const { count: waitlistCount } = await supabase
        .from('waitlists')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)

    // 5. Get average rating
    const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('event_id', eventIds)

    const avgRating = reviews?.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'N/A'

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ticketsSold || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waitlist Demand</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{waitlistCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Users waiting for seats</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgRating}</div>
                        <p className="text-xs text-muted-foreground">Based on {reviews?.length || 0} reviews</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

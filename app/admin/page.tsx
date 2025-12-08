import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, IndianRupee } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch stats
    const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

    const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

    // Calculate total revenue (mock for now, or sum from orders if table exists)
    // Assuming 'orders' table exists with 'total_amount'
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>

            <StaggerContainer className="grid gap-4 md:grid-cols-3">
                <StaggerItem>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userCount || 0}</div>
                        </CardContent>
                    </Card>
                </StaggerItem>
                <StaggerItem>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Events
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{eventCount || 0}</div>
                        </CardContent>
                    </Card>
                </StaggerItem>
                <StaggerItem>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </StaggerItem>
            </StaggerContainer>
        </div>
    )
}

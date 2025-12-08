import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, QrCode, Users } from 'lucide-react'
import Link from 'next/link'
import { OrganizerEvents } from '@/components/organizer/organizer-events'
import { OrganizerAnalytics } from '@/components/organizer/organizer-analytics'
import { OrganizerOrders } from '@/components/organizer/organizer-orders'
import { LogoutButton } from '@/components/auth/logout-button'
import { FadeIn } from '@/components/ui/motion'

export const dynamic = 'force-dynamic'

export default async function OrganizerDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: organizer } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!organizer || !organizer.approved) {
        redirect('/organizer/register')
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
                <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
                <div className="flex gap-2 w-full md:w-auto items-center flex-wrap">
                    <LogoutButton />
                    <Button asChild variant="outline" className="flex-1 md:flex-none">
                        <Link href="/organizer/staff">
                            <Users className="mr-2 h-4 w-4" />
                            Staff
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 md:flex-none">
                        <Link href="/organizer/scanner">
                            <QrCode className="mr-2 h-4 w-4" />
                            Open Scanner
                        </Link>
                    </Button>
                    <Button asChild className="flex-1 md:flex-none">
                        <Link href="/organizer/events/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="events" className="w-full">
                <TabsList className="mb-8 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="events">My Events</TabsTrigger>
                    <TabsTrigger value="orders">Orders & Approvals</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="events">
                    <FadeIn>
                        <OrganizerEvents organizerId={organizer.id} />
                    </FadeIn>
                </TabsContent>

                <TabsContent value="orders">
                    <FadeIn>
                        <OrganizerOrders organizerId={organizer.id} />
                    </FadeIn>
                </TabsContent>

                <TabsContent value="analytics">
                    <FadeIn>
                        <OrganizerAnalytics organizerId={organizer.id} />
                    </FadeIn>
                </TabsContent>
            </Tabs>
        </div>
    )
}

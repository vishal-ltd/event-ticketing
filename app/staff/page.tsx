import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, CheckCircle, CalendarDays, Clock } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/motion'

export const dynamic = 'force-dynamic'

export default async function StaffDashboardPage() {
    const supabase = await createClient()

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get check-ins for today
    const { count: todayCheckIns } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('check_in_status', 'checked_in')
        .gte('checked_in_at', today.toISOString())
        .lt('checked_in_at', tomorrow.toISOString())

    // Get events happening today
    const { data: todaysEvents } = await supabase
        .from('events')
        .select('id, title, start_date, venue')
        .eq('status', 'approved')
        .gte('start_date', today.toISOString())
        .lt('start_date', tomorrow.toISOString())
        .order('start_date', { ascending: true })

    // Get total pending check-ins (tickets with confirmed orders but not checked in)
    const { count: pendingCheckIns } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('check_in_status', 'pending')

    return (
        <FadeIn>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome! Scan tickets to check in attendees.
                    </p>
                </div>

                {/* Quick Action */}
                <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                                    <QrCode className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Ready to Scan</h2>
                                    <p className="text-muted-foreground">
                                        Open the scanner to check in attendees
                                    </p>
                                </div>
                            </div>
                            <Button asChild size="lg" className="w-full md:w-auto">
                                <Link href="/staff/scanner">
                                    <QrCode className="mr-2 h-5 w-5" />
                                    Open Scanner
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Checked In Today
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{todayCheckIns || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Tickets scanned today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Check-ins
                            </CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCheckIns || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Valid tickets awaiting check-in
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Events Today
                            </CardTitle>
                            <CalendarDays className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{todaysEvents?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Events scheduled for today
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Events */}
                {todaysEvents && todaysEvents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Today&apos;s Events</CardTitle>
                            <CardDescription>
                                Events happening today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {todaysEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                                    >
                                        <div>
                                            <h3 className="font-medium">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {event.venue}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(event.start_date).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </FadeIn>
    )
}

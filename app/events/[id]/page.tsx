import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { SeatMap } from '@/components/events/seat-map'
import { WaitlistButton } from '@/components/events/waitlist-button'
import { ReviewForm } from '@/components/events/review-form'
import { ReviewList } from '@/components/events/review-list'
import { Separator } from '@/components/ui/separator'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: event } = await supabase
        .from('events')
        .select('*, organizers(org_name)')
        .eq('id', id)
        .single()

    if (!event) {
        notFound()
    }

    // Check capacity
    const { count: totalSeats } = await supabase
        .from('seats')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)

    const { count: bookedSeats } = await supabase
        .from('seats')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('is_booked', true)

    const isSoldOut = (totalSeats || 0) > 0 && (bookedSeats || 0) >= (totalSeats || 0)
    const isPastEvent = new Date(event.event_date) < new Date()

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Event Info */}
                <div className="lg:col-span-2 space-y-8">
                    {event.banner_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <img
                                src={event.banner_url}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge>{event.category}</Badge>
                            <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                                {event.status}
                            </Badge>
                            {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                        <p className="text-xl text-muted-foreground mb-6">
                            by {event.organizers.org_name}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Date</p>
                                    <p className="text-muted-foreground">
                                        {format(new Date(event.event_date), 'PPP')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Time</p>
                                    <p className="text-muted-foreground">{event.event_time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Venue</p>
                                    <p className="text-muted-foreground">{event.venue}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Capacity</p>
                                    <p className="text-muted-foreground">{totalSeats || event.total_capacity} seats</p>
                                </div>
                            </div>
                        </div>

                        <div className="prose max-w-none mb-12">
                            <h3 className="text-xl font-bold mb-2">About this event</h3>
                            <p className="whitespace-pre-wrap">{event.description}</p>
                        </div>

                        <Separator className="my-8" />

                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold">Reviews</h2>
                            {isPastEvent && (
                                <div className="mb-8">
                                    <ReviewForm eventId={event.id} />
                                </div>
                            )}
                            <ReviewList eventId={event.id} />
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-6">
                            {isSoldOut ? (
                                <div className="text-center space-y-4">
                                    <h3 className="text-xl font-bold text-destructive">Sold Out</h3>
                                    <p className="text-muted-foreground">
                                        This event is currently fully booked. Join the waitlist to get notified if seats become available.
                                    </p>
                                    <WaitlistButton eventId={event.id} isSoldOut={true} />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">Select Seats</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Click on the seats below to select them. Locked seats are held for 5 minutes.
                                        </p>
                                        <SeatMap eventId={event.id} />
                                    </div>
                                    <Separator />
                                    {/* Optional waitlist button even if not strictly sold out, for testing */}
                                    {/* <WaitlistButton eventId={event.id} isSoldOut={true} /> */}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

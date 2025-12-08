import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { Edit, Trash } from 'lucide-react'
import { DeleteEventButton } from './delete-event-button'

export async function OrganizerEvents({ organizerId }: { organizerId: string }) {
    const supabase = await createClient()

    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false })

    if (!events?.length) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    You haven't created any events yet.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <Card key={event.id}>
                    {event.banner_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                            <img
                                src={event.banner_url}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                            <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                                {event.status}
                            </Badge>
                        </div>
                        <CardDescription>
                            {format(new Date(event.event_date), 'PPP')} at {event.event_time}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mt-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/organizer/events/${event.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <DeleteEventButton eventId={event.id} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

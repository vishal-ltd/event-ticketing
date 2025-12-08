import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

interface Event {
    id: string
    title: string
    event_date: string
    venue: string
    description: string
    category: string
    banner_url?: string | null
}

export function EventGrid({ events }: { events: Event[] }) {
    if (events.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                No events found matching your criteria.
            </div>
        )
    }

    return (
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <StaggerItem key={event.id} className="h-full">
                    <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        {event.banner_url ? (
                            <div className="aspect-video w-full overflow-hidden">
                                <img
                                    src={event.banner_url}
                                    alt={event.title}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                            </div>
                        ) : (
                            <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground">
                                No Image
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="mb-2">
                                    {event.category}
                                </Badge>
                            </div>
                            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(event.event_date), 'PPP')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {event.venue}
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/events/${event.id}`}>
                                    Book Tickets
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </StaggerItem>
            ))}
        </StaggerContainer>
    )
}

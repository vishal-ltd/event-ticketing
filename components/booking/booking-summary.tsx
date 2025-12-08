import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Calendar, MapPin } from 'lucide-react'

interface EventData {
    id: string
    title: string
    event_date: string
    event_time: string
    venue: string
}

interface SeatData {
    id: string
    seat_type: string
    row_number: string
    seat_number: string
    price: number
}

export function BookingSummary({ event, seats }: { event: EventData, seats: SeatData[] }) {
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.event_date), 'PPP')} at {event.event_time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.venue}
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    {seats.map((seat) => (
                        <div key={seat.id} className="flex justify-between text-sm">
                            <span>
                                {seat.seat_type} Seat - {seat.row_number}{seat.seat_number}
                            </span>
                            <span>₹{seat.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}

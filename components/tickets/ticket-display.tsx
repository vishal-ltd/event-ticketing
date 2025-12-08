'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import QRCode from 'qrcode'
import { Loader2 } from 'lucide-react'

interface TicketData {
    id: string
    qr_code_data: string
    seats: {
        row_number: string
        seat_number: string
        seat_type: string
        price: number
    }
}

interface EventData {
    id: string
    title: string
    event_date: string
    event_time: string
    venue: string
}

export function TicketDisplay({ ticket, event }: { ticket: TicketData, event: EventData }) {
    const [qrUrl, setQrUrl] = useState<string>('')

    useEffect(() => {
        // Generate QR code client-side for now to avoid storage complexity in this demo
        // In production, we'd fetch the stored URL or generate on server
        QRCode.toDataURL(ticket.qr_code_data)
            .then(url => setQrUrl(url))
            .catch(err => console.error(err))
    }, [ticket.qr_code_data])

    return (
        <Card className="overflow-hidden border-l-4 border-l-primary text-left">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    <div className="flex-grow p-6 space-y-4">
                        <div>
                            <h3 className="font-bold text-xl">{event.title}</h3>
                            <p className="text-muted-foreground">
                                {format(new Date(event.event_date), 'PPP')} at {event.event_time}
                            </p>
                            <p className="text-muted-foreground">{event.venue}</p>
                        </div>

                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Seat</p>
                                <p className="font-bold text-lg">
                                    {ticket.seats.row_number}{ticket.seats.seat_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                                <p className="font-bold text-lg">{ticket.seats.seat_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Price</p>
                                <p className="font-bold text-lg">${ticket.seats.price}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-6 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-dashed">
                        {qrUrl ? (
                            <img src={qrUrl} alt="Ticket QR Code" className="w-32 h-32 mix-blend-multiply" />
                        ) : (
                            <div className="w-32 h-32 flex items-center justify-center">
                                <Loader2 className="animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

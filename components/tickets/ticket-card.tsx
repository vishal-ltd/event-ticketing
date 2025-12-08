'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, MapPin, Ticket as TicketIcon, Maximize2 } from 'lucide-react'
import { format } from 'date-fns'

interface TicketCardProps {
    ticket: {
        id: string
        qr_code_data: string
        ticket_code?: string
        events: {
            title: string
            event_date: string
            venue: string
            banner_url: string | null
        }
        seats: {
            row_number: string
            seat_number: string
            seat_type: string
        }
    }
}

export function TicketCard({ ticket }: TicketCardProps) {
    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <div className="relative h-32 bg-muted group cursor-pointer">
                {ticket.events.banner_url ? (
                    <img
                        src={ticket.events.banner_url}
                        alt={ticket.events.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <TicketIcon className="h-12 w-12 text-primary/40" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                    {ticket.seats.seat_type}
                </div>

                {/* Overlay with zoom icon */}
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button variant="secondary" size="sm" className="pointer-events-none">
                                <Maximize2 className="h-4 w-4 mr-2" />
                                View QR
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center">Ticket QR Code</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-6 space-y-6">
                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm">
                                <QRCodeSVG value={ticket.qr_code_data} size={256} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-bold text-lg">{ticket.events.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(ticket.events.event_date), 'PPP p')}
                                </p>
                                <div className="pt-2 space-y-2">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                        Seat: {ticket.seats.row_number}-{ticket.seats.seat_number}
                                    </span>
                                    {ticket.ticket_code && (
                                        <div className="text-xl font-mono font-bold tracking-widest text-center border-t pt-2 mt-2">
                                            {ticket.ticket_code}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                Show this QR code at the venue entrance.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <CardHeader>
                <CardTitle className="line-clamp-1">{ticket.events.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(ticket.events.event_date), 'PPP p')}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ticket.events.venue}
                        </p>
                        <div className="mt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Seat</p>
                            <p className="text-2xl font-bold">
                                {ticket.seats.row_number}-{ticket.seats.seat_number}
                            </p>
                        </div>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="bg-white p-2 rounded border cursor-pointer hover:border-primary transition-colors">
                                <QRCodeSVG value={ticket.qr_code_data} size={80} />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-center">Ticket QR Code</DialogTitle>
                            </DialogHeader>
                            <div id={`ticket-content-${ticket.id}`} className="flex flex-col items-center justify-center p-6 space-y-6 bg-white rounded-xl">
                                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm">
                                    <QRCodeSVG value={ticket.qr_code_data} size={256} />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-bold text-lg text-black">{ticket.events.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(ticket.events.event_date), 'PPP p')}
                                    </p>
                                    <div className="pt-2">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                            Seat: {ticket.seats.row_number}-{ticket.seats.seat_number}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-center text-gray-400">
                                    Show this QR code at the venue entrance.
                                </p>
                            </div>
                            <div className="flex justify-center pb-4">
                                <Button onClick={() => {
                                    const element = document.getElementById(`ticket-content-${ticket.id}`)
                                    if (element) {
                                        import('html2canvas').then(html2canvas => {
                                            html2canvas.default(element).then(canvas => {
                                                const imgData = canvas.toDataURL('image/png')
                                                import('jspdf').then(jsPDF => {
                                                    const doc = new jsPDF.default()
                                                    const imgProps = doc.getImageProperties(imgData)
                                                    const pdfWidth = doc.internal.pageSize.getWidth()
                                                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                                                    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                                                    doc.save(`ticket-${ticket.id.slice(0, 8)}.pdf`)
                                                })
                                            })
                                        })
                                    }
                                }}>
                                    <Maximize2 className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>

            <CardFooter className="bg-muted/20 border-t p-3 flex flex-col gap-1">
                <p className="text-xs text-center w-full text-muted-foreground font-mono">
                    ID: {ticket.id.slice(0, 8).toUpperCase()}
                </p>
                {ticket.ticket_code && (
                    <p className="text-sm text-center w-full font-bold font-mono tracking-widest text-primary">
                        CODE: {ticket.ticket_code}
                    </p>
                )}
            </CardFooter>
        </Card>
    )
}

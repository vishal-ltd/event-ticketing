'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createBooking } from '@/app/actions/booking'

interface Seat {
    id: string
    row_number: string
    seat_number: string
    seat_type: string
    price: number
    is_booked: boolean
}

export function SeatMap({ eventId }: { eventId: string }) {
    const [seats, setSeats] = useState<Seat[]>([])
    const [selectedSeats, setSelectedSeats] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLocking, setIsLocking] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    // const { toast } = useToast() // Assuming shadcn toast is installed, but I'll use alert for now if not

    useEffect(() => {
        fetchSeats()

        // Real-time subscription
        const channel = supabase
            .channel('seats')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'seats',
                    filter: `event_id=eq.${eventId}`,
                },
                (payload) => {
                    fetchSeats() // Refresh on any change
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId])

    async function fetchSeats() {
        const { data } = await supabase
            .from('seats')
            .select('*')
            .eq('event_id', eventId)
            .order('row_number')
            .order('seat_number')

        if (data) setSeats(data)
        setIsLoading(false)
    }

    function toggleSeat(seatId: string) {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(prev => prev.filter(id => id !== seatId))
        } else {
            // Limit selection to 6 seats
            if (selectedSeats.length >= 6) {
                alert('You can only select up to 6 seats')
                return
            }
            setSelectedSeats(prev => [...prev, seatId])
        }
    }

    async function handleCheckout() {
        setIsLocking(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push(`/auth/login?next=/events/${eventId}`)
                return
            }

            // 1. Lock seats
            for (const seatId of selectedSeats) {
                const { data: success, error } = await supabase.rpc('lock_seat', {
                    p_seat_id: seatId,
                    p_user_id: user.id,
                    p_duration_minutes: 5
                })

                if (error || !success) {
                    throw new Error('Could not lock one or more seats. They may have been taken.')
                }
            }

            // 2. Create Booking (Order & Tickets)
            const result = await createBooking(eventId, user.id, selectedSeats)

            if (!result.success) {
                throw new Error(result.error)
            }

            // 3. Redirect to manual payment page
            router.push(`/events/${eventId}/payment/${result.orderId}`)

        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            alert(errorMessage)
            // Refresh seats to show current status
            fetchSeats()
            setSelectedSeats([])
        } finally {
            setIsLocking(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    // Group seats by row and sort properly
    const groupedSeats = seats.reduce((acc: Record<string, Seat[]>, seat) => {
        if (!acc[seat.row_number]) acc[seat.row_number] = []
        acc[seat.row_number].push(seat)
        return acc
    }, {})

    // Sort each row's seats numerically by seat_number
    Object.values(groupedSeats).forEach(row => {
        row.sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
    })

    // Sort rows alphabetically/numerically
    const sortedRowKeys = Object.keys(groupedSeats).sort((a, b) => {
        // Handle letter rows (A, B, C...) and numeric rows (R1, R2...)
        const aNum = a.charCodeAt(0)
        const bNum = b.charCodeAt(0)
        return aNum - bNum
    })

    const rows = sortedRowKeys.map(key => groupedSeats[key])

    const totalPrice = selectedSeats.reduce((sum, id) => {
        const seat = seats.find(s => s.id === id)
        return sum + (seat?.price || 0)
    }, 0)

    return (
        <div className="space-y-6">
            <div className="w-full overflow-x-auto pb-4">
                <div className="min-w-[300px] space-y-2 px-2">
                    {/* Screen indicator */}
                    <div className="w-full h-8 bg-muted rounded-t-lg mb-8 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest">
                        Screen
                    </div>

                    {/* Seat Grid */}
                    <div className="flex flex-col gap-2 items-center">
                        {rows.map((row: Seat[], i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <span className="w-6 text-xs text-muted-foreground text-right">{row[0].row_number}</span>
                                {row.map((seat: Seat) => (
                                    <button
                                        key={seat.id}
                                        disabled={seat.is_booked}
                                        onClick={() => toggleSeat(seat.id)}
                                        className={cn(
                                            "w-8 h-8 rounded-t-md text-[10px] flex items-center justify-center transition-colors border",
                                            seat.is_booked
                                                ? "bg-muted text-muted-foreground cursor-not-allowed border-transparent"
                                                : selectedSeats.includes(seat.id)
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : seat.seat_type === 'VIP'
                                                        ? "bg-amber-100 border-amber-200 hover:bg-amber-200 text-amber-900"
                                                        : seat.seat_type === 'Premium'
                                                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900"
                                                            : "bg-background hover:bg-muted"
                                        )}
                                        title={`${seat.seat_type} - ₹${seat.price}`}
                                    >
                                        {seat.seat_number}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 justify-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-background border rounded-sm"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-primary rounded-sm"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-muted rounded-sm"></div>
                    <span>Booked</span>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Selected</p>
                        <p className="font-bold">{selectedSeats.length} seats</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="font-bold text-xl">₹{totalPrice.toFixed(2)}</p>
                    </div>
                </div>
                <Button
                    className="w-full"
                    size="lg"
                    disabled={selectedSeats.length === 0 || isLocking}
                    onClick={handleCheckout}
                >
                    {isLocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Proceed to Checkout
                </Button>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface SeatLayoutDesignerProps {
    eventId: string
    onComplete: () => void
}

export function SeatLayoutDesigner({ eventId, onComplete }: SeatLayoutDesignerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [rows, setRows] = useState(10)
    const [cols, setCols] = useState(10)
    const [prices, setPrices] = useState({
        VIP: 100,
        Premium: 50,
        Regular: 25
    })
    const supabase = createClient()

    async function generateSeats() {
        setIsLoading(true)
        try {
            const seats = []
            const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

            for (let r = 0; r < rows; r++) {
                for (let c = 1; c <= cols; c++) {
                    let type = 'Regular'
                    let price = prices.Regular

                    // Simple logic for seat types: first 2 rows VIP, next 3 Premium, rest Regular
                    if (r < 2) {
                        type = 'VIP'
                        price = prices.VIP
                    } else if (r < 5) {
                        type = 'Premium'
                        price = prices.Premium
                    }

                    seats.push({
                        event_id: eventId,
                        row_number: rowLabels[r] || `R${r + 1}`,
                        seat_number: c.toString(),
                        seat_type: type,
                        price: price,
                        is_booked: false
                    })
                }
            }

            // Insert in batches of 100 to avoid request size limits
            const batchSize = 100
            for (let i = 0; i < seats.length; i += batchSize) {
                const batch = seats.slice(i, i + batchSize)
                const { error } = await supabase.from('seats').insert(batch)
                if (error) throw error
            }

            onComplete()
        } catch (error) {
            console.error(error)
            alert('Error generating seats')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seat Layout Configuration</CardTitle>
                <CardDescription>Define the seating arrangement and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Number of Rows</Label>
                        <Input
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(parseInt(e.target.value))}
                            min={1}
                            max={26}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Seats per Row</Label>
                        <Input
                            type="number"
                            value={cols}
                            onChange={(e) => setCols(parseInt(e.target.value))}
                            min={1}
                            max={50}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium">Pricing Tiers</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>VIP Price</Label>
                            <Input
                                type="number"
                                value={prices.VIP}
                                onChange={(e) => setPrices({ ...prices, VIP: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Premium Price</Label>
                            <Input
                                type="number"
                                value={prices.Premium}
                                onChange={(e) => setPrices({ ...prices, Premium: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Regular Price</Label>
                            <Input
                                type="number"
                                value={prices.Regular}
                                onChange={(e) => setPrices({ ...prices, Regular: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Preview Summary:</p>
                    <ul className="text-sm space-y-1">
                        <li>Total Seats: {rows * cols}</li>
                        <li>VIP Seats: {Math.min(rows, 2) * cols} (Rows A-B)</li>
                        <li>Premium Seats: {Math.max(0, Math.min(rows, 5) - 2) * cols} (Rows C-E)</li>
                        <li>Regular Seats: {Math.max(0, rows - 5) * cols} (Rows F+)</li>
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={generateSeats} disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Seat Map & Publish Event
                </Button>
            </CardFooter>
        </Card>
    )
}

'use client'

import { useState } from 'react'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { validateAndCheckInTicket } from '@/app/actions/tickets'

interface ScanResult {
    valid: boolean
    message: string
    ticket?: {
        events: { title: string }
        user_profiles?: { full_name: string } | null
        seats: { seat_type: string; row_number: string; seat_number: string }
        checked_in_at?: string
    }
}

export function ScannerInterface() {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [manualCode, setManualCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    async function validateTicket(qrData: string) {
        setIsLoading(true)
        setError(null)
        setScanResult(null)

        try {
            const result = await validateAndCheckInTicket(qrData)

            if (result.success) {
                setScanResult({
                    valid: true,
                    message: result.message || 'Check-in successful',
                    ticket: result.ticket
                })
            } else {
                // Handle "Ticket already used" case which returns a ticket object
                if (result.ticket) {
                    setScanResult({
                        valid: false,
                        message: result.error || 'Validation failed',
                        ticket: result.ticket
                    })
                } else {
                    throw new Error(result.error)
                }
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="space-y-6">
            <Tabs defaultValue="scan" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scan">Scan QR</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="scan">
                    <Card>
                        <CardContent className="p-4">
                            <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                                <Scanner
                                    paused={!!scanResult}
                                    onScan={(result: IDetectedBarcode[]) => {
                                        if (result && result.length > 0 && !isLoading && !scanResult) {
                                            validateTicket(result[0].rawValue)
                                        }
                                    }}
                                    onError={(error) => console.error(error)}
                                    components={{
                                        finder: false
                                    }}
                                    styles={{
                                        container: { width: '100%', height: '100%' },
                                        video: { width: '100%', height: '100%', objectFit: 'cover' }
                                    }}
                                />
                                <div className="absolute inset-0 border-2 border-white/50 m-12 rounded-lg pointer-events-none"></div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-4">
                                Point camera at the QR code
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enter Ticket Code</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="TICKET-..."
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                            />
                            <Button
                                className="w-full"
                                onClick={() => validateTicket(manualCode)}
                                disabled={!manualCode || isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Validate
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Result Display */}
            {scanResult && (
                <Card className={scanResult.valid ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                    <CardContent className="p-6 text-center">
                        {scanResult.valid ? (
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        ) : (
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        )}

                        <h2 className="text-2xl font-bold mb-2">
                            {scanResult.valid ? 'Valid Ticket' : 'Invalid / Used'}
                        </h2>
                        <p className="text-lg mb-4">{scanResult.message}</p>

                        {scanResult.ticket && (
                            <div className="text-left bg-white/50 p-4 rounded-lg text-sm space-y-2">
                                <p><strong>Event:</strong> {scanResult.ticket.events.title}</p>
                                <p><strong>Attendee:</strong> {scanResult.ticket.user_profiles?.full_name || 'Unknown'}</p>
                                <p><strong>Seat:</strong> {scanResult.ticket.seats.seat_type} - {scanResult.ticket.seats.row_number}{scanResult.ticket.seats.seat_number}</p>
                                {scanResult.ticket.checked_in_at && (
                                    <p><strong>Checked In:</strong> {format(new Date(scanResult.ticket.checked_in_at), 'Pp')}</p>
                                )}
                            </div>
                        )}

                        <Button
                            className="mt-6 w-full"
                            variant="outline"
                            onClick={() => {
                                setScanResult(null)
                                setManualCode('')
                            }}
                        >
                            Scan Next
                        </Button>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-red-500 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-700 mb-2">Error</h3>
                        <p className="text-red-600">{error}</p>
                        <Button
                            className="mt-4 w-full"
                            variant="outline"
                            onClick={() => setError(null)}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

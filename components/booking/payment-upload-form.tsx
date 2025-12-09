'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { uploadPaymentProof } from '@/app/actions/payment'
import { SlideUp, ScaleIn } from '@/components/ui/motion'

interface OrderData {
    id: string
    total_amount: number
}

interface EventData {
    id: string
    title: string
}

export function PaymentUploadForm({ order, qrCodeUrl }: { order: OrderData, event: EventData, qrCodeUrl: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    async function handleUpload() {
        if (!file) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('orderId', order.id)

            const result = await uploadPaymentProof(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            setIsSuccess(true)

        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            alert('Upload failed: ' + errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <ScaleIn>
                <Card className="w-full max-w-md mx-auto text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle>Payment Submitted!</CardTitle>
                        <CardDescription>
                            Your payment screenshot has been received. The organizer will verify it shortly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            You will receive your tickets once the payment is approved.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push('/')}>
                            Back to Home
                        </Button>
                    </CardFooter>
                </Card>
            </ScaleIn>
        )
    }

    return (
        <SlideUp>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Scan & Pay</CardTitle>
                    <CardDescription>
                        Scan the QR code below to pay <strong>₹{order.total_amount.toFixed(2)}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                            <Image
                                src={qrCodeUrl}
                                alt="Payment QR Code"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
                        <div className="flex gap-2">
                            <Input
                                id="screenshot"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="transition-all focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Please upload a clear screenshot of the successful transaction.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full transition-transform active:scale-95"
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Payment Proof
                    </Button>
                </CardFooter>
            </Card>
        </SlideUp>
    )
}

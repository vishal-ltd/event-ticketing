'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSystemQrCode } from '@/app/actions/admin' // now exists
import { Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
    initialQrUrl: string | null
}

export function SettingsForm({ initialQrUrl }: SettingsFormProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialQrUrl)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!file) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const result = await updateSystemQrCode(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            setPreviewUrl(result.url || null)
            setFile(null)
            alert('QR Code updated successfully')
            router.refresh()

        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            alert('Failed to update: ' + errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)

        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreviewUrl(objectUrl)
        }
    }

    return (
        <Card className="max-w-xl">
            <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Update the UPI QR Code shown to users during payment.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Current QR Code</Label>
                        <div className="border rounded-lg p-4 flex justify-center bg-muted/10">
                            {previewUrl ? (
                                <div className="relative w-48 h-48">
                                    <Image
                                        src={previewUrl}
                                        alt="UPI QR Code"
                                        fill
                                        className="object-contain"
                                        unoptimized // Allow external URLs immediately
                                    />
                                </div>
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center text-muted-foreground bg-muted rounded">
                                    No Image Set
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="qr-file">Upload New QR Code</Label>
                        <Input
                            id="qr-file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <p className="text-sm text-muted-foreground">
                            Recommended: Square image, PNG or JPG.
                        </p>
                    </div>

                    <Button type="submit" disabled={!file || isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Upload className="mr-2 h-4 w-4" />
                        Update QR Code
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

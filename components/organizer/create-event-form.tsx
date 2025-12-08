'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SeatLayoutDesigner } from './seat-layout-designer'

export function CreateEventForm({ organizerId }: { organizerId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [eventId, setEventId] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    async function onEventSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const category = formData.get('category') as string
        const eventDate = formData.get('eventDate') as string
        const eventTime = formData.get('eventTime') as string
        const venue = formData.get('venue') as string
        const totalCapacity = formData.get('totalCapacity') as string
        const bannerFile = formData.get('banner') as File

        try {
            let bannerUrl = null
            if (bannerFile && bannerFile.size > 0) {
                const fileName = `${Date.now()}-${bannerFile.name}`
                const { data, error: uploadError } = await supabase.storage
                    .from('event-banners')
                    .upload(fileName, bannerFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('event-banners')
                    .getPublicUrl(fileName)

                bannerUrl = publicUrl
            }

            const { data, error } = await supabase
                .from('events')
                .insert({
                    organizer_id: organizerId,
                    title,
                    description,
                    category,
                    event_date: eventDate,
                    event_time: eventTime,
                    venue,
                    total_capacity: parseInt(totalCapacity),
                    banner_url: bannerUrl,
                    status: 'pending',
                })
                .select()
                .single()

            if (error) throw error

            setEventId(data.id)
            setStep(2)
        } catch (error) {
            console.error(error)
            alert('Error creating event')
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 2 && eventId) {
        return (
            <SeatLayoutDesigner
                eventId={eventId}
                onComplete={() => router.push('/organizer/dashboard')}
            />
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <form onSubmit={onEventSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" name="title" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="concert">Concert</SelectItem>
                                    <SelectItem value="theatre">Theatre</SelectItem>
                                    <SelectItem value="comedy">Comedy</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="workshop">Workshop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalCapacity">Total Capacity</Label>
                            <Input id="totalCapacity" name="totalCapacity" type="number" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventDate">Date</Label>
                            <Input id="eventDate" name="eventDate" type="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventTime">Time</Label>
                            <Input id="eventTime" name="eventTime" type="time" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venue">Venue Name</Label>
                        <Input id="venue" name="venue" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="banner">Event Banner</Label>
                        <Input id="banner" name="banner" type="file" accept="image/*" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Configure Seats
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

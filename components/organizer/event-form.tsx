'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SeatLayoutDesigner } from './seat-layout-designer'

interface EventData {
    id: string
    title: string
    description: string
    category: string
    event_date: string
    event_time: string
    venue: string
    total_capacity: number
    banner_url?: string | null
    status: string
}

interface EventFormProps {
    organizerId: string
    initialData?: EventData
}

export function EventForm({ organizerId, initialData }: EventFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [eventId, setEventId] = useState<string | null>(initialData?.id || null)
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
            let bannerUrl = initialData?.banner_url || null

            if (bannerFile && bannerFile.size > 0) {
                const fileName = `${Date.now()}-${bannerFile.name}`
                const { error: uploadError } = await supabase.storage
                    .from('event-banners')
                    .upload(fileName, bannerFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('event-banners')
                    .getPublicUrl(fileName)

                bannerUrl = publicUrl
            }

            const eventData = {
                organizer_id: organizerId,
                title,
                description,
                category,
                event_date: eventDate,
                event_time: eventTime,
                venue,
                total_capacity: parseInt(totalCapacity),
                banner_url: bannerUrl,
                status: initialData ? initialData.status : 'pending',
            }

            let result
            if (initialData) {
                // Update
                result = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', initialData.id)
                    .select()
                    .single()
            } else {
                // Insert
                result = await supabase
                    .from('events')
                    .insert(eventData)
                    .select()
                    .single()
            }

            if (result.error) throw result.error

            if (!initialData) {
                setEventId(result.data.id)
                setStep(2) // Go to seat layout for new events
            } else {
                router.push('/organizer/dashboard')
                router.refresh()
            }

        } catch (error) {
            console.error(error)
            alert('Error saving event')
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
                <CardTitle>{initialData ? 'Edit Event' : 'Event Details'}</CardTitle>
                <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <form onSubmit={onEventSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" name="title" required defaultValue={initialData?.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required defaultValue={initialData?.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required defaultValue={initialData?.category}>
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
                            <Input id="totalCapacity" name="totalCapacity" type="number" required defaultValue={initialData?.total_capacity} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventDate">Date</Label>
                            <Input id="eventDate" name="eventDate" type="date" required defaultValue={initialData?.event_date} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventTime">Time</Label>
                            <Input id="eventTime" name="eventTime" type="time" required defaultValue={initialData?.event_time} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venue">Venue Name</Label>
                        <Input id="venue" name="venue" required defaultValue={initialData?.venue} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="banner">Event Banner</Label>
                        <Input id="banner" name="banner" type="file" accept="image/*" />
                        {initialData?.banner_url && (
                            <p className="text-sm text-muted-foreground mt-1">Current banner: <a href={initialData.banner_url} target="_blank" className="underline">View</a></p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Save Changes' : 'Next: Configure Seats'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventForm } from '@/components/organizer/event-form'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: organizer } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!organizer || !organizer.approved) {
        redirect('/organizer/dashboard')
    }

    // Fetch event
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('organizer_id', organizer.id)
        .single()

    if (!event) {
        redirect('/organizer/dashboard')
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl px-4">
            <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
            <EventForm organizerId={organizer.id} initialData={event} />
        </div>
    )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventForm } from '@/components/organizer/event-form'

export default async function NewEventPage() {
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

    return (
        <div className="container mx-auto py-10 max-w-4xl px-4">
            <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
            <EventForm organizerId={organizer.id} />
        </div>
    )
}

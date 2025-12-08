import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventForm } from '@/components/organizer/event-form'

export default async function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/admin/login')
    }

    // Fetch event (admin can edit any event)
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (!event) {
        redirect('/admin/events')
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <EventForm organizerId={event.organizer_id} initialData={event} />
        </div>
    )
}

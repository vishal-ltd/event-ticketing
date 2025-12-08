import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEventForm } from '@/components/organizer/create-event-form'

export default async function AdminNewEventPage() {
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

    // For admin-created events, we need an organizer ID
    // We'll check if admin has an associated organizer profile
    // If not, we'll use a system organizer or show a message
    const { data: organizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single()

    // If admin is also an organizer, use their ID
    // Otherwise, show a message that admin needs to select an organizer
    if (!organizer) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold">Create Event</h1>
                <div className="p-6 bg-muted rounded-lg">
                    <p className="text-muted-foreground">
                        To create events as an admin, you need to be registered as an organizer first.
                        Alternatively, you can approve organizer-submitted events from the Events page.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Create Event</h1>
            <CreateEventForm organizerId={organizer.id} />
        </div>
    )
}

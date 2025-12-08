import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrganizerRegisterForm } from '@/components/organizer/register-form'

export default async function OrganizerRegisterPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?next=/organizer/register')
    }

    // Check if already organizer
    const { data: organizer } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (organizer) {
        if (organizer.approved) {
            redirect('/organizer/dashboard')
        } else {
            return (
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">Registration Pending</h1>
                    <p className="text-muted-foreground">
                        Your organizer application is currently under review.
                        We will notify you once it is approved.
                    </p>
                </div>
            )
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl px-4">
            <h1 className="text-3xl font-bold mb-8">Become an Organizer</h1>
            <OrganizerRegisterForm userId={user.id} />
        </div>
    )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScannerInterface } from '@/components/staff/scanner-interface'

export default async function ScannerPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Verify organizer or admin role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'organizer' && profile.role !== 'admin')) {
        redirect('/')
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Ticket Scanner</h1>
            <p className="text-center text-muted-foreground mb-8">
                Scan QR codes or enter ticket IDs manually to verify and check in attendees.
            </p>
            <ScannerInterface />
        </div>
    )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/admin/settings-form'
import { getSystemQrCode } from '@/app/actions/admin'

export default async function AdminSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    // Fetch current setting
    const result = await getSystemQrCode()
    const currentQrUrl = result.success ? result.url : null

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">System Settings</h1>
            <SettingsForm initialQrUrl={currentQrUrl} />
        </div>
    )
}

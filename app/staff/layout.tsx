import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'
import { StaffNavLinks } from '@/components/staff/staff-nav-links'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'

export default async function StaffLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/staff-login')
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['staff', 'admin'].includes(profile.role)) {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden border-b p-4 flex items-center justify-between bg-background">
                <div className="flex items-center gap-2">
                    <MobileSidebar title="Staff Portal">
                        <div className="flex flex-col h-full justify-between">
                            <StaffNavLinks />
                            <div className="p-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium truncate max-w-[150px]">
                                        {user.email}
                                    </span>
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>
                    </MobileSidebar>
                    <h1 className="text-xl font-bold">Staff Portal</h1>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-muted/30 border-r hidden md:flex md:flex-col shrink-0 relative">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Staff Portal</h1>
                    <p className="text-sm text-muted-foreground">Ticket Scanner</p>
                </div>
                <div className="flex-1">
                    <StaffNavLinks />
                </div>
                <div className="p-4 border-t">
                    <div className="flex items-center justify-between p-2 bg-background rounded-lg border">
                        <span className="text-sm font-medium truncate max-w-[120px]">
                            {user.email}
                        </span>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}

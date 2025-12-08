import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'
import { AdminNavLinks } from '@/components/admin/admin-nav-links'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?next=/admin')
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden border-b p-4 flex items-center justify-between bg-background">
                <div className="flex items-center gap-2">
                    <MobileSidebar title="Admin Panel">
                        <div className="flex flex-col h-full justify-between">
                            <AdminNavLinks />
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
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-muted/30 border-r hidden md:block shrink-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                <AdminNavLinks />
                <div className="absolute bottom-4 left-4 right-4">
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

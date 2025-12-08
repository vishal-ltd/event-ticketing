import Link from 'next/link'
import { LayoutDashboard, Users, Calendar, IndianRupee, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminNavLinks() {
    return (
        <nav className="px-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Users
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/organizers">
                    <Users className="mr-2 h-4 w-4" />
                    Organizers
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/staff">
                    <QrCode className="mr-2 h-4 w-4" />
                    Staff
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/events">
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/orders">
                    <IndianRupee className="mr-2 h-4 w-4" />
                    Orders
                </Link>
            </Button>
        </nav>
    )
}

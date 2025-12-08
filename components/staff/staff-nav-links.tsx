'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, QrCode } from 'lucide-react'

const navItems = [
    {
        title: 'Dashboard',
        href: '/staff',
        icon: LayoutDashboard,
    },
    {
        title: 'Scanner',
        href: '/staff/scanner',
        icon: QrCode,
    },
]

export function StaffNavLinks() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}

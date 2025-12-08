'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'

interface MobileSidebarProps {
    children: React.ReactNode
    title?: string
}

export function MobileSidebar({ children, title = "Menu" }: MobileSidebarProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}

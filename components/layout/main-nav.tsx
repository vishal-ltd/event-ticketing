'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserAuthDialog } from '@/components/auth/user-auth-dialog'
import { LogoutButton } from '@/components/auth/logout-button'
import { User, Menu } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'

interface User {
    id: string
    email?: string
    user_metadata: {
        name?: string
    }
}

interface MainNavProps {
    user: User | null
    isRegularUser: boolean
}

export function MainNav({ user, isRegularUser }: MainNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="flex justify-between items-center mb-12">
            <div className="font-bold text-2xl">EventTicketing</div>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-4 items-center">
                <Button variant="ghost" asChild className="relative group">
                    <Link href="/admin/login">
                        <span className="relative z-10">Admin Portal</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </Button>
                <Button variant="ghost" asChild className="relative group">
                    <Link href="/organizer/login">
                        <span className="relative z-10">Organizer Portal</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </Button>
                <Button variant="ghost" asChild className="relative group">
                    <Link href="/auth/staff-login">
                        <span className="relative z-10">Staff Portal</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </Button>

                {user ? (
                    <>
                        <span className="text-sm text-muted-foreground ml-2">Hello, {user.user_metadata.name || 'User'}</span>
                        <Button variant="outline" asChild>
                            <Link href="/tickets">My Tickets</Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/profile">
                                <User className="h-4 w-4" />
                            </Link>
                        </Button>
                        <LogoutButton />
                    </>
                ) : (
                    <UserAuthDialog />
                )}
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" suppressHydrationWarning>
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-4 mt-8">
                            <StaggerContainer>
                                <StaggerItem>
                                    <Button variant="ghost" asChild className="w-full justify-start">
                                        <Link href="/admin/login">Admin Portal</Link>
                                    </Button>
                                </StaggerItem>
                                <StaggerItem>
                                    <Button variant="ghost" asChild className="w-full justify-start">
                                        <Link href="/organizer/login">Organizer Portal</Link>
                                    </Button>
                                </StaggerItem>
                                <StaggerItem>
                                    <Button variant="ghost" asChild className="w-full justify-start">
                                        <Link href="/auth/staff-login">Staff Portal</Link>
                                    </Button>
                                </StaggerItem>

                                {user ? (
                                    <>
                                        <StaggerItem>
                                            <div className="flex items-center gap-4 py-2">
                                                <span className="text-sm text-muted-foreground">Hello, {user.user_metadata.name || 'User'}</span>
                                            </div>
                                        </StaggerItem>
                                        <StaggerItem>
                                            <Button variant="outline" asChild className="w-full justify-start">
                                                <Link href="/tickets">My Tickets</Link>
                                            </Button>
                                        </StaggerItem>
                                        <StaggerItem>
                                            <Button variant="outline" asChild className="w-full justify-start">
                                                <Link href="/profile">
                                                    <User className="mr-2 h-4 w-4" />
                                                    Profile
                                                </Link>
                                            </Button>
                                        </StaggerItem>
                                        <StaggerItem>
                                            <div className="w-full">
                                                <LogoutButton />
                                            </div>
                                        </StaggerItem>
                                    </>
                                ) : (
                                    <StaggerItem>
                                        <div className="w-full">
                                            <UserAuthDialog />
                                        </div>
                                    </StaggerItem>
                                )}
                            </StaggerContainer>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}

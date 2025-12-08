'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Loader2, UserMinus } from 'lucide-react'
import { removeStaffRole } from '@/app/actions/staff'
import { useRouter } from 'next/navigation'

interface StaffActionsProps {
    userId: string
    userName: string
}

export function StaffActions({ userId, userName }: StaffActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleRemove() {
        if (!confirm(`Remove ${userName} from staff?`)) return

        setIsLoading(true)
        const result = await removeStaffRole(userId)

        if (result.success) {
            router.refresh()
        } else {
            alert('Failed to remove staff member: ' + result.error)
        }

        setIsLoading(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={handleRemove}
                    className="text-red-600"
                >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove from Staff
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

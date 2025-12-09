'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Loader2, Shield, ShieldAlert, User } from 'lucide-react'
import { updateUserRole } from '@/app/actions/users'

interface UserActionsProps {
    userId: string
    currentRole: string
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
    const [isLoading, setIsLoading] = useState(false)



    async function updateRole(newRole: 'user' | 'organizer' | 'admin' | 'staff') {
        setIsLoading(true)
        try {
            const result = await updateUserRole(userId, newRole)
            if (!result.success) throw new Error(result.error)

            // Router refresh is handled in the server action via revalidatePath, 
            // but we might want to refresh client state if needed.
            // The server action calls revalidatePath('/admin/users'), so the page should update.
        } catch (error: unknown) {
            console.error('Error updating role:', error)
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            alert('Failed to update role: ' + errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Note: Deleting a user is complex because of foreign key constraints (orders, events, etc.)
    // For now, we will just allow role changes. 
    // If we want to delete, we should probably use a server action with admin client to delete from auth.users too.

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userId)}>
                    Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => updateRole('user')} disabled={currentRole === 'user'}>
                    <User className="mr-2 h-4 w-4" />
                    Make User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRole('organizer')} disabled={currentRole === 'organizer'}>
                    <Shield className="mr-2 h-4 w-4" />
                    Make Organizer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRole('staff')} disabled={currentRole === 'staff'}>
                    <Shield className="mr-2 h-4 w-4" />
                    Make Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRole('admin')} disabled={currentRole === 'admin'} className="text-red-600">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Make Admin
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { updateUserToStaff, getAvailableUsers } from '@/app/actions/staff'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string | null
    created_at: string
}

export function AddStaffDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function fetchUsers() {
        setIsFetching(true)
        const result = await getAvailableUsers()
        if (result.success) {
            setUsers(result.users)
        } else {
            setError(result.error || 'Failed to fetch users')
        }
        setIsFetching(false)
    }

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

    async function handleSubmit() {
        if (!selectedUserId) return

        setIsLoading(true)
        setError(null)

        const result = await updateUserToStaff(selectedUserId)

        if (result.success) {
            setIsOpen(false)
            setSelectedUserId('')
            router.refresh()
        } else {
            setError(result.error || 'Failed to add staff member')
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Staff Member</DialogTitle>
                    <DialogDescription>
                        Select a user to promote to staff role. They will be able to scan tickets at events.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isFetching ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length > 0 ? (
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name || 'Unnamed User'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No available users to promote. Only regular users can be made staff.
                        </p>
                    )}

                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedUserId || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Staff
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

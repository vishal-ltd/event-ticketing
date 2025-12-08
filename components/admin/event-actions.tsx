'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Edit, Trash, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteEvent } from '@/app/actions/events'

interface EventActionsProps {
    eventId: string
    status: string
}

export function EventActions({ eventId, status }: EventActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function updateStatus(newStatus: string) {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('events')
                .update({ status: newStatus })
                .eq('id', eventId)

            if (error) throw error
            router.refresh()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const result = await deleteEvent(eventId)
            if (result.error) {
                throw new Error(result.error)
            }
            router.refresh()
        } catch (error) {
            console.error('Error deleting event:', error)
            alert('Failed to delete event')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex gap-2">
            {/* View Event */}
            <Button
                size="sm"
                variant="outline"
                asChild
                title="View Event"
            >
                <Link href={`/events/${eventId}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>

            {/* Edit Event */}
            <Button
                size="sm"
                variant="outline"
                asChild
                title="Edit Event"
            >
                <Link href={`/admin/events/${eventId}/edit`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>

            {/* Delete Event */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeleting}
                        title="Delete Event"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the event
                            and all associated orders, tickets, and seats.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approve/Reject for pending events */}
            {status === 'pending' && (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => updateStatus('active')}
                        disabled={isLoading}
                        title="Approve"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => updateStatus('draft')}
                        disabled={isLoading}
                        title="Reject"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                </>
            )}
        </div>
    )
}


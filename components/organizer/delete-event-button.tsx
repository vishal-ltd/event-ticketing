'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash, Loader2 } from 'lucide-react'
import { deleteEvent } from '@/app/actions/events'
import { useRouter } from 'next/navigation'
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
import { useToast } from '@/hooks/use-toast'

export function DeleteEventButton({ eventId }: { eventId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const result = await deleteEvent(eventId)
            if (result.error) {
                throw new Error(result.error)
            }
            toast({
                title: "Event deleted",
                description: "The event has been successfully deleted.",
            })
            // Refresh immediately to update the UI
            router.refresh()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred'
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event
                        and remove it from our servers.
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
    )
}

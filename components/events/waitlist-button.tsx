'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Bell } from 'lucide-react'
import { joinWaitlist, getWaitlistStatus } from '@/app/actions/waitlist'
import { useToast } from '@/hooks/use-toast'

interface WaitlistButtonProps {
    eventId: string
    isSoldOut?: boolean
}

export function WaitlistButton({ eventId, isSoldOut = false }: WaitlistButtonProps) {
    const [status, setStatus] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        async function checkStatus() {
            const { status } = await getWaitlistStatus(eventId)
            setStatus(status)
            setIsChecking(false)
        }
        checkStatus()
    }, [eventId])

    async function handleJoin() {
        setIsLoading(true)
        try {
            const result = await joinWaitlist(eventId)
            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                })
            } else {
                setStatus('pending')
                toast({
                    title: "Success",
                    description: "You've been added to the waitlist!",
                })
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isChecking) {
        return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
    }

    if (status) {
        return (
            <Button variant="outline" className="w-full" disabled>
                <Bell className="mr-2 h-4 w-4" />
                {status === 'pending' ? 'On Waitlist' : 'Waitlist Joined'}
            </Button>
        )
    }

    // Only show if sold out or explicitly requested
    if (!isSoldOut) return null

    return (
        <Button onClick={handleJoin} className="w-full" disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Bell className="mr-2 h-4 w-4" />
            )}
            Join Waitlist
        </Button>
    )
}

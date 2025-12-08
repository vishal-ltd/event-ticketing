'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrganizerActionsProps {
    organizerId: string
    approved: boolean
}

export function OrganizerActions({ organizerId, approved }: OrganizerActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function updateStatus(newStatus: boolean) {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('organizers')
                .update({ approved: newStatus })
                .eq('id', organizerId)

            if (error) throw error
            router.refresh()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            {!approved && (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => updateStatus(true)}
                    disabled={isLoading}
                    title="Approve"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
            )}
            {approved && (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={() => updateStatus(false)}
                    disabled={isLoading}
                    title="Deactivate"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </Button>
            )}
        </div>
    )
}

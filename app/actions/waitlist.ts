'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinWaitlist(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to join the waitlist' }
    }

    try {
        const { error } = await supabase
            .from('waitlists')
            .insert({
                event_id: eventId,
                user_id: user.id,
                status: 'pending'
            })

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return { error: 'You are already on the waitlist' }
            }
            throw error
        }

        revalidatePath(`/events/${eventId}`)
        return { success: true }
    } catch (error) {
        console.error('Error joining waitlist:', error)
        return { error: 'Failed to join waitlist' }
    }
}

export async function getWaitlistStatus(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { status: null }

    const { data } = await supabase
        .from('waitlists')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

    return { status: data?.status || null }
}

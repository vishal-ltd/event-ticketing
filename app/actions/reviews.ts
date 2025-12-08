'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(eventId: string, rating: number, comment: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Verify user attended the event (has at least one ticket)
    // We check via orders -> tickets relationship
    // But simplified: check if they have an order for this event
    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'approved') // Only approved orders
        .limit(1)
        .single()

    if (!order) {
        return { error: 'You can only review events you have attended.' }
    }

    try {
        const { error } = await supabase
            .from('reviews')
            .insert({
                event_id: eventId,
                user_id: user.id,
                rating,
                comment
            })

        if (error) throw error

        revalidatePath(`/events/${eventId}`)
        return { success: true }
    } catch (error) {
        console.error('Error submitting review:', error)
        return { error: 'Failed to submit review' }
    }
}

export async function getReviews(eventId: string) {
    const supabase = await createClient()

    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            user_profiles (
                full_name,
                email
            )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

    return reviews || []
}

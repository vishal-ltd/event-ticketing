'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { submitReview } from '@/app/actions/reviews'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function ReviewForm({ eventId }: { eventId: string }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (rating === 0) {
            toast({
                variant: 'destructive',
                title: "Rating required",
                description: "Please select a star rating",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitReview(eventId, rating, comment)
            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                })
            } else {
                toast({
                    title: "Success",
                    description: "Thank you for your review!",
                })
                setRating(0)
                setComment('')
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold">Write a Review</h3>

            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={cn(
                                "h-6 w-6",
                                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )}
                        />
                    </button>
                ))}
            </div>

            <Textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            />

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    'Submit Review'
                )}
            </Button>
        </form>
    )
}

import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { getReviews } from '@/app/actions/reviews'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export async function ReviewList({ eventId }: { eventId: string }) {
    const reviews = await getReviews(eventId)

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                No reviews yet. Be the first to share your experience!
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                const profile = review.user_profiles as any
                const profileName = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name
                const displayName = profileName || 'Anonymous'
                const displayInitial = displayName.charAt(0)

                return (
                    <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {displayInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "h-4 w-4",
                                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed pl-10">
                            {review.comment}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

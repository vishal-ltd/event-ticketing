import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'

export async function Wishlist({ userId }: { userId: string }) {
    const supabase = await createClient()

    const { data: wishlist } = await supabase
        .from('wishlists')
        .select(`
      *,
      events (
        id,
        title,
        event_date,
        event_time,
        venue,
        banner_url,
        category
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (!wishlist?.length) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    Your wishlist is empty. <Link href="/" className="text-primary hover:underline">Browse events</Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                    {item.events.banner_url && (
                        <div className="aspect-video w-full overflow-hidden">
                            <img
                                src={item.events.banner_url}
                                alt={item.events.title}
                                className="h-full w-full object-cover transition-all hover:scale-105"
                            />
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="line-clamp-1">{item.events.title}</CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(item.events.event_date), 'PPP')}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4" />
                            {item.events.venue}
                        </div>
                        <Button asChild className="w-full">
                            <Link href={`/events/${item.events.id}`}>
                                View Details
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

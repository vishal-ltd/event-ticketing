import { createClient } from '@/lib/supabase/server'
import { EventGrid } from '@/components/events/event-grid'
import { EventSearch } from '@/components/events/event-search'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MainNav } from '@/components/layout/main-nav'
import { SlideUp, FadeIn } from '@/components/ui/motion'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { q, category: rawCategory, page: rawPage } = await searchParams

  const query = q || ''
  const category = rawCategory || 'all'
  const page = Number(rawPage) || 1
  const pageSize = 9

  let isRegularUser = false
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isRegularUser = profile?.role === 'user'
  }

  let dbQuery = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('event_date', { ascending: true })

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }

  if (category !== 'all') {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data: events, count } = await dbQuery.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <MainNav user={user} isRegularUser={isRegularUser} />

      <section className="mb-12 text-center">
        <SlideUp>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Find Your Next Experience
          </h1>
        </SlideUp>
        <SlideUp delay={0.1}>
          <p className="text-xl text-muted-foreground mb-8">
            Discover concerts, theatre, sports, and more.
          </p>
        </SlideUp>
        <FadeIn delay={0.2}>
          <EventSearch />
        </FadeIn>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
          <div className="flex gap-2">
            {['all', 'concert', 'theatre', 'comedy', 'sports'].map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={`/?category=${cat}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <EventGrid events={events || []} />

        {/* Simple Pagination */}
        <div className="flex justify-center mt-8 gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/?page=${page - 1}&category=${category}&q=${query}`}>
                Previous
              </Link>
            </Button>
          )}
          {count && count > page * pageSize && (
            <Button variant="outline" asChild>
              <Link href={`/?page=${page + 1}&category=${category}&q=${query}`}>
                Next
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

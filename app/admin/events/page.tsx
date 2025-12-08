import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventActions } from '@/components/admin/event-actions'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminEventsPage() {
    const supabase = await createClient()

    const { data: events } = await supabase
        .from('events')
        .select(`
            *,
            organizer:organizers(org_name)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Event Management</h1>
                <Button asChild>
                    <Link href="/admin/events/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event Name</TableHead>
                            <TableHead>Organizer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events?.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.title}</TableCell>
                                <TableCell>{event.organizer?.org_name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        event.status === 'active' ? 'default' :
                                            event.status === 'cancelled' ? 'destructive' :
                                                event.status === 'pending' ? 'secondary' : 'outline'
                                    }>
                                        {event.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(event.event_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <EventActions eventId={event.id} status={event.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

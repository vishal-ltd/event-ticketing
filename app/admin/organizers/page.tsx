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
import { OrganizerActions } from '@/components/admin/organizer-actions'
import { CreateOrganizerDialog } from '@/components/admin/create-organizer-dialog'

export default async function AdminOrganizersPage() {
    const supabase = await createClient()

    // Fetch all users with role 'organizer'
    const { data: organizerUsers } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'organizer')

    // Fetch existing organizer profiles
    const { data: organizerProfiles } = await supabase
        .from('organizers')
        .select('*')

    // Merge data
    const mergedOrganizers = organizerUsers?.map(user => {
        const profile = organizerProfiles?.find(p => p.user_id === user.id)
        return {
            id: profile?.id || 'pending-' + user.id, // Use profile ID or temp ID
            user_id: user.id,
            user_name: user.name,
            user_email: user.email, // Note: user_profiles might not have email, check schema
            org_name: profile?.org_name || 'Profile Not Setup',
            approved: profile?.approved || false,
            created_at: profile?.created_at || user.created_at,
            has_profile: !!profile
        }
    }) || []

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Organizer Management</h1>
                <CreateOrganizerDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>User Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mergedOrganizers.map((org) => (
                            <TableRow key={org.id}>
                                <TableCell className="font-medium">
                                    {org.org_name}
                                    {!org.has_profile && <span className="ml-2 text-xs text-muted-foreground">(Incomplete)</span>}
                                </TableCell>
                                <TableCell>{org.user_name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        org.approved ? 'default' : 'secondary'
                                    }>
                                        {org.approved ? 'Approved' : 'Pending'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(org.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {org.has_profile && (
                                        <OrganizerActions organizerId={org.id} approved={org.approved} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

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
import { QrCode } from 'lucide-react'
import { AddStaffDialog } from '@/components/staff/add-staff-dialog'
import { StaffActions } from '@/components/staff/staff-actions'

export default async function AdminStaffPage() {
    const supabase = await createClient()

    const { data: staffUsers } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-muted-foreground">
                        Manage staff members who can scan tickets at events.
                    </p>
                </div>
                <AddStaffDialog />
            </div>

            {staffUsers && staffUsers.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Added</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.full_name || user.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                            Staff
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <StaffActions
                                            userId={user.id}
                                            userName={user.full_name || user.name || 'Staff member'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-12 rounded-lg border border-dashed">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Staff Members</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                        Staff members can scan tickets at events. Click the button above to add staff members.
                    </p>
                </div>
            )}
        </div>
    )
}

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

import { UserActions } from '@/components/admin/user-actions'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">User Management</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        user.role === 'admin' ? 'default' :
                                            user.role === 'organizer' ? 'secondary' :
                                                user.role === 'staff' ? 'outline' : 'outline'
                                    } className={user.role === 'staff' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <UserActions userId={user.id} currentRole={user.role} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

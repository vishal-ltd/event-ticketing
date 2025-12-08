import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { TicketList } from '@/components/profile/ticket-list'
import { Wishlist } from '@/components/profile/wishlist'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                    <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileForm profile={profile} />
                </TabsContent>

                <TabsContent value="tickets">
                    <TicketList userId={user.id} />
                </TabsContent>

                <TabsContent value="wishlist">
                    <Wishlist userId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

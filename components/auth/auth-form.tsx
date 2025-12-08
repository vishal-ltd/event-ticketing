'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { getUserRoleAndRedirect } from '@/lib/auth/get-redirect'

export function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>, type: 'login' | 'register') {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        try {
            if (type === 'register') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                        },
                    },
                })
                if (error) throw error
                // If email confirmation is enabled, we should tell the user.
                // For now, assuming auto-confirm or dev mode, or just redirecting to check email.
                // But better to show a message.
                // I'll just redirect to login tab or show success message.
                alert('Registration successful! Please check your email to confirm your account.')
                if (onSuccess) onSuccess()
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                // Get user role and redirect to appropriate portal
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { redirectPath } = await getUserRoleAndRedirect(supabase, user.id)

                    // If redirecting to a portal, go there
                    if (redirectPath !== '/') {
                        router.push(redirectPath)
                        return
                    }
                }

                router.refresh()
                if (onSuccess) onSuccess()
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An error occurred'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Tabs defaultValue="login" className="w-full" id="auth-tabs">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-600">USER PORTAL</CardTitle>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={(e) => onSubmit(e, 'login')}>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required className="transition-all focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required className="transition-all focus:ring-2 focus:ring-primary/20" />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full transition-transform active:scale-95" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>
                            Create a new account to start booking tickets
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={(e) => onSubmit(e, 'register')}>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" required className="transition-all focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="register-email">Email</Label>
                                <Input id="register-email" name="email" type="email" required className="transition-all focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="register-password">Password</Label>
                                <Input id="register-password" name="password" type="password" required className="transition-all focus:ring-2 focus:ring-primary/20" />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full transition-transform active:scale-95" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

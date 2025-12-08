import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to your account or create a new one
                    </p>
                </div>
                <AuthForm />
            </div>
        </div>
    )
}

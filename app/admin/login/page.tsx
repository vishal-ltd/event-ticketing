import { AdminLoginForm } from '@/components/auth/admin-login-form'
import { SlideUp } from '@/components/ui/motion'

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
            <SlideUp className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">
                        Admin Access
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Restricted area. Authorized personnel only.
                    </p>
                </div>
                <AdminLoginForm />
            </SlideUp>
        </div>
    )
}

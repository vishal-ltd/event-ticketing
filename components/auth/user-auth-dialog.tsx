'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AuthForm } from "./auth-form"
import { useState } from "react"

export function UserAuthDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Sign In / Sign Up</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome</DialogTitle>
                    <DialogDescription>
                        Sign in to your account or create a new one to continue.
                    </DialogDescription>
                </DialogHeader>
                <AuthForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

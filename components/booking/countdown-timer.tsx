'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

export function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
    const [timeLeft, setTimeLeft] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime()
            const distance = new Date(expiresAt).getTime() - now

            if (distance < 0) {
                clearInterval(interval)
                setTimeLeft(0)
                alert('Session expired. Please select seats again.')
                router.back()
            } else {
                setTimeLeft(distance)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [expiresAt, router])

    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    return (
        <div className="flex items-center gap-2 text-lg font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-md">
            <Clock className="h-5 w-5" />
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
    )
}

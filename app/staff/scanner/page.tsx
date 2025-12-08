import { ScannerInterface } from '@/components/staff/scanner-interface'
import { FadeIn } from '@/components/ui/motion'

export default function ScannerPage() {
    return (
        <FadeIn>
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Ticket Scanner</h1>
                <ScannerInterface />
            </div>
        </FadeIn>
    )
}


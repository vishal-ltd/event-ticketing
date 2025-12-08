'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function EventSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)
        if (query) {
            params.set('q', query)
        } else {
            params.delete('q')
        }
        router.push(`/?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-sm mx-auto items-center space-x-2">
            <Input
                type="search"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
            </Button>
        </form>
    )
}

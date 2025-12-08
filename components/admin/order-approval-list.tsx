'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { approveOrder, rejectOrder } from '@/app/actions/orders'
import { format } from 'date-fns'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X, Eye } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
    id: string
    user_id: string
    event_id: string
    total_amount: number
    payment_status: string
    payment_screenshot_url?: string
    created_at: string
    events?: { title: string } | null
    user_profiles?: { full_name: string | null; email: string | null } | null
}

export function OrderApprovalList({ orders }: { orders: Order[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null)

    const router = useRouter()

    async function handleApprove(orderId: string) {
        setProcessingId(orderId)
        const result = await approveOrder(orderId)
        setProcessingId(null)

        if (result.success) {
            alert('Order Approved: The order has been approved and tickets generated.')
            router.refresh()
        } else {
            alert('Error: ' + result.error)
        }
    }

    async function handleReject(orderId: string) {
        if (!confirm('Are you sure you want to reject this order? This will permanently delete the order.')) return

        setProcessingId(orderId)
        const result = await rejectOrder(orderId)
        setProcessingId(null)

        if (result.success) {
            alert('Order Rejected: The order has been deleted.')
            router.refresh()
        } else {
            alert('Error: ' + result.error)
        }
    }

    const pendingOrders = orders.filter(o => o.payment_status === 'pending' || o.payment_status === 'pending_approval')
    const approvedOrders = orders.filter(o => o.payment_status === 'completed')
    const rejectedOrders = orders.filter(o => o.payment_status === 'rejected' || o.payment_status === 'failed' || o.payment_status === 'cancelled')

    const OrderCard = ({ order, showActions = false }: { order: Order, showActions?: boolean }) => (
        <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                    Order #{order.id.slice(0, 8)}
                </CardTitle>
                <Badge variant="outline" className={`
                    ${order.payment_status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    ${order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                    ${order.payment_status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                `}>
                    {order.payment_status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-sm">
                        <div className="font-semibold">{order.events?.title}</div>
                        <div className="text-muted-foreground">
                            Amount: ₹{order.total_amount.toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">
                            User: {order.user_profiles?.full_name || order.user_id}
                        </div>
                        <div className="text-muted-foreground">
                            Date: {format(new Date(order.created_at), 'PPP p')}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        {order.payment_screenshot_url && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Proof
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Payment Proof</DialogTitle>
                                    </DialogHeader>
                                    <div className="relative aspect-[9/16] w-full max-h-[80vh]">
                                        <Image
                                            src={order.payment_screenshot_url}
                                            alt="Payment Proof"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}

                        {showActions && (
                            <>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(order.id)}
                                    disabled={!!processingId}
                                >
                                    {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(order.id)}
                                    disabled={!!processingId}
                                >
                                    {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedOrders.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingOrders.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No pending orders found.</div>
                ) : (
                    pendingOrders.map(order => <OrderCard key={order.id} order={order} showActions={true} />)
                )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
                {approvedOrders.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No approved orders found.</div>
                ) : (
                    approvedOrders.map(order => <OrderCard key={order.id} order={order} showActions={false} />)
                )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedOrders.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No rejected orders found.
                        <p className="text-xs mt-2">(Note: Rejected orders are currently deleted from the system)</p>
                    </div>
                ) : (
                    rejectedOrders.map(order => <OrderCard key={order.id} order={order} showActions={false} />)
                )}
            </TabsContent>
        </Tabs>
    )
}

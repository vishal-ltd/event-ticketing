'use server'

import { resend } from '@/lib/resend'

export async function sendTicketEmail({
    to,
    eventName,
    ticketId,
    amount,
    date,
    venue
}: {
    to: string
    eventName: string
    ticketId: string
    amount: string
    date: string
    venue: string
}) {
    // Check if API key is present (Resend constructor doesn't throw on undefined, but send calls need it)
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Simulating email sending.')
        // In simulation mode, we just return success
        return { success: true, simulated: true }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Ticketing App <onboarding@resend.dev>',
            to: [to],
            // Use 'delivered@resend.dev' for testing if 'to' is not verified in free plan
            // But we'll try sending to the actual user. Resend free tier only allows sending to verified email.
            // For now, we assume user might be the verified one or they have a domain.
            subject: `Your Ticket for ${eventName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Ticket Confirmed!</h1>
                    <p>Hi there,</p>
                    <p>Your payment has been approved and your ticket is ready.</p>
                    <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; background-color: #f9f9f9; margin: 20px 0;">
                        <h2 style="margin-top: 0;">${eventName}</h2>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Date:</strong> ${date}</li>
                            <li><strong>Venue:</strong> ${venue}</li>
                            <li><strong>Ticket ID:</strong> ${ticketId}</li>
                            <li><strong>Amount Paid:</strong> ${amount}</li>
                        </ul>
                    </div>
                    <p>Please show this email or download your ticket from the website at the entrance.</p>
                </div>
            `
        })

        if (error) {
            console.error('Resend error:', error)
            return { error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email sending failed:', error)
        return { error: 'Failed to send email' }
    }
}

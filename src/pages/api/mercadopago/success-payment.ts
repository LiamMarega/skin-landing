import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { getConfirmationEmailHTML, getEmailSubject } from '../../../lib/email-templates/confirmation-email';

// Initialize Resend
const resend = new Resend(import.meta.env.RESEND_API_KEY);

// MercadoPago Access Token
const MP_ACCESS_TOKEN = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
const FROM_EMAIL = import.meta.env.RESEND_FROM_EMAIL || 'Diseñá Como Yo <noreply@resend.dev>';

interface MercadoPagoPayment {
    id: number;
    status: string;
    status_detail: string;
    transaction_amount: number;
    currency_id: string;
    description: string;
    payer: {
        email: string;
        first_name?: string;
        last_name?: string;
    };
    date_approved: string;
    external_reference?: string;
    metadata?: Record<string, any>;
}

/**
 * Determine plan type based on payment amount
 * Basic: USD 300 | Pro: USD 600
 */
function getPlanType(amount: number): 'basic' | 'pro' {
    // Using a threshold to handle slight variations in currency conversion
    if (amount >= 500) return 'pro';
    return 'basic';
}

/**
 * Fetch payment details from MercadoPago API
 */
async function getPaymentDetails(paymentId: string): Promise<MercadoPagoPayment | null> {
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch payment details:', response.status, response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching payment details:', error);
        return null;
    }
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(payment: MercadoPagoPayment) {
    const planType = getPlanType(payment.transaction_amount);

    const paymentData = {
        customerEmail: payment.payer.email,
        customerName: payment.payer.first_name
            ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim()
            : undefined,
        paymentId: payment.id.toString(),
        amount: payment.transaction_amount,
        planType,
        paymentDate: new Date(payment.date_approved).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
    };

    const htmlContent = getConfirmationEmailHTML(paymentData);
    const subject = getEmailSubject(planType);

    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [payment.payer.email],
        subject: subject,
        html: htmlContent,
    });

    if (error) {
        console.error('Failed to send email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log(`✅ Email sent successfully to ${payment.payer.email}. Email ID: ${data?.id}`);
    return data;
}

/**
 * POST handler for MercadoPago webhook
 * 
 * MercadoPago sends notifications in this format:
 * {
 *   "action": "payment.created" | "payment.updated",
 *   "api_version": "v1",
 *   "data": { "id": "123456789" },
 *   "date_created": "2024-01-01T00:00:00.000-03:00",
 *   "id": "unique-notification-id",
 *   "live_mode": true,
 *   "type": "payment",
 *   "user_id": "123456"
 * }
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        console.log('📥 Webhook received:', JSON.stringify(body, null, 2));

        // Validate webhook type
        if (body.type !== 'payment') {
            console.log('⏭️ Ignoring non-payment notification:', body.type);
            return new Response(JSON.stringify({ status: 'ignored', reason: 'Not a payment notification' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get payment ID from webhook
        const paymentId = body.data?.id;
        if (!paymentId) {
            console.error('❌ No payment ID in webhook');
            return new Response(JSON.stringify({ error: 'Missing payment ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Fetch full payment details from MercadoPago
        const payment = await getPaymentDetails(paymentId);
        if (!payment) {
            console.error('❌ Could not fetch payment details for ID:', paymentId);
            return new Response(JSON.stringify({ error: 'Could not fetch payment details' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('💰 Payment details:', {
            id: payment.id,
            status: payment.status,
            amount: payment.transaction_amount,
            email: payment.payer.email,
        });

        // Only process approved payments
        if (payment.status !== 'approved') {
            console.log(`⏭️ Payment ${paymentId} is not approved (status: ${payment.status}). Skipping email.`);
            return new Response(JSON.stringify({
                status: 'skipped',
                reason: `Payment status is ${payment.status}`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Send confirmation email
        const emailResult = await sendConfirmationEmail(payment);

        return new Response(JSON.stringify({
            status: 'success',
            message: 'Email sent successfully',
            emailId: emailResult?.id,
            paymentId: payment.id,
            planType: getPlanType(payment.transaction_amount),
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

// Handle GET requests (useful for testing if endpoint is accessible)
export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({
        status: 'ok',
        message: 'MercadoPago webhook endpoint is active. Use POST to send webhook notifications.',
        endpoint: '/api/mercadopago/webhook'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

// Disable prerendering for this API route
export const prerender = false;

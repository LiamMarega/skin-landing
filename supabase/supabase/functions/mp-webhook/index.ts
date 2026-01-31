import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map MercadoPago payment status to our order status
function mapPaymentStatus(mpStatus: string): string {
    switch (mpStatus) {
        case 'approved':
            return 'approved';
        case 'rejected':
        case 'cancelled':
            return 'rejected';
        case 'refunded':
            return 'refunded';
        default:
            return 'pending';
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Parse the webhook payload
        const body = await req.json();
        console.log('Webhook received:', JSON.stringify(body));

        // MercadoPago sends different notification types
        // We only care about payment notifications
        const { type, data, topic } = body;

        // Handle both old (topic) and new (type) notification formats
        const notificationType = type || topic;

        if (notificationType !== 'payment') {
            console.log('Ignoring non-payment notification:', notificationType);
            return new Response(
                JSON.stringify({ message: 'Notification type not handled' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        const paymentId = data?.id;
        if (!paymentId) {
            console.error('No payment ID in notification');
            return new Response(
                JSON.stringify({ error: 'No payment ID' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        // Fetch payment details from MercadoPago API
        const mpAccessToken = Deno.env.get('DEVELOPER_MP_ACCESS_TOKEN');
        const paymentResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${mpAccessToken}`
                }
            }
        );

        if (!paymentResponse.ok) {
            console.error('Failed to fetch payment from MP:', paymentResponse.status);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch payment details' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }

        const payment = await paymentResponse.json();
        console.log('Payment details:', JSON.stringify({
            id: payment.id,
            status: payment.status,
            external_reference: payment.external_reference,
            transaction_amount: payment.transaction_amount
        }));

        const externalRef = payment.external_reference;
        if (!externalRef) {
            console.error('No external_reference in payment');
            return new Response(
                JSON.stringify({ error: 'No external reference' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Update order status in database
        const newStatus = mapPaymentStatus(payment.status);
        const { data: order, error: dbError } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                payment_id: String(paymentId),
                updated_at: new Date().toISOString()
            })
            .eq('external_ref', externalRef)
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return new Response(
                JSON.stringify({ error: 'Failed to update order' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }

        console.log('Order updated:', order.id, 'status:', newStatus);

        return new Response(
            JSON.stringify({
                success: true,
                order_id: order.id,
                status: newStatus
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
})

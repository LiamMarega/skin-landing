import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Plan prices in ARS
const PLAN_PRICES: Record<string, number> = {
  basic: 300000,
  pro: 600000
};

// Marketplace fee percentage (20%)
const MARKETPLACE_FEE_PERCENT = 0.20;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan_type, email } = await req.json();

    // Validate inputs
    if (!plan_type || !email) {
      return new Response(
        JSON.stringify({ error: 'plan_type and email are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!PLAN_PRICES[plan_type]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan_type. Must be "basic" or "pro"' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service role for DB writes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate pricing
    const unit_price = PLAN_PRICES[plan_type];
    const marketplace_fee = Math.round(unit_price * MARKETPLACE_FEE_PERCENT);

    // Generate external reference for this order
    const external_ref = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create order in database first
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        external_ref,
        customer_email: email,
        plan_type,
        amount: unit_price,
        status: 'pending'
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Initialize MercadoPago client with access token
    const client = new MercadoPagoConfig({
      accessToken: Deno.env.get('DEVELOPER_MP_ACCESS_TOKEN') || ''
    });

    const preference = new Preference(client);

    // Get the Supabase project URL for webhook
    const webhookUrl = `${supabaseUrl}/functions/v1/mp-webhook`;

    // Check if marketplace mode is enabled (collector_id is set)
    const collectorId = Deno.env.get('MP_COLLECTOR_ID');

    // Build the base preference body
    const preferenceBody: Record<string, unknown> = {
      items: [{
        id: order.id,
        title: `Mentoría Diseño - Plan ${plan_type.toUpperCase()}`,
        description: plan_type === 'pro'
          ? 'Plan Pro: Todo el contenido + 2 llamadas 1:1 + Revisión de oferta'
          : 'Plan Básico: 4 clases en vivo + 4 grabadas + Sistema de diseño',
        quantity: 1,
        unit_price: unit_price,
        currency_id: 'ARS'
      }],

      // External reference to link payment with our order
      external_reference: external_ref,

      // Webhook for payment notifications
      notification_url: webhookUrl,

      // Redirect URLs after payment
      back_urls: {
        success: "https://www.liammarega.com/success",
        failure: "https://www.liammarega.com/",
        pending: "https://www.liammarega.com/"
      },
      auto_return: "approved",

      // Binary mode: only approved or rejected, no pending
      binary_mode: true,

      // Payer information
      payer: {
        email: email
      },

      // Expiration: 24 hours from now
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Only add marketplace fields if collector_id is configured
    // This enables split payments in marketplace mode
    if (collectorId) {
      preferenceBody.collector_id = parseInt(collectorId);
      preferenceBody.marketplace_fee = marketplace_fee;
    }

    // Create MercadoPago preference
    const result = await preference.create({ body: preferenceBody });

    console.log('Preference created:', result.id, 'for order:', order.id);

    return new Response(
      JSON.stringify({
        init_point: result.init_point,
        sandbox_init_point: result.init_point,
        // sandbox_init_point: result.sandbox_init_point,
        preference_id: result.id,
        order_id: order.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error creating preference:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
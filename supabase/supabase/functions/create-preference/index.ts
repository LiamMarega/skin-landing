import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Preference } from 'npm:mercadopago';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Plan prices in ARS
const PLAN_PRICES: Record<string, number> = {
  basic: 300,
  pro: 600
};

// Marketplace fee percentage (20% goes to developer/marketplace owner)
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

    // Get the connected seller's access token from the database
    // For now, we get the first (and likely only) connected seller
    // In a multi-seller scenario, you'd pass seller_id in the request
    const { data: seller, error: sellerError } = await supabase
      .from('connected_sellers')
      .select('access_token, mp_user_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sellerError || !seller) {
      console.error('No connected seller found:', sellerError);
      return new Response(
        JSON.stringify({ error: 'No hay vendedor conectado. El vendedor debe autorizar la aplicación primero.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Using seller access token for mp_user_id:', seller.mp_user_id);

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

    // Initialize MercadoPago client with SELLER's access token
    // This is the key for marketplace: we use the seller's token to create the preference
    // so the payment goes to the seller's account, and we take our fee via marketplace_fee
    const client = new MercadoPagoConfig({
      accessToken: seller.access_token
    });

    const preference = new Preference(client);

    // Get the Supabase project URL for webhook
    const webhookUrl = `${supabaseUrl}/functions/v1/mp-webhook`;

    // Build the preference body with marketplace fee
    const preferenceBody: Record<string, unknown> = {
      items: [{
        id: order.id,
        title: `Mentoría Diseño - Plan ${plan_type.toUpperCase()}`,
        description: plan_type === 'pro'
          ? 'Plan Pro: Todo el contenido + 2 llamadas 1:1 + Revisión de oferta'
          : 'Plan Básico: 4 clases en vivo + 4 grabadas + Sistema de diseño',
        quantity: 1,
        unit_price: unit_price,
        currency_id: 'USD'
      }],

      // Marketplace fee - 20% goes to the developer (you!)
      // This is automatically transferred to your MP account
      marketplace_fee: marketplace_fee,

      // External reference to link payment with our order
      external_reference: external_ref,

      // Webhook for payment notifications
      notification_url: webhookUrl,

      // Redirect URLs after payment
      back_urls: {
        success: "https://www.liammarega.com/success",
        failure: "https://www.liammarega.com/failure",
        pending: "https://www.liammarega.com/failure"
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

    // Create MercadoPago preference
    const result = await preference.create({ body: preferenceBody });

    console.log('Preference created:', result.id, 'for order:', order.id, 'seller:', seller.mp_user_id);

    return new Response(
      JSON.stringify({
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
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
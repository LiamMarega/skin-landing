import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, OAuth } from 'npm:mercadopago';

// Obtener credenciales desde variables de entorno
const MP_ACCESS_TOKEN = Deno.env.get('DEVELOPER_MP_ACCESS_TOKEN') || '';
const MP_CLIENT_ID = Deno.env.get('MP_CLIENT_ID') || '';
const MP_CLIENT_SECRET = Deno.env.get('MP_CLIENT_SECRET') || '';
const REDIRECT_URI = Deno.env.get('MP_REDIRECT_URI') || 'https://gljypypgwkihblvbeftd.supabase.co/functions/v1/mp-oauth-callback';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!MP_ACCESS_TOKEN || !MP_CLIENT_ID || !MP_CLIENT_SECRET) {
      throw new Error("Faltan configurar las variables de entorno de MercadoPago");
    }

    // Leemos el código TG que enviaremos desde Postman
    const { code } = await req.json();

    if (!code) throw new Error("Debes enviar el código TG en el body");

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const oauth = new OAuth(client);

    // Intercambiamos el código por los tokens reales
    const credentials = await oauth.create({
      body: {
        client_id: MP_CLIENT_ID,
        client_secret: MP_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      },
    });

    return new Response(
      JSON.stringify(credentials),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
})
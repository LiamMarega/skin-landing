import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, OAuth } from 'npm:mercadopago';

// Obtener credenciales desde variables de entorno
const MP_ACCESS_TOKEN = Deno.env.get('DEVELOPER_MP_ACCESS_TOKEN') || '';
const MP_CLIENT_ID = Deno.env.get('MP_CLIENT_ID') || '';
const REDIRECT_URI = Deno.env.get('MP_REDIRECT_URI') || 'https://gljypypgwkihblvbeftd.supabase.co/functions/v1/mp-oauth-callback';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS para Postman y Navegadores
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!MP_ACCESS_TOKEN || !MP_CLIENT_ID) {
      throw new Error("Faltan configurar las variables de entorno MP_ACCESS_TOKEN o MP_CLIENT_ID");
    }

    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const oauth = new OAuth(client);

    // Generamos la URL de autorización
    const authUrl = oauth.getAuthorizationURL({
      options: {
        client_id: MP_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
      },
    });

    return new Response(
      JSON.stringify({
        url: authUrl,
        instrucciones: "Copia la URL, ábrela en incógnito logueado como VENDEDOR, y al final obtendrás el código TG en la barra de direcciones."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
})
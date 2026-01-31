import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Your Marketplace credentials (from env)
const MP_CLIENT_ID = Deno.env.get('MP_CLIENT_ID')!;
const MP_CLIENT_SECRET = Deno.env.get('MP_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('MP_REDIRECT_URI') || 'https://gljypypgwkihblvbeftd.supabase.co/functions/v1/mp-oauth-callback';
const FRONTEND_SUCCESS_URL = Deno.env.get('FRONTEND_SUCCESS_URL') || 'https://www.liammarega.com/?connected=true';
const FRONTEND_ERROR_URL = Deno.env.get('FRONTEND_ERROR_URL') || 'https://www.liammarega.com/?error=oauth_failed';

serve(async (req) => {
    // This is a GET request callback from MercadoPago OAuth
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // If error from MP, redirect to frontend with error
    if (error) {
        console.error('OAuth error from MercadoPago:', error);
        return Response.redirect(`${FRONTEND_ERROR_URL}&mp_error=${error}`, 302);
    }

    // Code is required
    if (!code) {
        console.error('No authorization code received');
        return Response.redirect(`${FRONTEND_ERROR_URL}&mp_error=no_code`, 302);
    }

    try {
        console.log('Received OAuth code:', code.substring(0, 20) + '...');

        // Exchange code for tokens using MercadoPago OAuth API
        const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: MP_CLIENT_ID,
                client_secret: MP_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return Response.redirect(`${FRONTEND_ERROR_URL}&mp_error=token_exchange_failed`, 302);
        }

        const tokens = await tokenResponse.json();
        console.log('Tokens received for user:', tokens.user_id);

        /*
          tokens structure:
          {
            access_token: "APP_USR-xxx",
            token_type: "Bearer",
            expires_in: 15552000,
            scope: "offline_access read write",
            user_id: 123456789,
            refresh_token: "TG-xxx",
            public_key: "APP_USR-xxx"
          }
        */

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Upsert the seller (update if exists, insert if new)
        const { data: seller, error: dbError } = await supabase
            .from('connected_sellers')
            .upsert({
                mp_user_id: String(tokens.user_id),
                mp_public_key: tokens.public_key,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_type: tokens.token_type || 'Bearer',
                expires_in: tokens.expires_in,
                scope: tokens.scope,
                token_issued_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'mp_user_id'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return Response.redirect(`${FRONTEND_ERROR_URL}&mp_error=db_error`, 302);
        }

        console.log('Seller connected successfully:', seller?.mp_user_id);

        // Redirect to frontend with success
        return Response.redirect(`${FRONTEND_SUCCESS_URL}&mp_user_id=${tokens.user_id}`, 302);

    } catch (err) {
        console.error('OAuth callback error:', err);
        return Response.redirect(`${FRONTEND_ERROR_URL}&mp_error=internal_error`, 302);
    }
})

-- Migration: Create orders table for MercadoPago payment tracking
-- Project: Skin Labs Pro Landing Page
-- Date: 2026-01-30

-- Orders table for tracking MercadoPago payments
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro')),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for webhook lookups by external_ref
CREATE INDEX idx_orders_external_ref ON public.orders(external_ref);

-- Index for querying by status
CREATE INDEX idx_orders_status ON public.orders(status);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for Edge Functions using service_role key)
CREATE POLICY "Service role full access" ON public.orders
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

-- Anon role cannot access orders directly (only through Edge Functions)
-- No policy for anon = no access

COMMENT ON TABLE public.orders IS 'Tracks payment intents and statuses for MercadoPago Checkout Pro';
COMMENT ON COLUMN public.orders.external_ref IS 'Used as external_reference in MercadoPago preference';
COMMENT ON COLUMN public.orders.plan_type IS 'Either basic ($300 USD) or pro ($600 USD)';
COMMENT ON COLUMN public.orders.payment_id IS 'MercadoPago payment ID, populated by webhook';

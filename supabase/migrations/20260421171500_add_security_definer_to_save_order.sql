-- Update public_save_order to be SECURITY DEFINER
-- This allows anonymous users to save orders even if they don't have SELECT permissions 
-- (required for the generate_order_number trigger to function correctly).

DROP FUNCTION IF EXISTS public.public_save_order(TEXT,TEXT,TEXT,DATE,TEXT,TEXT,TEXT,INTEGER,NUMERIC,NUMERIC,NUMERIC,NUMERIC,BOOLEAN,TEXT,JSONB,TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.public_save_order(
  p_section TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_date DATE,
  p_delivery_time TEXT,
  p_delivery_address TEXT,
  p_event_type TEXT,
  p_guest_count INT,
  p_subtotal DECIMAL,
  p_discount_amount DECIMAL,
  p_shipping_cost DECIMAL,
  p_total DECIMAL,
  p_whatsapp_sent BOOLEAN,
  p_notes TEXT,
  p_raw_cart JSONB,
  p_membership_tier TEXT DEFAULT 'individual'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
BEGIN
  INSERT INTO orders (
    section, customer_name, customer_phone, delivery_date, delivery_time,
    delivery_address, event_type, guest_count, subtotal, discount_amount,
    shipping_cost, total, whatsapp_sent, notes, raw_cart, membership_tier
  ) VALUES (
    p_section, p_customer_name, p_customer_phone, p_delivery_date, p_delivery_time,
    p_delivery_address, p_event_type, p_guest_count, p_subtotal, p_discount_amount,
    p_shipping_cost, p_total, p_whatsapp_sent, p_notes, p_raw_cart, p_membership_tier
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  RETURN json_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.public_save_order(TEXT,TEXT,TEXT,DATE,TEXT,TEXT,TEXT,INTEGER,NUMERIC,NUMERIC,NUMERIC,NUMERIC,BOOLEAN,TEXT,JSONB,TEXT) TO anon, authenticated;

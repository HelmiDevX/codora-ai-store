-- =========================================================================
-- CODORA AI STORE - SUPABASE DATABASE SCHEMA & REALTIME POLICIES
-- =========================================================================

-- 1. جدول إعدادات المتجر وحسابات الدفع (Store Settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number TEXT NOT NULL DEFAULT '967778401415',
    telegram_username TEXT NOT NULL DEFAULT 'ai_store_support',
    instagram_username TEXT NOT NULL DEFAULT 'aistore_ye',
    admin_pin TEXT NOT NULL DEFAULT '2026',
    kuraimi_acc TEXT DEFAULT '3006500012',
    kuraimi_name TEXT DEFAULT 'متجر الذكاء الاصطناعي',
    jeeb_phone TEXT DEFAULT '777123456',
    jeeb_name TEXT DEFAULT 'متجر كودورا AI',
    qutaibi_acc TEXT DEFAULT '12345678',
    qutaibi_name TEXT DEFAULT 'مؤسسة كودورا للبرمجيات',
    usdt_address TEXT DEFAULT 'TXYZ1234567890USDTNetwork',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول أسعار الصرف (Exchange Rates)
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yer_new NUMERIC DEFAULT 1650,
    yer_old NUMERIC DEFAULT 535,
    sar NUMERIC DEFAULT 3.75,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول المنتجات والاشتراكات (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price_usd NUMERIC NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'ai-subscription',
    is_active BOOLEAN DEFAULT true,
    duration TEXT DEFAULT 'شهر كامل (30 يوم)',
    delivery_type TEXT DEFAULT 'Shared Account',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول الكوبونات (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT DEFAULT 'percentage',
    discount_value NUMERIC DEFAULT 10,
    affiliate_name TEXT,
    current_uses INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT,
    product_title TEXT NOT NULL,
    product_tier TEXT,
    original_total_usd NUMERIC DEFAULT 0,
    discount_usd NUMERIC DEFAULT 0,
    final_total_usd NUMERIC DEFAULT 0,
    final_total_converted NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    exchange_rate_used NUMERIC DEFAULT 1,
    payment_method TEXT DEFAULT 'kuraimi',
    coupon_code TEXT,
    receipt_url TEXT,
    receipt_filename TEXT,
    channel TEXT DEFAULT 'whatsapp',
    status TEXT DEFAULT 'contacted',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- تمكين الأذونات العامة (RLS Policies)
-- =========================================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read/Write Store Settings" ON public.store_settings;
CREATE POLICY "Public Read/Write Store Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write Exchange Rates" ON public.exchange_rates;
CREATE POLICY "Public Read/Write Exchange Rates" ON public.exchange_rates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write Products" ON public.products;
CREATE POLICY "Public Read/Write Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write Coupons" ON public.coupons;
CREATE POLICY "Public Read/Write Coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write Orders" ON public.orders;
CREATE POLICY "Public Read/Write Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- تفعيل البث اللحظي السحابي (Supabase Realtime)
-- =========================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_rates;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- إدراج البيانات الأولية إذا لم تكن موجودة
INSERT INTO public.store_settings (whatsapp_number, kuraimi_acc, kuraimi_name, jeeb_phone, qutaibi_acc, usdt_address)
VALUES ('967778401415', '3006500012', 'متجر الذكاء الاصطناعي', '777123456', '12345678', 'TXYZ1234567890USDTNetwork')
ON CONFLICT DO NOTHING;

INSERT INTO public.exchange_rates (yer_new, yer_old, sar)
VALUES (1650, 535, 3.75)
ON CONFLICT DO NOTHING;

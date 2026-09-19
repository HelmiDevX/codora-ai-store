import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { OrderPayload, OrderStatus } from '@/types/order';
import { Product } from '@/types/product';
import { Coupon } from '@/types/coupon';
import { ExchangeRatesMap } from '@/types/currency';
import { StoreSettings } from '@/store/use-store-settings';
import { MOCK_PRODUCTS } from '@/data/mock-products';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hhxjcnfmhrgddgrkykie.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SElZOAUH9tuOsZQNCQ-6Ig_nCApzcHV';

/**
 * Direct Supabase Client export initialized with environment variables
 * and reliable fallback credentials.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Returns the Supabase client instance.
 */
export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

/* =========================================================================
   UUID UTILITIES
========================================================================= */

export function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getThumbnailForCategory(category?: string, title?: string): string {
  const cleanTitle = (title || '').toLowerCase();
  if (cleanTitle.includes('chatgpt') || cleanTitle.includes('gpt')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80';
  }
  if (cleanTitle.includes('midjourney')) {
    return 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80';
  }
  if (cleanTitle.includes('claude')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  }
  if (cleanTitle.includes('canva')) {
    return 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80';
  }
  if (cleanTitle.includes('cursor')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
  }
  if (category === 'course' || cleanTitle.includes('كورس') || cleanTitle.includes('course')) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
}

function mapRowsToProducts(rows: any[]): Product[] {
  return rows.map((row: any): Product => {
    // Find matching mock product to preserve rich tags/features if available
    const matchedMock = MOCK_PRODUCTS.find(
      (m) => m.titleAr.toLowerCase() === (row.title || '').toLowerCase() || m.title.toLowerCase() === (row.title || '').toLowerCase()
    );

    return {
      id: row.id,
      slug: row.id,
      title: row.title || 'منتج ذكاء اصطناعي',
      titleAr: row.title || 'منتج ذكاء اصطناعي',
      shortDescription: row.description || matchedMock?.shortDescription || '',
      shortDescriptionAr: row.description || matchedMock?.shortDescriptionAr || '',
      fullDescription: row.description || matchedMock?.fullDescription || '',
      fullDescriptionAr: row.description || matchedMock?.fullDescriptionAr || '',
      category: (row.category as any) || matchedMock?.category || 'ai-subscription',
      tier: matchedMock?.tier || 'monthly',
      priceUSD: Number(row.price_usd || 0),
      badgeText: matchedMock?.badgeText,
      badgeTextAr: matchedMock?.badgeTextAr,
      isPopular: matchedMock?.isPopular || false,
      isAvailable: row.is_active !== undefined ? Boolean(row.is_active) : true,
      instantDelivery: true,
      thumbnailUrl: matchedMock?.thumbnailUrl || getThumbnailForCategory(row.category, row.title),
      features: matchedMock?.features || [
        { id: 'f1', title: 'Full Warranty', titleAr: 'ضمان كامل ومستمر طوال المدة', included: true },
        { id: 'f2', title: 'Instant Activation', titleAr: 'تسليم وتفعيل فوري على مدار 24 ساعة', included: true },
      ],
      metadata: {
        platform: matchedMock?.metadata?.platform || 'OpenAI',
        duration: row.duration || matchedMock?.metadata?.duration || '1 Month',
        durationAr: row.duration || matchedMock?.metadata?.durationAr || 'شهر كامل (30 يوم)',
        accessType: (row.delivery_type as any) || matchedMock?.metadata?.accessType || 'Shared Account',
      },
    };
  });
}

/* =========================================================================
   PRODUCTS (CRUD + Fetch + Seed)
========================================================================= */

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Products Fetch Error]', error.message);
      return null;
    }

    // If Supabase table is empty, auto-seed with default catalog
    if (!data || data.length === 0) {
      console.log('[Supabase Products] Table is empty. Auto-seeding default products...');
      return await seedDefaultProductsToSupabase();
    }

    return mapRowsToProducts(data);
  } catch (err) {
    console.warn('[Supabase Products Fetch Exception]', err);
    return null;
  }
}

export async function seedDefaultProductsToSupabase(): Promise<Product[]> {
  try {
    const seedRows = MOCK_PRODUCTS.map((p) => ({
      id: generateUUID(),
      title: p.titleAr || p.title,
      description: p.fullDescriptionAr || p.shortDescriptionAr || p.fullDescription || p.shortDescription,
      price_usd: p.priceUSD,
      category: p.category,
      is_active: p.isAvailable,
      duration: p.metadata?.durationAr || 'شهر كامل (30 يوم)',
      delivery_type: p.metadata?.accessType || 'Shared Account',
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('products').insert(seedRows).select();
    if (error || !data || data.length === 0) {
      console.warn('[Supabase Seeding Warning]', error?.message);
      return MOCK_PRODUCTS;
    }

    return mapRowsToProducts(data);
  } catch (err) {
    console.warn('[Supabase Seeding Exception]', err);
    return MOCK_PRODUCTS;
  }
}

export async function upsertProductToSupabase(product: Product): Promise<{ success: boolean; error: string | null; id?: string }> {
  try {
    const targetId = isValidUUID(product.id) ? product.id : generateUUID();
    const row = {
      id: targetId,
      title: product.titleAr || product.title,
      description: product.fullDescriptionAr || product.shortDescriptionAr || product.fullDescription || product.shortDescription || '',
      price_usd: Number(product.priceUSD || 0),
      category: product.category || 'ai-subscription',
      is_active: product.isAvailable !== undefined ? Boolean(product.isAvailable) : true,
      duration: product.metadata?.durationAr || 'شهر كامل (30 يوم)',
      delivery_type: product.metadata?.accessType || 'Shared Account',
    };

    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase Upsert Product Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null, id: targetId };
  } catch (err) {
    console.error('[Supabase Upsert Product Exception]', err);
    return { success: false, error: String(err) };
  }
}

export async function deleteProductFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('[Supabase Delete Product Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Delete Product Exception]', err);
    return { success: false, error: String(err) };
  }
}

/* =========================================================================
   EXCHANGE RATES (CRUD + Fetch)
========================================================================= */

export async function fetchExchangeRatesFromSupabase(): Promise<ExchangeRatesMap | null> {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('[Supabase Exchange Rates Fetch Error]', error.message);
      return null;
    }

    return {
      USD: 1,
      YER_ADEN: Number(data.yer_new !== undefined ? data.yer_new : (data.yer_aden || 1650)),
      YER_SANAA: Number(data.yer_old !== undefined ? data.yer_old : (data.yer_sanaa || 535)),
      SAR: Number(data.sar || 3.75),
    };
  } catch (err) {
    console.warn('[Supabase Exchange Rates Fetch Exception]', err);
    return null;
  }
}

export async function upsertExchangeRatesToSupabase(rates: ExchangeRatesMap): Promise<{ success: boolean; error: string | null }> {
  try {
    const row = {
      yer_new: Number(rates.YER_ADEN || 1650),
      yer_old: Number(rates.YER_SANAA || 535),
      sar: Number(rates.SAR || 3.75),
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('exchange_rates')
      .select('id')
      .limit(1)
      .maybeSingle();

    let error;
    if (existing && existing.id) {
      const res = await supabase.from('exchange_rates').update(row).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await supabase.from('exchange_rates').insert([{ id: generateUUID(), ...row }]);
      error = res.error;
    }

    if (error) {
      console.error('[Supabase Upsert Exchange Rates Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Upsert Exchange Rates Exception]', err);
    return { success: false, error: String(err) };
  }
}

/* =========================================================================
   STORE SETTINGS (CRUD + Fetch)
========================================================================= */

export async function fetchStoreSettingsFromSupabase(): Promise<StoreSettings | null> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('[Supabase Store Settings Fetch Error]', error.message);
      return null;
    }

    return {
      whatsappNumber: data.whatsapp_number || '967778401415',
      telegramUsername: data.telegram_username || 'ai_store_support',
      instagramUsername: data.instagram_username || 'aistore_ye',
      adminPin: data.admin_pin || '2026',
      paymentAccounts: {
        kuraimi: {
          accountNumber: data.kuraimi_acc || '3006500012',
          beneficiaryName: data.kuraimi_name || 'متجر الذكاء الاصطناعي',
        },
        jeeb: {
          phoneNumber: data.jeeb_phone || '777123456',
          beneficiaryName: data.jeeb_name || 'متجر كودورا AI',
        },
        qutaibi: {
          accountNumber: data.qutaibi_acc || '12345678',
          beneficiaryName: data.qutaibi_name || 'مؤسسة كودورا للبرمجيات',
        },
        binance_usdt: {
          walletAddress: data.usdt_address || 'TXYZ1234567890USDTNetwork',
          network: 'Tron (TRC-20)',
        },
      },
    };
  } catch (err) {
    console.warn('[Supabase Store Settings Fetch Exception]', err);
    return null;
  }
}

export async function upsertStoreSettingsToSupabase(settings: StoreSettings): Promise<{ success: boolean; error: string | null }> {
  try {
    const row = {
      whatsapp_number: settings.whatsappNumber,
      telegram_username: settings.telegramUsername,
      instagram_username: settings.instagramUsername,
      admin_pin: settings.adminPin,
      kuraimi_acc: settings.paymentAccounts?.kuraimi?.accountNumber || '',
      kuraimi_name: settings.paymentAccounts?.kuraimi?.beneficiaryName || '',
      jeeb_phone: settings.paymentAccounts?.jeeb?.phoneNumber || '',
      jeeb_name: settings.paymentAccounts?.jeeb?.beneficiaryName || '',
      qutaibi_acc: settings.paymentAccounts?.qutaibi?.accountNumber || '',
      qutaibi_name: settings.paymentAccounts?.qutaibi?.beneficiaryName || '',
      usdt_address: settings.paymentAccounts?.binance_usdt?.walletAddress || '',
    };

    const { data: existing } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let error;
    if (existing && existing.id) {
      const res = await supabase.from('store_settings').update(row).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await supabase.from('store_settings').insert([{ id: generateUUID(), ...row }]);
      error = res.error;
    }

    if (error) {
      console.error('[Supabase Upsert Store Settings Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Upsert Store Settings Exception]', err);
    return { success: false, error: String(err) };
  }
}

/* =========================================================================
   COUPONS (CRUD + Fetch)
========================================================================= */

export async function fetchCouponsFromSupabase(): Promise<Record<string, Coupon> | null> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[Supabase Coupons Fetch Error]', error.message);
      return null;
    }

    const map: Record<string, Coupon> = {};
    for (const row of data) {
      const cleanCode = (row.code || '').trim().toUpperCase();
      if (!cleanCode) continue;

      map[cleanCode] = {
        code: cleanCode,
        discountType: (row.discount_type === 'percentage' || row.discount_type === 'percent') ? 'percentage' : 'fixed_usd',
        discountValue: Number(row.discount_value || 0),
        usedCount: Number(row.current_uses || 0),
        totalRevenueUSD: 0,
        isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      };
    }
    return map;
  } catch (err) {
    console.warn('[Supabase Coupons Fetch Exception]', err);
    return null;
  }
}

export async function upsertCouponToSupabase(coupon: Coupon): Promise<{ success: boolean; error: string | null }> {
  try {
    const cleanCode = coupon.code.trim().toUpperCase();
    const row = {
      code: cleanCode,
      discount_type: coupon.discountType,
      discount_value: Number(coupon.discountValue || 0),
      current_uses: Number(coupon.usedCount || 0),
      is_active: Boolean(coupon.isActive),
    };

    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .ilike('code', cleanCode)
      .maybeSingle();

    let error;
    if (existing && existing.id) {
      const res = await supabase.from('coupons').update(row).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await supabase.from('coupons').insert([{ id: generateUUID(), ...row }]);
      error = res.error;
    }

    if (error) {
      console.error('[Supabase Upsert Coupon Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Upsert Coupon Exception]', err);
    return { success: false, error: String(err) };
  }
}

export async function deleteCouponFromSupabase(code: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const { error } = await supabase.from('coupons').delete().ilike('code', cleanCode);
    if (error) {
      console.error('[Supabase Delete Coupon Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Delete Coupon Exception]', err);
    return { success: false, error: String(err) };
  }
}

export async function fetchCouponFromSupabase(code: string): Promise<Coupon | null> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (error || !data) return null;

    return {
      code: data.code || cleanCode,
      discountType: (data.discount_type === 'percentage' || data.discount_type === 'percent') ? 'percentage' : 'fixed_usd',
      discountValue: Number(data.discount_value || 0),
      usedCount: Number(data.current_uses || 0),
      totalRevenueUSD: 0,
      isActive: data.is_active !== undefined ? Boolean(data.is_active) : true,
    };
  } catch (err) {
    console.warn('[Supabase Coupon Lookup Exception]', err);
    return null;
  }
}

export async function incrementCouponUsageInSupabase(code: string, _orderTotalUSD?: number): Promise<void> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const { data } = await supabase
      .from('coupons')
      .select('id, current_uses')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (data && data.id) {
      const currentUses = Number(data.current_uses || 0) + 1;
      await supabase
        .from('coupons')
        .update({ current_uses: currentUses })
        .eq('id', data.id);
    }
  } catch (err) {
    console.warn('[Supabase Coupon Usage Increment Exception]', err);
  }
}

/* =========================================================================
   RECEIPTS & ORDERS
========================================================================= */

export async function uploadReceiptImage(
  fileOrBase64: File | Blob | string,
  fileName: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    let fileBody: File | Blob;
    let extension = 'png';

    if (typeof fileOrBase64 === 'string') {
      const matches = fileOrBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        extension = contentType.split('/')[1] || 'png';
        const byteCharacters = atob(matches[2]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileBody = new Blob([byteArray], { type: contentType });
      } else {
        return { url: null, error: 'Invalid base64 format' };
      }
    } else {
      fileBody = fileOrBase64;
      if (fileOrBase64 instanceof File && fileOrBase64.name) {
        const parts = fileOrBase64.name.split('.');
        if (parts.length > 1) {
          extension = parts.pop() || 'png';
        }
      }
    }

    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = `receipts/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, fileBody, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('[Supabase Storage Upload Warning]', uploadError.message);
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return {
      url: publicUrlData?.publicUrl || null,
      error: null,
    };
  } catch (err) {
    console.warn('[Supabase Storage Exception]', err);
    return { url: null, error: String(err) };
  }
}

export async function syncOrderToSupabase(order: OrderPayload): Promise<{ success: boolean; error: string | null; id?: string }> {
  try {
    if (!order || !order.customer?.fullName) {
      return { success: false, error: 'Missing required order fields' };
    }

    const orderId = isValidUUID(order.id) ? order.id : generateUUID();
    const orderRow = {
      id: orderId,
      customer_name: order.customer.fullName.trim(),
      product_title: order.item?.product?.titleAr || order.item?.product?.title || 'Unknown Product',
      currency: order.currency || 'USD',
      final_amount: Number(order.finalTotalUSD || 0),
      coupon_code: order.couponCode || null,
      payment_method: order.paymentMethod || 'kuraimi',
      receipt_url: order.proof?.receiptImageUrl || null,
      target_platform: order.channel || 'whatsapp',
      status: order.status || 'contacted',
      created_at: order.createdAt || new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('orders')
      .insert([orderRow]);

    if (insertError) {
      console.warn('[Supabase DB Insert Warning]', insertError.message);
      return { success: false, error: insertError.message };
    }

    return { success: true, error: null, id: orderId };
  } catch (err) {
    console.warn('[Supabase DB Exception]', err);
    return { success: false, error: String(err) };
  }
}

export async function fetchOrdersFromSupabase(): Promise<OrderPayload[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) console.warn('[Supabase Orders Fetch Error]', error.message);
      return null;
    }

    return data.map((row: any): OrderPayload => ({
      id: row.id,
      orderNumber: `ORD-${(row.id || '').substring(0, 8).toUpperCase()}`,
      item: {
        product: {
          id: row.id,
          slug: row.id,
          title: row.product_title || 'اشتراك ذكاء اصطناعي',
          titleAr: row.product_title || 'اشتراك ذكاء اصطناعي',
          shortDescription: '',
          shortDescriptionAr: '',
          fullDescription: '',
          fullDescriptionAr: '',
          category: 'ai-subscription',
          tier: 'monthly',
          priceUSD: Number(row.final_amount || 0),
          isAvailable: true,
          instantDelivery: true,
          thumbnailUrl: getThumbnailForCategory('ai-subscription', row.product_title),
          features: [],
        },
        quantity: 1,
        unitPriceUSD: Number(row.final_amount || 0),
      },
      customer: {
        fullName: row.customer_name || 'عميل كودورا',
      },
      paymentMethod: (row.payment_method as any) || 'kuraimi',
      currency: (row.currency as any) || 'USD',
      exchangeRateUsed: 1,
      originalTotalUSD: Number(row.final_amount || 0),
      discountUSD: 0,
      finalTotalUSD: Number(row.final_amount || 0),
      finalTotalConverted: Number(row.final_amount || 0),
      couponCode: row.coupon_code || undefined,
      proof: row.receipt_url
        ? {
          receiptImageUrl: row.receipt_url,
          submittedAt: row.created_at,
        }
        : undefined,
      channel: (row.target_platform as any) || 'whatsapp',
      status: (row.status as any) || 'contacted',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase Orders Fetch Exception]', err);
    return null;
  }
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('[Supabase Order Status Update Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Order Status Update Exception]', err);
    return { success: false, error: String(err) };
  }
}

export async function deleteOrderFromSupabase(
  orderId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('[Supabase Order Delete Error]', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('[Supabase Order Delete Exception]', err);
    return { success: false, error: String(err) };
  }
}

/* =========================================================================
   REALTIME SUBSCRIPTION HELPER
========================================================================= */

export function subscribeToSupabaseChanges(
  tableName: string,
  onPayload: (payload: any) => void
): RealtimeChannel | null {
  try {
    const channel = supabase
      .channel(`public-db-${tableName}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          onPayload(payload);
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.warn(`[Supabase Realtime Subscription Error on ${tableName}]`, err);
    return null;
  }
}

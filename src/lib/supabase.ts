import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { OrderPayload } from '@/types/order';
import { Product } from '@/types/product';
import { Coupon } from '@/types/coupon';
import { ExchangeRatesMap } from '@/types/currency';
import { StoreSettings } from '@/store/use-store-settings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Safely retrieves or initializes the Supabase client instance.
 * Returns null if credentials are invalid or missing, preventing runtime crashes.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  if (supabaseInstance) return supabaseInstance;

  try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseInstance;
    }
  } catch (error) {
    console.warn('[Supabase Init Warning] Could not initialize Supabase client:', error);
  }

  return null;
}

/* =========================================================================
   PRODUCTS (CRUD + Fetch)
========================================================================= */

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((row: any): Product => ({
      id: row.id,
      slug: row.slug || row.id,
      title: row.title || row.title_ar,
      titleAr: row.title_ar || row.title,
      shortDescription: row.short_description || '',
      shortDescriptionAr: row.short_description_ar || row.short_description || '',
      fullDescription: row.full_description || '',
      fullDescriptionAr: row.full_description_ar || '',
      category: row.category || 'ai-subscription',
      tier: row.tier || 'monthly',
      priceUSD: Number(row.price_usd || row.price || 0),
      badgeTextAr: row.badge_text_ar || undefined,
      isPopular: Boolean(row.is_popular),
      isAvailable: row.is_available !== undefined ? Boolean(row.is_available) : true,
      instantDelivery: row.instant_delivery !== undefined ? Boolean(row.instant_delivery) : true,
      thumbnailUrl: row.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      features: Array.isArray(row.features)
        ? row.features
        : typeof row.features === 'string'
        ? JSON.parse(row.features)
        : [
            { id: 'f1', title: 'Full Warranty', titleAr: 'ضمان كامل ومستمر طوال المدة', included: true },
            { id: 'f2', title: 'Instant Activation', titleAr: 'تسليم وتفعيل فوري على مدار 24 ساعة', included: true },
          ],
      metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {},
    }));
  } catch (err) {
    console.warn('[Supabase Products Fetch Error]', err);
    return null;
  }
}

export async function upsertProductToSupabase(product: Product): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const row = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      title_ar: product.titleAr,
      short_description: product.shortDescription,
      short_description_ar: product.shortDescriptionAr,
      full_description: product.fullDescription,
      full_description_ar: product.fullDescriptionAr,
      category: product.category,
      tier: product.tier,
      price_usd: product.priceUSD,
      badge_text_ar: product.badgeTextAr || null,
      is_popular: Boolean(product.isPopular),
      is_available: product.isAvailable,
      instant_delivery: product.instantDelivery,
      thumbnail_url: product.thumbnailUrl,
      features: product.features,
      metadata: product.metadata,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Upsert Product Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Upsert Product Exception]', err);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase Delete Product Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Delete Product Exception]', err);
    return false;
  }
}

/* =========================================================================
   EXCHANGE RATES (CRUD + Fetch)
========================================================================= */

export async function fetchExchangeRatesFromSupabase(): Promise<ExchangeRatesMap | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .maybeSingle();

    if (error || !data) return null;

    if (data.rates && typeof data.rates === 'object') {
      return data.rates as ExchangeRatesMap;
    }

    // If stored as individual columns
    if (data.yer_aden || data.YER_ADEN) {
      return {
        USD: 1,
        YER_ADEN: Number(data.yer_aden || data.YER_ADEN || 1650),
        YER_SANAA: Number(data.yer_sanaa || data.YER_SANAA || 535),
        SAR: Number(data.sar || data.SAR || 3.75),
      };
    }

    return null;
  } catch (err) {
    console.warn('[Supabase Exchange Rates Fetch Error]', err);
    return null;
  }
}

export async function upsertExchangeRatesToSupabase(rates: ExchangeRatesMap): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const row = {
      id: 1,
      rates: rates,
      yer_aden: rates.YER_ADEN,
      yer_sanaa: rates.YER_SANAA,
      sar: rates.SAR,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('exchange_rates').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Upsert Exchange Rates Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Upsert Exchange Rates Exception]', err);
    return false;
  }
}

/* =========================================================================
   STORE SETTINGS (CRUD + Fetch)
========================================================================= */

export async function fetchStoreSettingsFromSupabase(): Promise<StoreSettings | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .maybeSingle();

    if (error || !data) return null;

    return {
      whatsappNumber: data.whatsapp_number || '967770000000',
      telegramUsername: data.telegram_username || 'ai_store_support',
      instagramUsername: data.instagram_username || 'aistore_ye',
      adminPin: data.admin_pin || '2026',
      paymentAccounts: data.payment_accounts || {
        kuraimi: {
          accountNumber: data.kuraimi_account || '3001234567',
          beneficiaryName: data.kuraimi_beneficiary || 'متجر الذكاء الاصطناعي',
        },
        jeeb: {
          phoneNumber: data.jeeb_phone || '777123456',
          beneficiaryName: data.jeeb_beneficiary || 'متجر كودورا AI',
        },
        qutaibi: {
          accountNumber: data.qutaibi_account || '12345678',
          beneficiaryName: data.qutaibi_beneficiary || 'مؤسسة كودورا للبرمجيات',
        },
        binance_usdt: {
          walletAddress: data.usdt_address || 'TXYZ1234567890USDTNetwork',
          network: data.usdt_network || 'Tron (TRC-20)',
        },
      },
    };
  } catch (err) {
    console.warn('[Supabase Store Settings Fetch Error]', err);
    return null;
  }
}

export async function upsertStoreSettingsToSupabase(settings: StoreSettings): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const row = {
      id: 1,
      whatsapp_number: settings.whatsappNumber,
      telegram_username: settings.telegramUsername,
      instagram_username: settings.instagramUsername,
      admin_pin: settings.adminPin,
      payment_accounts: settings.paymentAccounts,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('store_settings').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Upsert Store Settings Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Upsert Store Settings Exception]', err);
    return false;
  }
}

/* =========================================================================
   COUPONS (CRUD + Fetch)
========================================================================= */

export async function fetchCouponsFromSupabase(): Promise<Record<string, Coupon> | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    const map: Record<string, Coupon> = {};
    for (const row of data) {
      const cleanCode = (row.code || '').trim().toUpperCase();
      if (!cleanCode) continue;

      map[cleanCode] = {
        code: cleanCode,
        discountType: (row.discount_type === 'percentage' || row.discount_type === 'percent') ? 'percentage' : 'fixed_usd',
        discountValue: Number(row.discount_value || row.discount_amount || 0),
        affiliateName: row.affiliate_name || row.marketer_name || undefined,
        minOrderUSD: row.min_order_usd ? Number(row.min_order_usd) : undefined,
        maxDiscountUSD: row.max_discount_usd ? Number(row.max_discount_usd) : undefined,
        expiresAt: row.expires_at || undefined,
        usageLimit: row.usage_limit || row.max_uses ? Number(row.usage_limit || row.max_uses) : undefined,
        usedCount: Number(row.current_uses || row.used_count || 0),
        totalRevenueUSD: Number(row.total_revenue || 0),
        isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      };
    }
    return map;
  } catch (err) {
    console.warn('[Supabase Coupons Fetch Error]', err);
    return null;
  }
}

export async function upsertCouponToSupabase(coupon: Coupon): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const cleanCode = coupon.code.trim().toUpperCase();
    const row = {
      code: cleanCode,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      affiliate_name: coupon.affiliateName || null,
      min_order_usd: coupon.minOrderUSD || null,
      max_discount_usd: coupon.maxDiscountUSD || null,
      expires_at: coupon.expiresAt || null,
      usage_limit: coupon.usageLimit || null,
      current_uses: coupon.usedCount || 0,
      used_count: coupon.usedCount || 0,
      total_revenue: coupon.totalRevenueUSD || 0,
      is_active: coupon.isActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('coupons').upsert(row, { onConflict: 'code' });
    if (error) {
      console.warn('[Supabase Upsert Coupon Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Upsert Coupon Exception]', err);
    return false;
  }
}

export async function deleteCouponFromSupabase(code: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const cleanCode = code.trim().toUpperCase();
    const { error } = await supabase.from('coupons').delete().ilike('code', cleanCode);
    if (error) {
      console.warn('[Supabase Delete Coupon Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Delete Coupon Exception]', err);
    return false;
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
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Supabase Storage] Client not initialized, using local fallback.');
      return { url: null, error: 'Supabase client not initialized' };
    }

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

export async function syncOrderToSupabase(order: OrderPayload): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase client unavailable' };

    if (!order || !order.id || !order.customer?.fullName) {
      return { success: false, error: 'Missing required order fields' };
    }

    const orderRow = {
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customer.fullName,
      customer_whatsapp: order.customer.whatsappNumber || null,
      product_title: order.item?.product?.titleAr || order.item?.product?.title || 'Unknown Product',
      product_tier: order.item?.product?.metadata?.durationAr || order.item?.product?.tier || 'Standard',
      original_total_usd: order.originalTotalUSD || 0,
      discount_usd: order.discountUSD || 0,
      final_total_usd: order.finalTotalUSD || 0,
      final_total_converted: order.finalTotalConverted || 0,
      currency: order.currency || 'USD',
      exchange_rate_used: order.exchangeRateUsed || 1,
      payment_method: order.paymentMethod || 'kuraimi',
      coupon_code: order.couponCode || null,
      receipt_url: order.proof?.receiptImageUrl || null,
      receipt_filename: order.proof?.fileName || null,
      channel: order.channel || 'whatsapp',
      status: order.status || 'contacted',
      created_at: order.createdAt || new Date().toISOString(),
      updated_at: order.updatedAt || new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('orders')
      .insert([orderRow]);

    if (insertError) {
      console.warn('[Supabase DB Insert Warning]', insertError.message);
      return { success: false, error: insertError.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.warn('[Supabase DB Exception]', err);
    return { success: false, error: String(err) };
  }
}

export async function fetchCouponFromSupabase(code: string): Promise<Coupon | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

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
      discountValue: Number(data.discount_value || data.discount_amount || 0),
      affiliateName: data.affiliate_name || data.marketer_name || undefined,
      minOrderUSD: data.min_order_usd ? Number(data.min_order_usd) : undefined,
      maxDiscountUSD: data.max_discount_usd ? Number(data.max_discount_usd) : undefined,
      expiresAt: data.expires_at || undefined,
      usageLimit: data.usage_limit || data.max_uses ? Number(data.usage_limit || data.max_uses) : undefined,
      usedCount: Number(data.current_uses || data.used_count || 0),
      totalRevenueUSD: Number(data.total_revenue || 0),
      isActive: data.is_active !== undefined ? Boolean(data.is_active) : true,
    };
  } catch (err) {
    console.warn('[Supabase Coupon Lookup Exception]', err);
    return null;
  }
}

export async function incrementCouponUsageInSupabase(code: string, orderTotalUSD: number): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const cleanCode = code.trim().toUpperCase();

    const { data } = await supabase
      .from('coupons')
      .select('id, current_uses, used_count, total_revenue')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (data && data.id) {
      const currentUses = (data.current_uses || data.used_count || 0) + 1;
      const currentRev = (data.total_revenue || 0) + orderTotalUSD;

      await supabase
        .from('coupons')
        .update({
          current_uses: currentUses,
          used_count: currentUses,
          total_revenue: currentRev,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
    }
  } catch (err) {
    console.warn('[Supabase Coupon Usage Increment Exception]', err);
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
    const supabase = getSupabaseClient();
    if (!supabase) return null;

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

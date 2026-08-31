import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OrderPayload } from '@/types/order';
import { Coupon } from '@/types/coupon';

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

/**
 * Uploads payment receipt image to Supabase Storage 'receipts' bucket.
 * Encapsulated in try...catch with seamless fallback.
 */
export async function uploadReceiptImage(
  fileOrBase64: File | Blob | string,
  fileName: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Supabase Storage] Supabase client is not configured, using local fallback.');
      return { url: null, error: 'Supabase client not initialized' };
    }

    let fileBody: File | Blob;
    let extension = 'png';

    if (typeof fileOrBase64 === 'string') {
      // Base64 to Blob conversion
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

    const { data, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, fileBody, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('[Supabase Storage Upload Warning]', uploadError.message);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return {
      url: publicUrlData?.publicUrl || null,
      error: null,
    };
  } catch (err) {
    console.warn('[Supabase Storage Exception] Failed to upload receipt to cloud:', err);
    return { url: null, error: String(err) };
  }
}

/**
 * Inserts a new order record into the Supabase 'orders' table.
 * Encapsulated in try...catch to ensure storefront flow never crashes.
 */
export async function syncOrderToSupabase(order: OrderPayload): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Supabase Sync] Supabase client is not available, order saved locally.');
      return { success: false, error: 'Supabase client unavailable' };
    }

    // Validate required fields before inserting
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
    console.warn('[Supabase DB Exception] Error synchronizing order:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Fetches dynamic coupon record from Supabase 'coupons' table by normalized code.
 */
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

    if (error || !data) {
      return null;
    }

    // Map database row to standard Coupon object
    const coupon: Coupon = {
      code: data.code || cleanCode,
      discountType: (data.discount_type === 'percentage' || data.discount_type === 'percent') ? 'percentage' : 'fixed_usd',
      discountValue: Number(data.discount_value || data.discount_amount || 0),
      affiliateName: data.affiliate_name || data.marketer_name || data.influencer_name || undefined,
      minOrderUSD: data.min_order_usd ? Number(data.min_order_usd) : undefined,
      maxDiscountUSD: data.max_discount_usd ? Number(data.max_discount_usd) : undefined,
      expiresAt: data.expires_at || undefined,
      usageLimit: data.usage_limit || data.max_uses ? Number(data.usage_limit || data.max_uses) : undefined,
      usedCount: Number(data.current_uses || data.used_count || 0),
      totalRevenueUSD: Number(data.total_revenue || data.total_revenue_usd || 0),
      isActive: data.is_active !== undefined ? Boolean(data.is_active) : true,
    };

    return coupon;
  } catch (err) {
    console.warn('[Supabase Coupon Lookup Exception]', err);
    return null;
  }
}

/**
 * Increments coupon usage count (current_uses) in Supabase.
 */
export async function incrementCouponUsageInSupabase(code: string, orderTotalUSD: number): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const cleanCode = code.trim().toUpperCase();

    // Fetch existing count first
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

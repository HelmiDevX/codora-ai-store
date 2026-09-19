import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coupon, CouponValidationResult } from '@/types/coupon';
import { MOCK_COUPONS } from '@/data/mock-coupons';
import { 
  fetchCouponsFromSupabase, 
  upsertCouponToSupabase, 
  deleteCouponFromSupabase, 
  subscribeToSupabaseChanges 
} from '@/lib/supabase';
import { broadcastSyncEvent } from '@/lib/broadcast-bus';

interface CouponsStoreState {
  coupons: Record<string, Coupon>;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<{ success: boolean; error?: string }>;
  toggleCouponActive: (code: string) => Promise<{ success: boolean; error?: string }>;
  deleteCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  incrementCouponUsage: (code: string, orderRevenueUSD: number) => void;
  setFullCoupons: (coupons: Record<string, Coupon>) => void;
  validateCouponCode: (code: string, basePriceUSD: number) => CouponValidationResult;
  resetCoupons: () => void;
}

let isCouponsSubscribed = false;

export const useCouponsStore = create<CouponsStoreState>()(
  persist(
    (set, get) => ({
      coupons: MOCK_COUPONS,
      isLoading: false,

      fetchInitialData: async () => {
        try {
          const liveCoupons = await fetchCouponsFromSupabase();
          if (liveCoupons && Object.keys(liveCoupons).length > 0) {
            set({ 
              coupons: liveCoupons, 
              isLoading: false 
            });
          }

          if (!isCouponsSubscribed && typeof window !== 'undefined') {
            isCouponsSubscribed = true;
            subscribeToSupabaseChanges('coupons', async () => {
              const refreshed = await fetchCouponsFromSupabase();
              if (refreshed && Object.keys(refreshed).length > 0) {
                set({ coupons: refreshed });
                broadcastSyncEvent('COUPONS_UPDATED', refreshed);
              }
            });
          }
        } catch (err) {
          console.warn('[Coupons Store Hydration Warning]', err);
        }
      },

      addCoupon: async (coupon) => {
        const cleanCode = coupon.code.trim().toUpperCase();
        const formattedCoupon = {
          ...coupon,
          code: cleanCode,
        };

        const newCoupons = {
          ...get().coupons,
          [cleanCode]: formattedCoupon,
        };

        // 1. Immediate local update
        set({ coupons: newCoupons });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('COUPONS_UPDATED', newCoupons);

        // 3. Persist to Supabase in background
        upsertCouponToSupabase(formattedCoupon).catch((err) => {
          console.warn('[Supabase Coupon Insert Warning]', err);
        });

        return { success: true };
      },

      toggleCouponActive: async (code) => {
        const cleanCode = code.trim().toUpperCase();
        const existing = get().coupons[cleanCode];
        if (!existing) return { success: false, error: 'Coupon not found' };

        const targetCoupon: Coupon = {
          ...existing,
          isActive: !existing.isActive,
        };

        const newCoupons = {
          ...get().coupons,
          [cleanCode]: targetCoupon,
        };

        // 1. Immediate local update
        set({ coupons: newCoupons });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('COUPONS_UPDATED', newCoupons);

        // 3. Persist to Supabase in background
        upsertCouponToSupabase(targetCoupon).catch((err) => {
          console.warn('[Supabase Coupon Toggle Warning]', err);
        });

        return { success: true };
      },

      deleteCoupon: async (code) => {
        const cleanCode = code.trim().toUpperCase();
        const updated = { ...get().coupons };
        delete updated[cleanCode];

        // 1. Immediate local update
        set({ coupons: updated });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('COUPONS_UPDATED', updated);

        // 3. Persist to Supabase in background
        deleteCouponFromSupabase(cleanCode).catch((err) => {
          console.warn('[Supabase Coupon Delete Warning]', err);
        });

        return { success: true };
      },

      incrementCouponUsage: (code, orderRevenueUSD) => {
        const cleanCode = code.trim().toUpperCase();
        const existing = get().coupons[cleanCode];
        if (!existing) return;

        const updatedCoupon = {
          ...existing,
          usedCount: (existing.usedCount || 0) + 1,
          totalRevenueUSD: (existing.totalRevenueUSD || 0) + orderRevenueUSD,
        };

        const newCoupons = {
          ...get().coupons,
          [cleanCode]: updatedCoupon,
        };

        set({ coupons: newCoupons });
        broadcastSyncEvent('COUPONS_UPDATED', newCoupons);
      },

      setFullCoupons: (coupons) => {
        set({ coupons });
      },

      validateCouponCode: (inputCode: string, basePriceUSD: number): CouponValidationResult => {
        if (!inputCode) {
          return {
            isValid: false,
            discountAmountUSD: 0,
            finalPriceUSD: basePriceUSD,
            errorMessageAr: 'يرجى إدخال كود الخصم',
          };
        }

        const cleanCode = inputCode.trim().toUpperCase();
        const { coupons } = get();
        const coupon = coupons[cleanCode];

        if (!coupon) {
          return {
            isValid: false,
            discountAmountUSD: 0,
            finalPriceUSD: basePriceUSD,
            errorMessage: 'Coupon code does not exist.',
            errorMessageAr: 'كود الخصم غير موجود، تأكد من صحة الرمز',
          };
        }

        // 1. Check isActive
        if (!coupon.isActive) {
          return {
            isValid: false,
            discountAmountUSD: 0,
            finalPriceUSD: basePriceUSD,
            errorMessage: 'Coupon is currently inactive.',
            errorMessageAr: 'هذا الكوبون معطل حالياً من قِبل الإدارة',
          };
        }

        // 2. Check Expiration date
        if (coupon.expiresAt) {
          const expiryDate = new Date(coupon.expiresAt);
          if (!isNaN(expiryDate.getTime()) && new Date() > expiryDate) {
            return {
              isValid: false,
              discountAmountUSD: 0,
              finalPriceUSD: basePriceUSD,
              errorMessage: 'Coupon has expired.',
              errorMessageAr: 'عذراً، انتهت صلاحية هذا الكوبون',
            };
          }
        }

        // 3. Check Usage Limit (Max Uses)
        if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
          return {
            isValid: false,
            discountAmountUSD: 0,
            finalPriceUSD: basePriceUSD,
            errorMessage: 'Coupon usage limit reached.',
            errorMessageAr: 'تم استنفاد الحد الأقصى لاستخدام هذا الكوبون',
          };
        }

        // 4. Calculate Discount
        let discountAmountUSD = 0;
        if (coupon.discountType === 'percentage') {
          discountAmountUSD = (basePriceUSD * Number(coupon.discountValue)) / 100;
        } else {
          discountAmountUSD = Number(coupon.discountValue);
        }

        discountAmountUSD = Math.min(discountAmountUSD, basePriceUSD);
        discountAmountUSD = Math.max(0, discountAmountUSD);
        const finalPriceUSD = Math.max(0, basePriceUSD - discountAmountUSD);

        return {
          isValid: true,
          coupon,
          discountAmountUSD: Number(discountAmountUSD.toFixed(2)),
          finalPriceUSD: Number(finalPriceUSD.toFixed(2)),
        };
      },

      resetCoupons: () => {
        set({ coupons: MOCK_COUPONS });
        broadcastSyncEvent('COUPONS_UPDATED', MOCK_COUPONS);
      },
    }),
    {
      name: 'codora_coupons_store_v3',
    }
  )
);

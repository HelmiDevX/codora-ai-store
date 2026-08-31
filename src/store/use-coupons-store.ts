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

interface CouponsStoreState {
  coupons: Record<string, Coupon>;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  toggleCouponActive: (code: string) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  incrementCouponUsage: (code: string, orderRevenueUSD: number) => void;
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
        set({ isLoading: true });
        try {
          const liveCoupons = await fetchCouponsFromSupabase();
          if (liveCoupons && Object.keys(liveCoupons).length > 0) {
            set({ 
              coupons: liveCoupons, 
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }

          if (!isCouponsSubscribed && typeof window !== 'undefined') {
            isCouponsSubscribed = true;
            subscribeToSupabaseChanges('coupons', async () => {
              const refreshed = await fetchCouponsFromSupabase();
              if (refreshed && Object.keys(refreshed).length > 0) {
                set({ coupons: refreshed });
              }
            });
          }
        } catch (err) {
          console.warn('[Coupons Store Hydration Error]', err);
          set({ isLoading: false });
        }
      },

      addCoupon: async (coupon) => {
        const cleanCode = coupon.code.trim().toUpperCase();
        const formattedCoupon = {
          ...coupon,
          code: cleanCode,
        };

        // 1. Optimistic update
        set((state) => ({
          coupons: {
            ...state.coupons,
            [cleanCode]: formattedCoupon,
          },
        }));

        // 2. Direct Supabase Query
        await upsertCouponToSupabase(formattedCoupon);
      },

      toggleCouponActive: async (code) => {
        const cleanCode = code.trim().toUpperCase();
        let targetCoupon: Coupon | undefined;

        set((state) => {
          const existing = state.coupons[cleanCode];
          if (!existing) return state;
          targetCoupon = {
            ...existing,
            isActive: !existing.isActive,
          };
          return {
            coupons: {
              ...state.coupons,
              [cleanCode]: targetCoupon,
            },
          };
        });

        if (targetCoupon) {
          await upsertCouponToSupabase(targetCoupon);
        }
      },

      deleteCoupon: async (code) => {
        const cleanCode = code.trim().toUpperCase();

        // 1. Optimistic update
        set((state) => {
          const updated = { ...state.coupons };
          delete updated[cleanCode];
          return { coupons: updated };
        });

        // 2. Direct Supabase Query
        await deleteCouponFromSupabase(cleanCode);
      },

      incrementCouponUsage: (code, orderRevenueUSD) => {
        const cleanCode = code.trim().toUpperCase();
        set((state) => {
          const existing = state.coupons[cleanCode];
          if (!existing) return state;
          return {
            coupons: {
              ...state.coupons,
              [cleanCode]: {
                ...existing,
                usedCount: (existing.usedCount || 0) + 1,
                totalRevenueUSD: (existing.totalRevenueUSD || 0) + orderRevenueUSD,
              },
            },
          };
        });
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
      },
    }),
    {
      name: 'codora_coupons_store_v2',
    }
  )
);

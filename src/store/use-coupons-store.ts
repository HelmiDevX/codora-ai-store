import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coupon, CouponValidationResult } from '@/types/coupon';
import { MOCK_COUPONS } from '@/data/mock-coupons';

interface CouponsStoreState {
  coupons: Record<string, Coupon>;
  addCoupon: (coupon: Coupon) => void;
  toggleCouponActive: (code: string) => void;
  deleteCoupon: (code: string) => void;
  incrementCouponUsage: (code: string, orderRevenueUSD: number) => void;
  validateCouponCode: (code: string, basePriceUSD: number) => CouponValidationResult;
  resetCoupons: () => void;
}

export const useCouponsStore = create<CouponsStoreState>()(
  persist(
    (set, get) => ({
      coupons: MOCK_COUPONS,

      addCoupon: (coupon) => {
        const cleanCode = coupon.code.trim().toUpperCase();
        set((state) => ({
          coupons: {
            ...state.coupons,
            [cleanCode]: {
              ...coupon,
              code: cleanCode,
            },
          },
        }));
      },

      toggleCouponActive: (code) => {
        const cleanCode = code.trim().toUpperCase();
        set((state) => {
          const existing = state.coupons[cleanCode];
          if (!existing) return state;
          return {
            coupons: {
              ...state.coupons,
              [cleanCode]: {
                ...existing,
                isActive: !existing.isActive,
              },
            },
          };
        });
      },

      deleteCoupon: (code) => {
        const cleanCode = code.trim().toUpperCase();
        set((state) => {
          const updated = { ...state.coupons };
          delete updated[cleanCode];
          return { coupons: updated };
        });
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
          // fixed or fixed_usd
          discountAmountUSD = Number(coupon.discountValue);
        }

        // Never exceed base price (cannot drop below 0)
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
      name: 'codora_coupons_store_v1',
    }
  )
);

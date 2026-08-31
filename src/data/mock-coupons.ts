import { Coupon, CouponValidationResult } from '@/types/coupon';

export const MOCK_COUPONS: Record<string, Coupon> = {
  AI2026: {
    code: 'AI2026',
    discountType: 'percentage',
    discountValue: 15,
    affiliateName: 'حملة إطلاق كودورا AI الرسمية',
    usedCount: 42,
    totalRevenueUSD: 840.00,
    isActive: true,
  },
  VIP10: {
    code: 'VIP10',
    discountType: 'percentage',
    discountValue: 10,
    affiliateName: 'المؤثر م. يحيى التقني (YouTube)',
    usedCount: 28,
    totalRevenueUSD: 590.00,
    isActive: true,
  },
  PROMO5: {
    code: 'PROMO5',
    discountType: 'fixed_usd',
    discountValue: 5,
    affiliateName: 'مجتمع مطوري اليمن (Telegram)',
    usedCount: 19,
    totalRevenueUSD: 475.00,
    isActive: true,
  },
};

/**
 * Validates a coupon code against a base USD price and returns calculated discounts.
 */
export function validateCoupon(code: string, basePriceUSD: number): CouponValidationResult {
  const cleanCode = code.trim().toUpperCase();
  const coupon = MOCK_COUPONS[cleanCode];

  if (!coupon || !coupon.isActive) {
    return {
      isValid: false,
      discountAmountUSD: 0,
      finalPriceUSD: basePriceUSD,
      errorMessage: 'Invalid or expired coupon code.',
      errorMessageAr: 'كود الخصم غير صالح أو منتهي الصلاحية',
    };
  }

  let discountAmountUSD = 0;

  if (coupon.discountType === 'percentage') {
    discountAmountUSD = (basePriceUSD * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed_usd') {
    discountAmountUSD = Math.min(coupon.discountValue, basePriceUSD);
  }

  const finalPriceUSD = Math.max(0, basePriceUSD - discountAmountUSD);

  return {
    isValid: true,
    coupon,
    discountAmountUSD: Number(discountAmountUSD.toFixed(2)),
    finalPriceUSD: Number(finalPriceUSD.toFixed(2)),
  };
}

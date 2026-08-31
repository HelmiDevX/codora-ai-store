export type DiscountType = 'percentage' | 'fixed_usd';

export interface Coupon {
  code: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15% or 5 for 5 USD
  affiliateName?: string;
  minOrderUSD?: number;
  maxDiscountUSD?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  totalRevenueUSD: number;
  applicableCategory?: string;
  isActive: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmountUSD: number;
  finalPriceUSD: number;
  errorMessage?: string;
  errorMessageAr?: string;
}

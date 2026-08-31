import { create } from 'zustand';
import { Product } from '@/types/product';
import { CustomerInfo, PaymentMethod, PaymentProof, OrderPayload } from '@/types/order';
import { Coupon } from '@/types/coupon';

interface CheckoutStoreState {
  isOpen: boolean;
  selectedProduct: Product | null;
  customerName: string;
  paymentMethod: PaymentMethod;
  couponCode: string;
  appliedCoupon: Coupon | null;
  discountUSD: number;
  paymentProof: PaymentProof | null;
  isSubmitting: boolean;

  // Actions
  openCheckout: (product: Product) => void;
  closeCheckout: () => void;
  setCustomerName: (name: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCouponData: (code: string, coupon: Coupon | null, discountUSD: number) => void;
  removeCoupon: () => void;
  setPaymentProof: (proof: PaymentProof | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  isOpen: false,
  selectedProduct: null,
  customerName: '',
  paymentMethod: 'kuraimi',
  couponCode: '',
  appliedCoupon: null,
  discountUSD: 0,
  paymentProof: null,
  isSubmitting: false,

  openCheckout: (product: Product) => {
    set({
      isOpen: true,
      selectedProduct: product,
      customerName: '',
      paymentMethod: 'kuraimi',
      couponCode: '',
      appliedCoupon: null,
      discountUSD: 0,
      paymentProof: null,
      isSubmitting: false,
    });
  },

  closeCheckout: () => {
    set({ isOpen: false });
  },

  setCustomerName: (name: string) => {
    set({ customerName: name });
  },

  setPaymentMethod: (paymentMethod: PaymentMethod) => {
    set({ paymentMethod });
  },

  setCouponData: (couponCode: string, appliedCoupon: Coupon | null, discountUSD: number) => {
    set({ couponCode, appliedCoupon, discountUSD });
  },

  removeCoupon: () => {
    set({ couponCode: '', appliedCoupon: null, discountUSD: 0 });
  },

  setPaymentProof: (paymentProof: PaymentProof | null) => {
    set({ paymentProof });
  },

  setIsSubmitting: (isSubmitting: boolean) => {
    set({ isSubmitting });
  },

  resetCheckout: () => {
    set({
      isOpen: false,
      selectedProduct: null,
      customerName: '',
      paymentMethod: 'kuraimi',
      couponCode: '',
      appliedCoupon: null,
      discountUSD: 0,
      paymentProof: null,
      isSubmitting: false,
    });
  },
}));

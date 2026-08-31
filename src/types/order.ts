import { CurrencyCode } from './currency';
import { Product } from './product';

export type OrderChannel = 'whatsapp' | 'telegram' | 'instagram';

export type OrderStatus = 
  | 'contacted'  // ⏳ قيد التواصل
  | 'completed'  // ✅ تم التسليم
  | 'canceled'   // ❌ ملغي
  | 'verifying'
  | 'pending';

export type PaymentMethod = 
  | 'kuraimi'
  | 'jeeb'
  | 'qutaibi'
  | 'binance_usdt';

export interface CustomerInfo {
  fullName: string;
  email?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  notes?: string;
}

export interface PaymentProof {
  fileName?: string;
  receiptImageBase64?: string;
  receiptImageUrl?: string;
  submittedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPriceUSD: number;
}

export interface OrderPayload {
  id: string;
  orderNumber: string;
  item: OrderItem;
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  currency: CurrencyCode;
  exchangeRateUsed: number;
  originalTotalUSD: number;
  discountUSD: number;
  finalTotalUSD: number;
  finalTotalConverted: number;
  couponCode?: string;
  proof?: PaymentProof;
  channel: OrderChannel;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodDetail {
  id: PaymentMethod;
  nameAr: string;
  nameEn: string;
  accountType: 'account' | 'phone' | 'crypto_address';
  accountValue: string;
  beneficiaryName?: string;
  badge: string;
  iconName: 'Building2' | 'Wallet' | 'Landmark' | 'CircleDollarSign';
}

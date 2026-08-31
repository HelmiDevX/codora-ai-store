import { OrderPayload } from '@/types/order';
import { formatCurrency } from './currency';

export interface StoreContactConfig {
  whatsappNumber: string; // e.g. "967770000000"
  telegramUsername: string; // e.g. "AiStoreSupport"
  instagramUsername: string; // e.g. "aistore.yemen"
}

export const DEFAULT_STORE_CONTACTS: StoreContactConfig = {
  whatsappNumber: '967770000000',
  telegramUsername: 'AiStoreSupport',
  instagramUsername: 'aistore.yemen',
};

const PAYMENT_NAMES: Record<string, string> = {
  kuraimi: 'بنك الكريمي (Kuraimi Bank)',
  jeeb: 'محفظة جيب (Jeeb Wallet)',
  qutaibi: 'بنك القطيبي (Al-Qutaibi)',
  binance_usdt: 'بايننس (Binance USDT - TRC20)',
};

/**
 * Builds a structured Arabic invoice and order message for messaging channels.
 */
export function buildOrderSummaryMessage(order: OrderPayload): string {
  const formattedFinalPrice = formatCurrency(order.finalTotalConverted, order.currency, 'ar');
  const usdPrice = `$${order.finalTotalUSD.toFixed(2)} USD`;
  const paymentName = PAYMENT_NAMES[order.paymentMethod] || order.paymentMethod;

  return `✨ *طلب شراء جديد - متجر كودورا AI*
══════════════════════
📌 *رقم الطلب:* #${order.orderNumber}
👤 *الاسم الكريم:* ${order.customer.fullName}
📦 *المنتج:* ${order.item.product.titleAr}
⏱️ *المدة:* ${order.item.product.metadata?.durationAr || order.item.product.tier}
💰 *المبلغ المستحق:* ${formattedFinalPrice} (${usdPrice})
${order.couponCode ? `🎟️ *كوبون الخصم:* ${order.couponCode} (تم تطبيق الخصم)` : ''}
💳 *طريقة الدفع:* ${paymentName}
${order.proof?.fileName ? `📎 *إشعار التحويل:* تم إرفاق سند الدفع بنجاح` : ''}
══════════════════════
🚀 _يرجى مراجعة الطلب وتأكيد التفعيل الفوري للحساب._`;
}

/**
 * Builds pre-filled WhatsApp deep link URL.
 */
export function getWhatsAppDeepLink(
  order: OrderPayload,
  contacts: StoreContactConfig = DEFAULT_STORE_CONTACTS
): string {
  const message = buildOrderSummaryMessage(order);
  const cleanNumber = contacts.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds Telegram deep link URL.
 */
export function getTelegramDeepLink(
  order: OrderPayload,
  contacts: StoreContactConfig = DEFAULT_STORE_CONTACTS
): string {
  const message = buildOrderSummaryMessage(order);
  return `https://t.me/${contacts.telegramUsername}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds Instagram profile direct URL.
 */
export function getInstagramProfileUrl(
  contacts: StoreContactConfig = DEFAULT_STORE_CONTACTS
): string {
  return `https://instagram.com/${contacts.instagramUsername}`;
}

'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Tag, 
  Sparkles, 
  Send, 
  MessageCircle, 
  Instagram, 
  AlertCircle, 
  Building2, 
  Wallet, 
  Landmark, 
  CircleDollarSign, 
  X, 
  CreditCard,
  Loader2
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProofUploader } from './proof-uploader';
import { useCheckoutStore } from '@/store/use-checkout-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { useOrdersStore } from '@/store/use-orders-store';
import { useCouponsStore } from '@/store/use-coupons-store';
import { PaymentMethod, OrderPayload, PaymentMethodDetail, OrderChannel } from '@/types/order';
import { Coupon } from '@/types/coupon';
import { generateOrderNumber } from '@/lib/utils';
import { 
  getWhatsAppDeepLink, 
  getTelegramDeepLink, 
  getInstagramProfileUrl, 
  buildOrderSummaryMessage 
} from '@/lib/deep-links';
import { soundManager } from '@/lib/audio';
import { 
  uploadReceiptImage, 
  syncOrderToSupabase, 
  fetchCouponFromSupabase, 
  incrementCouponUsageInSupabase,
  generateUUID 
} from '@/lib/supabase';

const ICONS_MAP = {
  Building2,
  Wallet,
  Landmark,
  CircleDollarSign,
};

export const CheckoutModal: React.FC = () => {
  const { 
    isOpen, 
    closeCheckout, 
    selectedProduct, 
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    appliedCoupon,
    discountUSD,
    setCouponData,
    removeCoupon,
    paymentProof,
    setPaymentProof
  } = useCheckoutStore();

  const { activeCurrency, rates, formatPrice, convertPrice } = useCurrencyStore();
  const { paymentAccounts, whatsappNumber, telegramUsername, instagramUsername } = useStoreSettings();
  const { addOrder } = useOrdersStore();
  const { validateCouponCode, incrementCouponUsage } = useCouponsStore();

  // Dynamic Payment Options based on persistent Store Settings
  const dynamicPaymentOptions: PaymentMethodDetail[] = [
    {
      id: 'kuraimi',
      nameAr: 'بنك الكريمي (Kuraimi)',
      nameEn: 'Kuraimi Bank',
      accountType: 'account',
      accountValue: paymentAccounts?.kuraimi?.accountNumber || '3006500012',
      beneficiaryName: paymentAccounts?.kuraimi?.beneficiaryName || 'متجر الذكاء الاصطناعي',
      badge: 'اليمن',
      iconName: 'Building2',
    },
    {
      id: 'jeeb',
      nameAr: 'محفظة جيب (Jeeb)',
      nameEn: 'Jeeb Wallet',
      accountType: 'phone',
      accountValue: paymentAccounts?.jeeb?.phoneNumber || '777123456',
      beneficiaryName: paymentAccounts?.jeeb?.beneficiaryName || 'متجر كودورا AI',
      badge: 'اليمن',
      iconName: 'Wallet',
    },
    {
      id: 'qutaibi',
      nameAr: 'بنك القطيبي (Al-Qutaibi)',
      nameEn: 'Al-Qutaibi Bank',
      accountType: 'account',
      accountValue: paymentAccounts?.qutaibi?.accountNumber || '12345678',
      beneficiaryName: paymentAccounts?.qutaibi?.beneficiaryName || 'مؤسسة كودورا للبرمجيات',
      badge: 'اليمن',
      iconName: 'Landmark',
    },
    {
      id: 'binance_usdt',
      nameAr: 'بايننس (USDT - TRC20)',
      nameEn: 'Binance USDT (TRC-20)',
      accountType: 'crypto_address',
      accountValue: paymentAccounts?.binance_usdt?.walletAddress || 'TXYZ1234567890USDTNetwork',
      beneficiaryName: paymentAccounts?.binance_usdt?.network || 'Tron (TRC-20)',
      badge: 'دولي / فوري',
      iconName: 'CircleDollarSign',
    },
  ];

  // Local state
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ isSuccess: boolean; message: string } | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedProduct) return null;

  const basePriceUSD = selectedProduct.priceUSD || 0;
  const safeDiscountUSD = discountUSD || 0;
  const finalPriceUSD = Math.max(0, basePriceUSD - safeDiscountUSD);
  
  // Format prices dynamically across all active currencies
  const formattedFinalPrice = formatPrice(finalPriceUSD, 'ar');
  const formattedOriginalPrice = safeDiscountUSD > 0 ? formatPrice(basePriceUSD, 'ar') : null;
  const formattedSavings = safeDiscountUSD > 0 ? formatPrice(safeDiscountUSD, 'ar') : null;

  const selectedPayment = dynamicPaymentOptions.find((p) => p.id === paymentMethod) || dynamicPaymentOptions[0];

  // Handle Dynamic Coupon Application (Supabase + Local Dynamic Store + Case/Whitespace Insensitive)
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput || !couponInput.trim()) return;

    const cleanCode = couponInput.trim().toUpperCase();
    setIsCheckingCoupon(true);
    setCouponFeedback(null);

    try {
      // 1. First attempt dynamic lookup from Supabase 'coupons' table
      let matchedCoupon: Coupon | null = null;
      try {
        matchedCoupon = await fetchCouponFromSupabase(cleanCode);
      } catch (cloudErr) {
        console.warn('[Supabase Coupon Lookup Skip]', cloudErr);
      }

      if (matchedCoupon) {
        // Validate Supabase coupon conditions
        if (!matchedCoupon.isActive) {
          setCouponFeedback({
            isSuccess: false,
            message: 'هذا الكوبون معطل حالياً من قِبل الإدارة',
          });
          setIsCheckingCoupon(false);
          return;
        }

        // Check expiration
        if (matchedCoupon.expiresAt) {
          const expiryDate = new Date(matchedCoupon.expiresAt);
          if (!isNaN(expiryDate.getTime()) && new Date() > expiryDate) {
            setCouponFeedback({
              isSuccess: false,
              message: 'عذراً، انتهت صلاحية هذا الكوبون',
            });
            setIsCheckingCoupon(false);
            return;
          }
        }

        // Check max uses limit
        if (matchedCoupon.usageLimit && (matchedCoupon.usedCount || 0) >= matchedCoupon.usageLimit) {
          setCouponFeedback({
            isSuccess: false,
            message: 'تم استنفاد الحد الأقصى لاستخدام هذا الكوبون',
          });
          setIsCheckingCoupon(false);
          return;
        }

        // Calculate discount accurately
        let calcDiscount = 0;
        if (matchedCoupon.discountType === 'percentage') {
          calcDiscount = (basePriceUSD * Number(matchedCoupon.discountValue)) / 100;
        } else {
          calcDiscount = Number(matchedCoupon.discountValue);
        }
        calcDiscount = Math.min(calcDiscount, basePriceUSD);
        calcDiscount = Math.max(0, calcDiscount);

        setCouponData(matchedCoupon.code, matchedCoupon, Number(calcDiscount.toFixed(2)));
        setCouponFeedback({
          isSuccess: true,
          message: `تم تطبيق كود الخصم (${matchedCoupon.code}) بنجاح! 🎉`,
        });
        setErrorMessage(null);
        soundManager.playNotificationPing();
        setIsCheckingCoupon(false);
        return;
      }

      // 2. Fallback to dynamic local coupons store
      const localResult = validateCouponCode(cleanCode, basePriceUSD);

      if (localResult.isValid && localResult.coupon) {
        setCouponData(localResult.coupon.code, localResult.coupon, localResult.discountAmountUSD);
        setCouponFeedback({
          isSuccess: true,
          message: `تم تطبيق كود الخصم (${localResult.coupon.code}) بنجاح! 🎉`,
        });
        setErrorMessage(null);
        soundManager.playNotificationPing();
      } else {
        setCouponFeedback({
          isSuccess: false,
          message: localResult.errorMessageAr || 'كود الخصم غير صالح أو منتهي الصلاحية',
        });
      }
    } catch (err) {
      console.warn('[Coupon Application Error]', err);
      setCouponFeedback({
        isSuccess: false,
        message: 'حدث خطأ أثناء فحص كود الخصم',
      });
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponFeedback(null);
  };

  // Copy Account Number
  const handleCopyAccount = () => {
    try {
      if (selectedPayment?.accountValue) {
        navigator.clipboard.writeText(selectedPayment.accountValue);
        setCopiedAccount(true);
        soundManager.playNotificationPing();
        setTimeout(() => setCopiedAccount(false), 2500);
      }
    } catch (err) {
      console.warn('[Clipboard Warning]', err);
    }
  };

  // Safe Order Creation with Supabase Storage and DB try-catch wrappers
  const processAndRecordOrder = async (channel: OrderChannel): Promise<OrderPayload | null> => {
    if (!customerName || !customerName.trim()) {
      setErrorMessage('يرجى كتابة الاسم الكريم قبل إتمام الطلب');
      return null;
    }

    if (!paymentProof || (!paymentProof.receiptImageBase64 && !paymentProof.receiptImageUrl)) {
      setErrorMessage('يرجى إرفاق صورة سند التحويل أو إشعار الدفع لإتمام الطلب 📎');
      return null;
    }
    setErrorMessage(null);

    const orderNumber = generateOrderNumber();
    let finalReceiptUrl = paymentProof?.receiptImageUrl || paymentProof?.receiptImageBase64;

    // 1. Try uploading receipt to Supabase Storage if base64 exists
    if (paymentProof?.receiptImageBase64) {
      try {
        const uploadRes = await uploadReceiptImage(
          paymentProof.receiptImageBase64,
          paymentProof.fileName || 'receipt.png'
        );
        if (uploadRes.url) {
          finalReceiptUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.warn('[Receipt Upload Fallback] Cloud upload failed, falling back to local image:', uploadErr);
      }
    }

    const newOrder: OrderPayload = {
      id: generateUUID(),
      orderNumber,
      item: {
        product: selectedProduct,
        quantity: 1,
        unitPriceUSD: selectedProduct.priceUSD,
      },
      customer: {
        fullName: customerName.trim(),
      },
      paymentMethod,
      currency: activeCurrency,
      exchangeRateUsed: rates?.[activeCurrency] || 1,
      originalTotalUSD: basePriceUSD,
      discountUSD: safeDiscountUSD,
      finalTotalUSD: finalPriceUSD,
      finalTotalConverted: convertPrice(finalPriceUSD),
      couponCode: appliedCoupon?.code,
      proof: paymentProof
        ? {
            fileName: paymentProof.fileName,
            receiptImageUrl: finalReceiptUrl,
            receiptImageBase64: paymentProof.receiptImageBase64,
            submittedAt: new Date().toISOString(),
          }
        : undefined,
      channel,
      status: 'contacted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Track Coupon Usage in Dynamic Store & Supabase
    if (appliedCoupon?.code) {
      try {
        incrementCouponUsage(appliedCoupon.code, finalPriceUSD);
        incrementCouponUsageInSupabase(appliedCoupon.code, finalPriceUSD).catch((supErr) => {
          console.warn('[Supabase Coupon Increment Skip]', supErr);
        });
      } catch (couponUsageErr) {
        console.warn('[Coupon Usage Track Warning]', couponUsageErr);
      }
    }

    // 3. Save locally into persistent Zustand / LocalStorage store
    try {
      addOrder(newOrder);
    } catch (localStoreErr) {
      console.warn('[Local Storage Store Warning]', localStoreErr);
    }

    // 4. Play sound effect
    try {
      soundManager.playChannelSound(channel);
    } catch (audioErr) {
      console.warn('[Audio Warning]', audioErr);
    }

    // 5. Sync asynchronously to Supabase Database (Non-blocking with try-catch)
    syncOrderToSupabase(newOrder).catch((dbErr) => {
      console.warn('[Supabase Background Sync Warning]', dbErr);
    });

    return newOrder;
  };

  // Channel 1: WhatsApp
  const handleWhatsAppCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const order = await processAndRecordOrder('whatsapp');
      if (!order) {
        setIsProcessing(false);
        return;
      }

      const url = getWhatsAppDeepLink(order, {
        whatsappNumber: whatsappNumber || '967778401415',
        telegramUsername: telegramUsername || 'ai_store_support',
        instagramUsername: instagramUsername || 'aistore_ye',
      });

      window.open(url, '_blank');
      closeCheckout();
    } catch (err) {
      console.error('[WhatsApp Checkout Error]', err);
      setErrorMessage('حدث خطأ أثناء تجهيز الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Channel 2: Telegram
  const handleTelegramCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const order = await processAndRecordOrder('telegram');
      if (!order) {
        setIsProcessing(false);
        return;
      }

      const url = getTelegramDeepLink(order, {
        whatsappNumber: whatsappNumber || '967770000000',
        telegramUsername: telegramUsername || 'ai_store_support',
        instagramUsername: instagramUsername || 'aistore_ye',
      });

      window.open(url, '_blank');
      closeCheckout();
    } catch (err) {
      console.error('[Telegram Checkout Error]', err);
      setErrorMessage('حدث خطأ أثناء تجهيز الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Channel 3: Instagram Direct
  const handleInstagramCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const order = await processAndRecordOrder('instagram');
      if (!order) {
        setIsProcessing(false);
        return;
      }

      const message = buildOrderSummaryMessage(order);
      try {
        await navigator.clipboard.writeText(message);
      } catch (clipErr) {
        console.warn('[Clipboard Error]', clipErr);
      }

      setToastMessage('تم تسجيل طلبك ونسخ الفاتورة! جارٍ نقلك لمحادثة إنستغرام...');

      setTimeout(() => {
        setToastMessage(null);
        const url = getInstagramProfileUrl({
          whatsappNumber: whatsappNumber || '967770000000',
          telegramUsername: telegramUsername || 'ai_store_support',
          instagramUsername: instagramUsername || 'aistore_ye',
        });
        window.open(url, '_blank');
        closeCheckout();
      }, 1500);
    } catch (err) {
      console.error('[Instagram Checkout Error]', err);
      setErrorMessage('حدث خطأ أثناء تجهيز الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeCheckout}
      maxWidth="md"
      title="إتمام الطلب السريع ⚡"
      description="خطوات بسيطة وسريعة لتأكيد طلبك وتفعيل حسابك مباشرة"
    >
      <div className="space-y-4 sm:space-y-5 w-full">
        {/* Error Alert if Validation Fails */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold animate-shake">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Product Summary Header Card (Mobile-First Layout) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold flex-shrink-0">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-base leading-snug">
                {selectedProduct.titleAr}
              </h4>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                <Badge variant="purple" size="sm">
                  {selectedProduct.metadata?.durationAr || selectedProduct.tier}
                </Badge>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                  {selectedProduct.metadata?.platform || selectedProduct.category}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 flex items-center justify-between sm:block">
            <div className="text-[11px] sm:text-xs text-slate-400">الإجمالي المستحق:</div>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-lg sm:text-2xl font-black text-emerald-400">
                  {formattedFinalPrice}
                </span>
                {formattedOriginalPrice && (
                  <span className="text-[10px] sm:text-xs text-slate-500 line-through">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                (${finalPriceUSD.toFixed(2)} USD)
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Customer Info & Dynamic Coupon Engine */}
        <div className="space-y-3 p-3 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800 w-full">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
            <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] flex-shrink-0">
              1
            </span>
            بيانات العميل وكوبون الخصم
          </div>

          {/* Customer Name Input (py-3 text-base sm:text-sm to prevent iOS zoom) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              الاسم الكريم (Customer Name) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: محمد عبدالله"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-base sm:text-sm"
            />
          </div>

          {/* Dynamic Coupon Engine Input & Savings Badge */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-indigo-400" />
                كود الخصم (Coupon Code)
              </span>
              <span className="text-[10px] text-indigo-300">تحقق ديناميكي</span>
            </label>

            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="أدخل كود الخصم (AI2026)..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white uppercase font-mono placeholder:text-slate-500 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-base sm:text-sm"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="primary" 
                  disabled={isCheckingCoupon}
                  className="text-xs px-4 h-11 flex-shrink-0"
                >
                  {isCheckingCoupon ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'تطبيق'
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm" className="font-mono font-bold">
                    {appliedCoupon.code}
                  </Badge>
                  <span className="text-emerald-300 font-semibold text-[11px] sm:text-xs">
                    وفرت {formattedSavings}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  title="إلغاء الكود"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {couponFeedback && !appliedCoupon && (
              <p
                className={`text-[11px] mt-1.5 ${
                  couponFeedback.isSuccess ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {couponFeedback.message}
              </p>
            )}
          </div>
        </div>

        {/* STEP 2: Payment Method Selector & One-Click Copy */}
        <div className="space-y-3 p-3 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800 w-full">
          <div className="text-xs font-bold text-slate-200 flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] flex-shrink-0">
                2
              </span>
              اختر وسيلة الدفع
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              المطلوب: {formattedFinalPrice}
            </span>
          </div>

          {/* Payment Tabs: 1 col on xs, 2 cols on sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {dynamicPaymentOptions.map((method) => {
              const isSelected = paymentMethod === method.id;
              const Icon = ICONS_MAP[method.iconName] || CreditCard;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setCopiedAccount(false);
                  }}
                  className={`flex items-start justify-between p-2.5 sm:p-3 rounded-xl border text-right transition-all w-full active:scale-[0.99] ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-xs text-slate-100 truncate">{method.nameAr}</div>
                      <div className="text-[10px] text-slate-400 truncate">{method.nameEn}</div>
                    </div>
                  </div>
                  <Badge variant={isSelected ? 'purple' : 'outline'} size="sm" className="flex-shrink-0 text-[10px]">
                    {method.badge}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Selected Method Details & One-Click Copy Box */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950 border border-indigo-500/20 space-y-2.5 w-full">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-indigo-300 text-[11px] sm:text-xs">
                بيانات التحويل ({selectedPayment.nameAr}):
              </span>
              {selectedPayment.beneficiaryName && (
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  باسم: <strong className="text-slate-200">{selectedPayment.beneficiaryName}</strong>
                </span>
              )}
            </div>

            {/* Account Number Box with Copy Action */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono w-full">
              <span className="text-xs sm:text-sm font-bold text-emerald-400 select-all break-all" dir="ltr">
                {selectedPayment.accountValue}
              </span>

              <Button
                type="button"
                variant={copiedAccount ? 'secondary' : 'glass'}
                size="sm"
                onClick={handleCopyAccount}
                className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 h-8 gap-1 flex-shrink-0"
              >
                {copiedAccount ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 3: Payment Proof Uploader */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800 w-full">
          <div className="text-xs font-bold text-slate-200 flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] flex-shrink-0">
                3
              </span>
              <span>إرفاق سند الدفع (Proof of Payment)</span>
              <span className="text-red-400 font-bold">*</span>
            </div>
            <Badge variant="warning" size="sm" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/20">
              إجباري
            </Badge>
          </div>

          <ProofUploader
            proof={paymentProof}
            hasError={Boolean(errorMessage && (!paymentProof || (!paymentProof.receiptImageBase64 && !paymentProof.receiptImageUrl)))}
            onProofChange={(proof) => {
              setPaymentProof(proof);
              if (proof && errorMessage) {
                setErrorMessage(null);
              }
            }}
          />
        </div>

        {/* STEP 4: Smart Conversion Buttons (3 Channels) */}
        <div className="space-y-2.5 pt-1 w-full">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] flex-shrink-0">
              4
            </span>
            اختر قناة الإرسال والتأكيد:
          </div>

          {/* Toast Alert */}
          {toastMessage && (
            <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 🟢 WhatsApp */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleWhatsAppCheckout}
            className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm">إتمام الطلب عبر واتساب (WhatsApp)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] bg-white/10 px-2 py-0.5 rounded-md font-normal flex-shrink-0">
              تفعيل فوري ⚡
            </span>
          </button>

          {/* 🔵 Telegram */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleTelegramCheckout}
            className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-sky-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm">إتمام الطلب عبر تليجرام (Telegram)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] bg-white/10 px-2 py-0.5 rounded-md font-normal flex-shrink-0">
              دعم آلي 🤖
            </span>
          </button>

          {/* 🟣 Instagram */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleInstagramCheckout}
            className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-pink-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Instagram className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm">إتمام الطلب عبر إنستغرام (Direct)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] bg-white/10 px-2 py-0.5 rounded-md font-normal flex-shrink-0">
              نسخ الفاتورة 📋
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

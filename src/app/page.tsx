'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProductCategory, Product } from '@/types/product';
import { CategoryFilter } from '@/components/storefront/category-filter';
import { ProductCard } from '@/components/storefront/product-card';
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { useCheckoutStore } from '@/store/use-checkout-store';
import { soundManager } from '@/lib/audio';
import { 
  ShieldCheck, 
  Zap, 
  Headphones, 
  Wallet, 
  Layers, 
  Search,
  CheckCircle2,
  ChevronDown,
  Star,
  MessageCircle,
  HelpCircle,
  ArrowDown,
  Flame,
  Check,
  X,
  Sparkles,
  Copy,
  Building2,
  ArrowUp,
  CreditCard,
  CircleDollarSign,
  Landmark,
  BadgeCheck,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FAQS = [
  {
    q: 'كيف يتم تسليم وتفعيل الحساب بعد الدفع؟',
    a: 'يتم تسليم الحساب فور إتمام التحويل ومراجعة الإشعار. تصلك بيانات تسجيل الدخول أو دعوة رسمية على بريدك الإلكتروني مع تعليمات الاستخدام الكاملة.',
  },
  {
    q: 'هل الاشتراكات والحسابات رسمية ومضمونة؟',
    a: 'نعم، جميع الاشتراكات والحسابات أصلية ومدفوعة من المنصات الرسمية (OpenAI, Anthropic, Cursor, Midjourney, Canva) مع ضمان استبدال طوال مدة الاشتراك.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'نوفر الدفع بالريال اليمني عبر بنك الكريمي، محفظة جيب، ون كاش، بنك القطيبي، بالإضافة إلى التحويل بالريال السعودي والدولار وعملة USDT.',
  },
  {
    q: 'هل أحتاج إلى بطاقة بنكية دولية للشراء؟',
    a: 'لا، يمكنك الدفع عبر حسابك البنكي المحلي أو محفظتك الإلكترونية دون الحاجة لبطاقات ائتمان أجنبية ورسوم تحويل دولية.',
  },
  {
    q: 'كيف يتم التعامل مع الدعم الفني في حال وجود استفسار؟',
    a: 'فريق الدعم متواجد عبر الواتساب والتيليجرام للرد على استفساراتكم ومساعدتكم طوال فترة الاشتراك.',
  },
];

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedBankKey, setCopiedBankKey] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeCompareTool, setActiveCompareTool] = useState<'chatgpt' | 'claude' | 'cursor'>('chatgpt');

  const { products, isLoading, isSyncedWithSupabase, fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency, activeCurrency, formatPrice } = useCurrencyStore();
  const { fetchInitialData: fetchSettings, whatsappNumber, paymentAccounts } = useStoreSettings();
  const { openCheckout } = useCheckoutStore();

  // Fresh data hydration on mount
  useEffect(() => {
    fetchProducts();
    fetchCurrency();
    fetchSettings();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, fetchCurrency, fetchSettings]);

  // Dynamic Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const cleanSearch = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !cleanSearch ||
        product.titleAr.toLowerCase().includes(cleanSearch) ||
        product.title.toLowerCase().includes(cleanSearch) ||
        (product.shortDescriptionAr && product.shortDescriptionAr.toLowerCase().includes(cleanSearch)) ||
        (product.metadata?.platform && product.metadata.platform.toLowerCase().includes(cleanSearch));

      return matchesCategory && matchesSearch && product.isAvailable;
    });

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.priceUSD - b.priceUSD);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.priceUSD - a.priceUSD);
    } else {
      list.sort((a, b) => (a.metadata?.popularRank || 99) - (b.metadata?.popularRank || 99));
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Spotlight Products (Top 3)
  const spotlightProducts = useMemo(() => {
    return products.filter((p) => p.isPopular && p.isAvailable).slice(0, 3);
  }, [products]);

  // Product Counts per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: products.filter(p => p.isAvailable).length,
    };
    products.forEach(p => {
      if (p.isAvailable && p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const cleanWhatsapp = (whatsappNumber || '967778401415').replace(/[^0-9]/g, '');

  const scrollToCatalog = () => {
    soundManager.playSoftTap();
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    soundManager.playSoftTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedBankKey(key);
      soundManager.playNotificationPing();
      setTimeout(() => setCopiedBankKey(null), 2500);
    } catch (err) {
      console.warn('Clipboard copy error', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-16 sm:space-y-24 w-full overflow-x-hidden">
      {/* 1. Hero Section: Clean, Authoritative, & Interactive */}
      <section className="relative text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto pt-4 sm:pt-8 px-2">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-xl shadow-lg shadow-indigo-500/10 animate-in fade-in duration-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>اشتراكات رسمية وضمان شامل • دفع محلي ميسر عبر بنك الكريمي والمحافظ</span>
        </div>

        {/* Impactful Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.15]">
          اشتراكات وأدوات الذكاء الاصطناعي{' '}
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            بخيارات دفع محلية ميسرة
          </span>
        </h1>

        {/* Value Proposition */}
        <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto px-2">
          احصل على حساباتك الرسمية في <strong className="text-white">ChatGPT Plus</strong> و <strong className="text-white">Claude 3.5 Sonnet</strong> و <strong className="text-white">Cursor Pro</strong> و <strong className="text-white">Canva Pro</strong> مع ضمان شامل ودفع ميسر عبر الكريمي، جيب، ون كاش، أو USDT.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Button
            onClick={scrollToCatalog}
            size="lg"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 border border-indigo-400/30 group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span>استعراض الاشتراكات والأسعار</span>
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </div>
          </Button>

          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً كودورا، أود الاستفسار عن الاشتراكات المتوفرة.')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playSoftTap()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all active:scale-95 shadow-md"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span>تواصل مع خدمة العملاء</span>
          </a>
        </div>

        {/* 4 Value Pillars */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-slate-200">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <Zap className="h-5 w-5 text-amber-400 mb-1.5" />
            <span className="font-bold text-xs text-white">تسليم سريع وموثوق</span>
            <span className="text-[10px] text-slate-400 mt-0.5">بعد تأكيد التحويل</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <Wallet className="h-5 w-5 text-emerald-400 mb-1.5" />
            <span className="font-bold text-xs text-white">طرق دفع متعددة</span>
            <span className="text-[10px] text-slate-400 mt-0.5">كريمي، جيب، ون كاش، USDT</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 text-indigo-400 mb-1.5" />
            <span className="font-bold text-xs text-white">ضمان كامل طوال المدة</span>
            <span className="text-[10px] text-slate-400 mt-0.5">استبدال رسمي معتمد</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <Headphones className="h-5 w-5 text-pink-400 mb-1.5" />
            <span className="font-bold text-xs text-white">دعم فني متواصل</span>
            <span className="text-[10px] text-slate-400 mt-0.5">عبر الواتساب والتيليجرام</span>
          </div>
        </div>
      </section>

      {/* 2. REAL Dynamic Store Highlights Bar (100% Real Data) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 text-center space-y-1 backdrop-blur-md">
          <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
            {products.filter(p => p.isAvailable).length} خدمات
          </div>
          <div className="text-xs text-slate-400 font-medium">أدوات واشتراكات نشطة</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 text-center space-y-1 backdrop-blur-md">
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            3 عملات
          </div>
          <div className="text-xs text-slate-400 font-medium">YER • SAR • USD</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 text-center space-y-1 backdrop-blur-md">
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            4 قنوات
          </div>
          <div className="text-xs text-slate-400 font-medium">كريمي • جيب • ون كاش • USDT</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 text-center space-y-1 backdrop-blur-md">
          <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
            100%
          </div>
          <div className="text-xs text-slate-400 font-medium">ضمان رسمي واستبدال</div>
        </div>
      </section>

      {/* 3. Best-Seller Spotlight Section */}
      {spotlightProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold mb-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>الاشتراكات الأكثر طلباً</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                أدوات الذكاء الاصطناعي للمطورين والمصممين
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              حسابات أصلية وموثوقة مع ضمان مستمر
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {spotlightProducts.map((product) => (
              <ProductCard key={`spotlight-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Catalogue, Search & Interactive Filters Section */}
      <section id="catalog-section" className="space-y-6 sm:space-y-8 w-full pt-4">
        {/* Search & Category Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              قائمة الاشتراكات المتاحة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              اختر الخدمة المطلوبة واضغط على &quot;طلب الاشتراك&quot; لمتابعة عملية الدفع
            </p>
          </div>

          {/* Search Box & Sort Options */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="ابحث عن أداة أو اشتراك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                soundManager.playSoftTap();
                setSortBy(e.target.value as any);
              }}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="popular">الأكثر طلباً</option>
              <option value="price-low">الأقل سعراً</option>
              <option value="price-high">الأعلى سعراً</option>
            </select>
          </div>
        </div>

        {/* Live Search & Filter Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="w-full overflow-x-auto pb-1">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              productCounts={productCounts}
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-3xl bg-slate-900/30 border border-slate-800">
            <Search className="h-10 w-10 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300">لم يتم العثور على اشتراكات مطابقة للبحث</h3>
            <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً من الأعلى</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-1">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Interactive Payment Accounts Helper (1-Click Copy with sound & real data) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-400" />
              حسابات الدفع والتحويل المعتمدة
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك نسخ رقم الحساب بنقرة واحدة وتأكيد التحويل عند تقديم طلبك
            </p>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            دفع محلي ميسر
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Kuraimi */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-indigo-400" />
                بنك الكريمي
              </span>
              <span className="text-[10px] text-slate-400 font-mono">YER / SAR</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 select-all" dir="ltr">
              {paymentAccounts?.kuraimi?.accountNumber || '3006500012'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              باسم: {paymentAccounts?.kuraimi?.beneficiaryName || 'متجر الذكاء الاصطناعي'}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(paymentAccounts?.kuraimi?.accountNumber || '3006500012', 'kuraimi')}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 transition-all active:scale-95"
            >
              {copiedBankKey === 'kuraimi' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* Jeeb */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-purple-400" />
                محفظة جيب
              </span>
              <span className="text-[10px] text-slate-400 font-mono">YER</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 select-all" dir="ltr">
              {paymentAccounts?.jeeb?.phoneNumber || '777123456'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              باسم: {paymentAccounts?.jeeb?.beneficiaryName || 'متجر كودورا AI'}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(paymentAccounts?.jeeb?.phoneNumber || '777123456', 'jeeb')}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 transition-all active:scale-95"
            >
              {copiedBankKey === 'jeeb' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* Qutaibi */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-sky-400" />
                بنك القطيبي
              </span>
              <span className="text-[10px] text-slate-400 font-mono">YER</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 select-all" dir="ltr">
              {paymentAccounts?.qutaibi?.accountNumber || '12345678'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              باسم: {paymentAccounts?.qutaibi?.beneficiaryName || 'مؤسسة كودورا للبرمجيات'}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(paymentAccounts?.qutaibi?.accountNumber || '12345678', 'qutaibi')}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 transition-all active:scale-95"
            >
              {copiedBankKey === 'qutaibi' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* USDT */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4 text-emerald-400" />
                بايننس USDT
              </span>
              <span className="text-[10px] text-slate-400 font-mono">TRC-20</span>
            </div>
            <div className="font-mono text-[11px] font-bold text-emerald-400 select-all truncate" dir="ltr">
              {paymentAccounts?.binance_usdt?.walletAddress || 'TXYZ1234567890USDTNetwork'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              شبكة: {paymentAccounts?.binance_usdt?.network || 'Tron (TRC-20)'}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(paymentAccounts?.binance_usdt?.walletAddress || 'TXYZ1234567890USDTNetwork', 'usdt')}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 transition-all active:scale-95"
            >
              {copiedBankKey === 'usdt' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>نسخ العنوان</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 6. Comparison Section: Advantages */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>مميزات الشراء عبر منصة كودورا</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            لماذا يفضل المطورون والمصممون منصة كودورا؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            حلول ميسرة للحصول على أدوات الذكاء الاصطناعي دون تعقيدات الدفع الخارجي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {/* Codora Advantage */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-950/80 to-slate-950 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-base text-white">
                متجر كودورا للذكاء الاصطناعي
              </span>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                المعتمد
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>دفع محلي عبر بنك الكريمي، محفظة جيب، ون كاش، والقطيبي.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>تسليم سريع مع بيانات دخول جاهزة أو تفعيل على بريدك الإلكتروني.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>ضمان استبدال رسمي مستمر طوال فترة الاشتراك.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>دعم فني للمساعدة عبر الواتساب والتيليجرام.</span>
              </div>
            </div>
          </div>

          {/* Foreign Payment Difficulties */}
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-4 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-slate-400">
                الشراء المباشر بالبطاقات الأجنبية
              </span>
              <span className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
                صعوبات وعوائق
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>صعوبة توفر بطاقات فيزا/ماستركارد دولية مقبولة في المنصات العالمية.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>رسوم مصرفية إضافية وتحويل عملات غير اقتصادي.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>قيود الدفع الجغرافي لبعض الخدمات العالمية.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>غياب الدعم الفني المحلي المباشر.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works (4 Steps) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h3 className="text-xl sm:text-3xl font-black text-white">
            خطوات إتمام الطلب والتفعيل
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            خطوات واضحة وبسيطة لاستلام حسابك
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold font-mono flex items-center justify-center text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">اختر الاشتراك</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              حدد الأداة والمدة المطلوبة ثم اضغط على &quot;طلب الاشتراك&quot;.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold font-mono flex items-center justify-center text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">تحويل المبلغ</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              انسخ رقم الحساب وحوّل عبر الكريمي، جيب، ون كاش، أو USDT.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400 font-bold font-mono flex items-center justify-center text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">إرفاق الإشعار</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              أرفق صورة سند التحويل أو رقم الحوالة لتأكيد العملية.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold font-mono flex items-center justify-center text-sm">
              04
            </div>
            <h4 className="font-bold text-sm text-white">استلام الحساب</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تصلك بيانات الدخول أو الدعوة الرسمية على بريدك أو الواتساب.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold">
            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            كل ما تود معرفته قبل الطلب
          </h3>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 pt-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playSoftTap();
                    setOpenFaqIndex(isOpen ? null : idx);
                  }}
                  className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Help / Inquiries Banner */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-right">
          <h4 className="text-lg sm:text-2xl font-black text-white">
            هل لديك أي استفسار أو طلب خاص؟ 💬
          </h4>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            فريق خدمة العملاء جاهز للإجابة على جميع استفساراتكم وتوفير الاشتراكات الفردية والمؤسسية.
          </p>
        </div>

        <a
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً كودورا، أود الاستفسار عن الاشتراكات المتوفرة.')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => soundManager.playSoftTap()}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex-shrink-0"
        >
          <MessageCircle className="h-4 w-4" />
          <span>تواصل عبر واتساب</span>
        </a>
      </section>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 p-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/30 backdrop-blur-md transition-all active:scale-90 animate-in fade-in slide-in-from-bottom-4 duration-300"
          title="العودة لأعلى الصفحة"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}



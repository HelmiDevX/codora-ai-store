'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProductCategory, Product } from '@/types/product';
import { CategoryFilter } from '@/components/storefront/category-filter';
import { ProductCard } from '@/components/storefront/product-card';
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Headphones, 
  Wallet, 
  Layers, 
  Search,
  CheckCircle2,
  ChevronDown,
  Star,
  Users,
  MessageCircle,
  HelpCircle,
  CreditCard,
  Building2,
  Lock,
  ArrowLeft
} from 'lucide-react';

const RECENT_ACTIVATIONS = [
  { id: 1, tool: 'ChatGPT Plus (شهر كامل)', city: 'صنعاء', time: 'قبل 4 دقائق', customer: 'م/ أحمد' },
  { id: 2, tool: 'Claude 3.5 Sonnet Pro', city: 'عدن', time: 'قبل 9 دقائق', customer: 'م/ طارق' },
  { id: 3, tool: 'Canva Pro (سنة كاملة)', city: 'تعز', time: 'قبل 15 دقيقة', customer: 'أ/ ريم' },
  { id: 4, tool: 'Cursor Pro AI Editor', city: 'المكلا', time: 'قبل 22 دقيقة', customer: 'م/ حسام' },
  { id: 5, tool: 'باقة المطورين VIP', city: 'الرياض', time: 'قبل 28 دقيقة', customer: 'م/ فيصل' },
];

const FAQS = [
  {
    q: 'كيف يتم تسليم وتفعيل الحساب بعد الدفع؟',
    a: 'يتم التفعيل فور إتمام عملية الدفع وإرفاق الإشعار. يصلك بريد إلكتروني أو رسالة واتساب مباشرة ببيانات تسجيل الدخول أو دعوة رسمية على بريدك الشخصي خلال دقائق معدودة.',
  },
  {
    q: 'هل الاشتراكات والحسابات رسمية ومضمونة؟',
    a: 'نعم، جميع الاشتراكات والحسابات أصلية 100% ومدفوعة مباشرة من المنصات الأم (OpenAI, Anthropic, Midjourney, Canva) مع ضمان استبدال ذهبي طوال مدة الاشتراك.',
  },
  {
    q: 'ما هي طرق الدفع المحلية والدولية المتاحة؟',
    a: 'نوفر الدفع المباشر بالريال اليمني عبر بنك الكريمي، محفظة جيب، ون كاش، بنك القطيبي، وبالريال السعودي، والدولار والعملات الرقمية المشفرة USDT (شبكة TRC-20).',
  },
  {
    q: 'ماذا أفعل إذا واجهت أي مشكلة أثناء فترة الاشتراك؟',
    a: 'فريق الدعم الفني متواجد على مدار 24 ساعة عبر الواتساب والتيليجرام لحل أي مشكلة فوراً أو استبدال الحساب دون أي تأخير.',
  },
];

const TESTIMONIALS = [
  {
    name: 'م/ عبد الرحمن السقاف',
    role: 'Full-Stack Developer',
    location: 'صنعاء',
    comment: 'أفضل متجر تعاملت معه في اليمن. اشتراك Claude 3.5 Sonnet و Cursor Pro تم تسليمهم خلال 5 دقائق ويعملان بكفاءة تامة.',
    stars: 5,
  },
  {
    name: 'سارة باوزير',
    role: 'Graphic Designer & Content Creator',
    location: 'عدن',
    comment: 'اشتراك كانفا برو السنوي تفعل مباشرة على إيميلي الشخصي بدون أي مشاكل، وخدمة العملاء بالواتساب سريعة ومحترمة جداً.',
    stars: 5,
  },
  {
    name: 'م/ وليد الشميري',
    role: 'AI Researcher & Data Engineer',
    location: 'تعز',
    comment: 'توفير الدفع عبر بنك الكريمي ومحفظة جيب سهل علينا الكثير كمهندسين بدون الحاجة لبطاقات فيزا دولية. أنصح بهم بشدة.',
    stars: 5,
  },
];

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const { products, isLoading, isSyncedWithSupabase, fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency } = useCurrencyStore();
  const { fetchInitialData: fetchSettings, whatsappNumber } = useStoreSettings();

  // Fresh data hydration on mount
  useEffect(() => {
    fetchProducts();
    fetchCurrency();
    fetchSettings();
  }, [fetchProducts, fetchCurrency, fetchSettings]);

  // Dynamic Filtering by Category & Search Query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, selectedCategory, searchQuery]);

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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-12 sm:space-y-20 w-full overflow-x-hidden">
      {/* 1. Live Order Activity Ticker (Social Proof) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-2.5 sm:p-3 overflow-hidden backdrop-blur-xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs text-slate-300">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-[11px] whitespace-nowrap flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            تفعيلات مباشرة:
          </span>
          <div className="flex items-center gap-4 sm:gap-8 whitespace-nowrap text-[11px] sm:text-xs text-slate-400 font-medium">
            {RECENT_ACTIVATIONS.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1.5 flex-shrink-0">
                <span className="text-white font-semibold">{item.customer} ({item.city})</span>
                <span>•</span>
                <span className="text-indigo-300">{item.tool}</span>
                <span className="text-slate-500 font-mono text-[10px]">({item.time})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Authentic & High Converting */}
      <section className="relative text-center space-y-5 sm:space-y-6 max-w-4xl mx-auto pt-2 sm:pt-4 px-2">
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-xl shadow-lg shadow-indigo-500/10">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
          <span>ضمان استبدال ذهبي 100% • دفع محلي موثوق (كريمي / جيب / ون كاش)</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
          اشتراكاتك الرقمية وحسابات الذكاء الاصطناعي{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            بتفعيل فوري وأسعار محلية
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto px-2">
          احصل على حساباتك الرسمية في ChatGPT Plus، Claude 3.5، Cursor Pro، Midjourney وكانفا برو مع تسليم فوري وضمان مستمر، دون الحاجة لبطاقات بنكية دولية.
        </p>

        {/* 4 Trust Value Pillars */}
        <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto text-xs text-slate-200">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <Zap className="h-5 w-5 text-amber-400 mb-1" />
            <span className="font-bold text-xs">تفعيل وتسليم فوري</span>
            <span className="text-[10px] text-slate-400 mt-0.5">خلال دقائق من التحويل</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <Wallet className="h-5 w-5 text-emerald-400 mb-1" />
            <span className="font-bold text-xs">دفع محلي مباشر</span>
            <span className="text-[10px] text-slate-400 mt-0.5">كريمي، جيب، ون كاش، USDT</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 text-indigo-400 mb-1" />
            <span className="font-bold text-xs">ضمان ذهبي شامل</span>
            <span className="text-[10px] text-slate-400 mt-0.5">استبدال طوال مدة الاشتراك</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <Headphones className="h-5 w-5 text-pink-400 mb-1" />
            <span className="font-bold text-xs">دعم متواصل 24/7</span>
            <span className="text-[10px] text-slate-400 mt-0.5">عبر الواتساب والتيليجرام</span>
          </div>
        </div>
      </section>

      {/* 3. Catalogue, Search & Filters Section */}
      <section className="space-y-6 sm:space-y-8 w-full pt-4">
        {/* Search & Category Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                المنتجات والاشتراكات المتاحة
              </h2>
              {isSyncedWithSupabase && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  مباشر ⚡
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              اختر المنتج واضغط على &quot;طلب الآن&quot; للاستلام والتفعيل الفوري
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="ابحث عن أداة أو اشتراك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="w-full overflow-x-auto pb-1">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            productCounts={productCounts}
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-3xl bg-slate-900/30 border border-slate-800">
            <Search className="h-10 w-10 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300">لم يتم العثور على منتجات مطابقة للبحث</h3>
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

      {/* 4. How It Works (3 Steps) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h3 className="text-lg sm:text-2xl font-black text-white">
            كيف تتم عملية الشراء والتفعيل؟ 🚀
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            3 خطوات بسيطة ومباشرة لاستلام اشتراكك وتفعيله خلال دقائق
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold font-mono flex items-center justify-center text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">اختر اشتراكك المناسب</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تصفح المنتجات واختر المدة المناسبة لك ثم اضغط على زر &quot;طلب الآن&quot;.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold font-mono flex items-center justify-center text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">حوّل المبلغ وأرفق الإشعار</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              حوّل عبر بنك الكريمي، محفظة جيب، ون كاش، أو USDT، وارفق صورة الإشعار في ثوانٍ.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-8 w-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold font-mono flex items-center justify-center text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">استلم حسابك فوراً</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تصلك بيانات الدخول أو الدعوة الرسمية على بريدك الشخصي أو الواتساب فوراً.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials (آراء العملاء) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>تقييمات وتجارب العملاء المعتمدة</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white">
            ثقة أكثر من +1,800 مطور ومصمم في اليمن والخليج ⭐
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map((review, i) => (
            <div key={i} className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(review.stars)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{review.name}</div>
                  <div className="text-[11px] text-slate-400">{review.role}</div>
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/20 font-mono">
                  {review.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Accordion Section (الأسئلة الشائعة) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold">
            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
            <span>الأسئلة الأكثر شيوعاً</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white">
            كل ما تود معرفته قبل الشراء
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
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
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

      {/* 7. Need Help WhatsApp Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-indigo-950/60 border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-right">
          <h4 className="text-base sm:text-xl font-bold text-white">
            هل تحتاج إلى مساعدة أو لديك استفسار خاص؟ 💬
          </h4>
          <p className="text-xs text-slate-300">
            فريق خدمة العملاء جاهز للرد الفوري ومساعدتك في اختيار الاشتراك المناسب لاحتياجاتك.
          </p>
        </div>

        <a
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً كودورا، أريد الاستفسار عن الاشتراكات الرقمية.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          <MessageCircle className="h-4 w-4" />
          <span>محادثة واتساب مباشرة</span>
        </a>
      </section>
    </div>
  );
}

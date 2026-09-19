'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProductCategory, Product } from '@/types/product';
import { CategoryFilter } from '@/components/storefront/category-filter';
import { ProductCard } from '@/components/storefront/product-card';
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { useCheckoutStore } from '@/store/use-checkout-store';
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
  ArrowDown,
  ArrowLeft,
  Flame,
  Check,
  X,
  Clock,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const RECENT_ACTIVATIONS = [
  { id: 1, tool: 'ChatGPT Plus (شهر كامل)', city: 'صنعاء', time: 'قبل 3 دقائق', customer: 'م/ أحمد' },
  { id: 2, tool: 'Claude 3.5 Sonnet Pro', city: 'عدن', time: 'قبل 8 دقائق', customer: 'م/ طارق' },
  { id: 3, tool: 'Canva Pro (سنة كاملة)', city: 'تعز', time: 'قبل 14 دقيقة', customer: 'أ/ ريم' },
  { id: 4, tool: 'Cursor Pro AI Editor', city: 'المكلا', time: 'قبل 21 دقيقة', customer: 'م/ حسام' },
  { id: 5, tool: 'باقة المطورين VIP', city: 'الرياض', time: 'قبل 29 دقيقة', customer: 'م/ فيصل' },
];

const FAQS = [
  {
    q: 'كيف يتم تسليم وتفعيل الحساب بعد الدفع؟',
    a: 'يتم التفعيل فور إتمام عملية الدفع وإرفاق الإشعار. يصلك بريد إلكتروني أو رسالة واتساب مباشرة ببيانات تسجيل الدخول أو دعوة رسمية على بريدك الشخصي خلال دقائق معدودة.',
  },
  {
    q: 'هل الاشتراكات والحسابات رسمية ومضمونة؟',
    a: 'نعم، جميع الاشتراكات والحسابات أصلية 100% ومدفوعة مباشرة من المنصات الأم (OpenAI, Anthropic, Cursor, Midjourney, Canva) مع ضمان استبدال ذهبي طوال مدة الاشتراك.',
  },
  {
    q: 'ما هي طرق الدفع المحلية والدولية المتاحة؟',
    a: 'نوفر الدفع المباشر بالريال اليمني عبر بنك الكريمي، محفظة جيب، ون كاش، بنك القطيبي، وبالريال السعودي، والدولار والعملات الرقمية المشفرة USDT (شبكة TRC-20).',
  },
  {
    q: 'هل أحتاج إلى بطاقة فيزا أو ماستركارد دولية للشراء؟',
    a: 'أبداً! نحن نتكفل بجميع عمليات الدفع الدولي والتحويل، وأنت تدفع بالعملة المحلية مباشرة عبر حسابك البنكي أو محفظتك الإلكترونية في اليمن أو الخليج.',
  },
  {
    q: 'ماذا أفعل إذا واجهت أي مشكلة أثناء فترة الاشتراك؟',
    a: 'فريق الدعم الفني متواجد على مدار 24 ساعة عبر الواتساب والتيليجرام لحل أي استفسار فوراً أو استبدال الحساب دون أي تأخير مع ضمان كامل.',
  },
];

const TESTIMONIALS = [
  {
    name: 'م/ عبد الرحمن السقاف',
    role: 'Full-Stack Developer',
    location: 'صنعاء',
    comment: 'أفضل متجر تعاملت معه في اليمن بلا منازع. اشتراك Claude 3.5 Sonnet و Cursor Pro تم تسليمهم خلال 5 دقائق ويعملان بكفاءة تامة دون أي انقطاع.',
    stars: 5,
    date: 'أمس',
  },
  {
    name: 'سارة باوزير',
    role: 'Graphic Designer & Content Creator',
    location: 'عدن',
    comment: 'اشتراك كانفا برو السنوي تفعل مباشرة على إيميلي الشخصي بدون أي مشاكل، وخدمة العملاء بالواتساب سريعة ومحترمة جداً.',
    stars: 5,
    date: 'قبل 3 أيام',
  },
  {
    name: 'م/ وليد الشميري',
    role: 'AI Researcher & Data Engineer',
    location: 'تعز',
    comment: 'توفير الدفع عبر بنك الكريمي ومحفظة جيب سهل علينا الكثير كمهندسين بدون الحاجة لبطاقات فيزا دولية ورسوم صرف مجحفة. أنصح بهم بشدة.',
    stars: 5,
    date: 'قبل 5 أيام',
  },
];

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const { products, isLoading, isSyncedWithSupabase, fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency, formatPrice, activeCurrency } = useCurrencyStore();
  const { fetchInitialData: fetchSettings, whatsappNumber } = useStoreSettings();
  const { openCheckout } = useCheckoutStore();

  // Fresh data hydration on mount
  useEffect(() => {
    fetchProducts();
    fetchCurrency();
    fetchSettings();
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
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-16 sm:space-y-28 w-full overflow-x-hidden">
      {/* 1. Live Order Activity Ticker (Social Proof) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-2.5 sm:p-3 overflow-hidden backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-[11px] whitespace-nowrap flex-shrink-0 border border-emerald-500/25">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            تفعيلات مباشرة:
          </span>
          <div className="flex items-center gap-4 sm:gap-8 whitespace-nowrap text-[11px] sm:text-xs text-slate-400 font-medium">
            {RECENT_ACTIVATIONS.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1.5 flex-shrink-0">
                <span className="text-white font-semibold">{item.customer} ({item.city})</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-300 font-medium">{item.tool}</span>
                <span className="text-slate-500 font-mono text-[10px]">({item.time})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Ultra-Modern SaaS / Tech Store Design */}
      <section className="relative text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto pt-2 sm:pt-6 px-2">
        {/* Shimmer Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-indigo-950/80 border border-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-xl shadow-xl shadow-indigo-500/10">
          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>المنصة المعتمدة لاشتراكات وحسابات الذكاء الاصطناعي في اليمن والخليج</span>
          <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="hidden sm:inline-block text-emerald-400 font-bold">تسليم في 5 دقائق</span>
        </div>

        {/* Impactful Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.15]">
          اشتراكات الذكاء الاصطناعي الرسمية{' '}
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            بتفعيل فوري وبدون بطاقة دولية
          </span>
        </h1>

        {/* Clear Value Proposition */}
        <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto px-2">
          احصل على حساباتك في <strong className="text-white">ChatGPT Plus</strong> و <strong className="text-white">Claude 3.5</strong> و <strong className="text-white">Cursor Pro</strong> و <strong className="text-white">Canva Pro</strong> مع ضمان ذهبي ودفع مباشر عبر الكريمي، جيب، ون كاش، أو USDT.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Button
            onClick={scrollToCatalog}
            size="lg"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 border border-indigo-400/30 group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span>تصفح الاشتراكات والأسعار</span>
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </div>
          </Button>

          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً كودورا، أريد الاستفسار عن الاشتراكات وتجهيز طلب خاص.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all active:scale-95 shadow-md"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span>طلب باقة مخصصة بالواتساب</span>
          </a>
        </div>

        {/* 4 Trust Value Pillars */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-slate-200">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <Zap className="h-5 w-5 text-amber-400 mb-1.5" />
            <span className="font-bold text-xs text-white">تسليم فوري ومباشر</span>
            <span className="text-[10px] text-slate-400 mt-0.5">خلال دقائق من الدفع</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <Wallet className="h-5 w-5 text-emerald-400 mb-1.5" />
            <span className="font-bold text-xs text-white">دفع محلي ميسر</span>
            <span className="text-[10px] text-slate-400 mt-0.5">كريمي، جيب، ون كاش، USDT</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 text-indigo-400 mb-1.5" />
            <span className="font-bold text-xs text-white">ضمان ذهبي 100%</span>
            <span className="text-[10px] text-slate-400 mt-0.5">استبدال كامل طوال المدة</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <Headphones className="h-5 w-5 text-pink-400 mb-1.5" />
            <span className="font-bold text-xs text-white">دعم فني 24/7</span>
            <span className="text-[10px] text-slate-400 mt-0.5">عبر الواتساب والتيليجرام</span>
          </div>
        </div>
      </section>

      {/* 3. Live Metrics Trust Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1 backdrop-blur-xl">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">+1,850</div>
          <div className="text-xs text-slate-400 font-medium">اشتراك مفعّل بنجاح</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1 backdrop-blur-xl">
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">99.8%</div>
          <div className="text-xs text-slate-400 font-medium">نسبة رضا وتقييم العملاء</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1 backdrop-blur-xl">
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">4 دقائق</div>
          <div className="text-xs text-slate-400 font-medium">متوسط سرعة التسليم والتفعيل</div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-center space-y-1 backdrop-blur-xl">
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">100%</div>
          <div className="text-xs text-slate-400 font-medium">ضمان استبدال رسمي معتمد</div>
        </div>
      </section>

      {/* 4. Best-Seller Spotlight Section */}
      {spotlightProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold mb-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>الاشتراكات الأكثر شعبية هذا الأسبوع</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                خيار المطورين وصنّاع المحتوى الأول ⭐
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              حسابات جاهزة ومفعلة بأعلى معايير الأمان والاستقرار
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {spotlightProducts.map((product) => (
              <ProductCard key={`spotlight-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Complete Catalogue, Search & Filters Section */}
      <section id="catalog-section" className="space-y-6 sm:space-y-8 w-full pt-4">
        {/* Search & Category Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                جميع الأدوات والاشتراكات المتاحة
              </h2>
              {isSyncedWithSupabase && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  مباشر ⚡
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              اختر المنتج واضغط على &quot;طلب فوري&quot; للاستلام والتفعيل في دقائق
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
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="popular">الأكثر شعبية</option>
              <option value="price-low">الأقل سعراً</option>
              <option value="price-high">الأعلى سعراً</option>
            </select>
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
            <h3 className="text-base font-bold text-slate-300">لم يتم العثور على اشتراكات مطابقة للبحث</h3>
            <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو تصفح الأقسام من الأعلى</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-1">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Comparison Matrix: Why Choose Codora */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>الفارق الحقيقي مع كودورا</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            لماذا يفضل المطورون والمصممون الشراء من كودورا؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            وفر وقتك وأموالك مع خدمات تفعيل رسمية وآمنة بالكامل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {/* Codora Advantage */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-950/80 to-slate-950 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-base text-white flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                متجر كودورا للذكاء الاصطناعي (Codora)
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                الخيار المعتمد
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>دفع محلي مباشر بالكريمي، جيب، ون كاش، والقطيبي بدون بطاقات أجنبية.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>تفعيل فوري خلال دقائق مع بيانات دخول جاهزة أو دعوة رسمية على بريدك.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>ضمان استبدال ذهبي مستمر طوال فترة الاشتراك دون مماطلة.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>دعم فني عربي متخصص عبر الواتساب والتيليجرام على مدار 24 ساعة.</span>
              </div>
            </div>
          </div>

          {/* Self-Purchase Issues */}
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-4 opacity-80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-slate-400 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                الشراء الذاتي المعقد أو المتاجر المجهولة
              </span>
              <span className="text-[11px] bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full font-semibold">
                مخاطر وعوائق
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>رفض بطاقات الدفع المحلية ورسوم بنكية باهظة في التحويل الدولي.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>حظر الحسابات الجغرافية وصعوبة تفعيل خدمات الذكاء الاصطناعي.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>انعدام الضمان وخسارة الأموال في حال تعطل الحساب فجأة.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>غياب خدمة العملاء أو الرد بعد أيام طويلة دون فائدة.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works (4 Steps Visual Journey) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h3 className="text-xl sm:text-3xl font-black text-white">
            رحلة الشراء والتفعيل في 4 خطوات 🚀
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            خطوات بسيطة ومؤتمتة لضمان استلام حسابك بأعلى سرعة وأمان
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold font-mono flex items-center justify-center text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">اختر اشتراكك</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تصفح الأدوات واختر المدة المناسبة لك ثم اضغط على زر &quot;طلب فوري&quot;.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold font-mono flex items-center justify-center text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">حوّل المبلغ محلياً</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              انسخ رقم الحساب وحوّل عبر الكريمي، جيب، ون كاش، أو بايننس USDT.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400 font-bold font-mono flex items-center justify-center text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">ارفق إشعار التحويل</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              التقط صورة لسند التحويل أو الإشعار وارفقها مباشرة في نافذة الطلب.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold font-mono flex items-center justify-center text-sm">
              04
            </div>
            <h4 className="font-bold text-sm text-white">استلم حسابك فوراً</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تصلك بيانات الدخول أو الدعوة الرسمية على بريدك أو الواتساب خلال دقائق.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Customer Testimonials (آراء وتجارب العملاء) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>تجارب وآراء العملاء المعتمدة</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            ثقة أكثر من +1,800 عميل ومطور في اليمن والخليج ⭐
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((review, i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(review.stars)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{review.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{review.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-400">{review.role}</div>
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-mono">
                  {review.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ Accordion Section (الأسئلة الشائعة) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold">
            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
            <span>مركز الإجابات المباشرة</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            الأسئلة الأكثر شيوعاً قبل الشراء
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

      {/* 10. Need Help / Custom Inquiries WhatsApp Banner */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900/95 to-indigo-950/70 border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-950/30">
        <div className="space-y-2 text-center sm:text-right">
          <h4 className="text-lg sm:text-2xl font-black text-white">
            هل تحتاج إلى مساعدة أو طلب اشتراك خاص؟ 💬
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            فريق خدمة العملاء جاهز للرد الفوري على استفساراتك وتجهيز الحسابات الفردية وحزم الشركات والفرق البرمجية.
          </p>
        </div>

        <a
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً كودورا، أريد الاستفسار عن الاشتراكات الرقمية والتفعيل الفوري.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex-shrink-0"
        >
          <MessageCircle className="h-5 w-5" />
          <span>محادثة واتساب مباشرة</span>
        </a>
      </section>
    </div>
  );
}

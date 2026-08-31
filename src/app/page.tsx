'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2 
} from 'lucide-react';

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const { products, isLoading, isSyncedWithSupabase, fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency } = useCurrencyStore();
  const { fetchInitialData: fetchSettings } = useStoreSettings();

  // Fresh data hydration directly from Supabase on mount
  useEffect(() => {
    fetchProducts();
    fetchCurrency();
    fetchSettings();
  }, [fetchProducts, fetchCurrency, fetchSettings]);

  const filteredProducts: Product[] =
    selectedCategory === 'all'
      ? products.filter((p) => p.isAvailable)
      : products.filter((p) => p.category === selectedCategory && p.isAvailable);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-16 space-y-10 sm:space-y-16 w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto pt-2 sm:pt-8 px-1">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-pink-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse flex-shrink-0" />
          <span className="truncate">تفعيل فوري مضمون 100% ودعم طرق الدفع المحلية</span>
        </div>

        {/* Catchy Headline (Mobile-First Scaled) */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
          متجرك الأول للاشتراكات الرقمية{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            وأدوات الذكاء الاصطناعي
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto px-2">
          احصل على اشتراكاتك فوراً وبأفضل الأسعار مع تفعيل مباشر وضمان كامل، مع دعم الدفع عبر الكريمي، ون كاش، جيب، بن يعلا، والريال السعودي والـ USDT.
        </p>

        {/* Value Props & Local Payments Banner */}
        <div className="pt-2 sm:pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto text-xs text-slate-300">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 flex-shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">تسليم وتفعيل فوري</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">دفع محلي بالريال</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 flex-shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">ضمان كامل للمدة</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <Headphones className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-400 flex-shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">دعم فني متواصل 24/7</span>
          </div>
        </div>
      </section>

      {/* Catalogue & Filters Section */}
      <section className="space-y-6 sm:space-y-8 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                المنتجات والاشتراكات المتاحة
              </h2>
              {isSyncedWithSupabase && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  مباشر من السحابة ⚡
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              اختر المنتج واضغط على &quot;طلب الآن&quot; للاستلام الفوري
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="w-full md:w-auto overflow-x-auto pb-1">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400">جارٍ جلب أحدث المنتجات وقوائم الأسعار من السحابة...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 sm:p-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

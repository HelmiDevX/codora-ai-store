'use client';

import React, { useState } from 'react';
import { ProductCategory, Product } from '@/types/product';
import { CategoryFilter } from '@/components/storefront/category-filter';
import { ProductCard } from '@/components/storefront/product-card';
import { useProductsStore } from '@/store/use-products-store';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Headphones, 
  Bot, 
  Wallet,
  Layers
} from 'lucide-react';

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const { products } = useProductsStore();

  const filteredProducts: Product[] =
    selectedCategory === 'all'
      ? products.filter(p => p.isAvailable)
      : products.filter((p) => p.category === selectedCategory && p.isAvailable);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-pink-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>تفعيل فوري مضمون 100% ودعم طرق الدفع المحلية</span>
        </div>

        {/* Catchy Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          متجرك الأول للاشتراكات الرقمية{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            وأدوات الذكاء الاصطناعي
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          احصل على اشتراكاتك فوراً وبأفضل الأسعار مع تفعيل مباشر وضمان كامل، مع دعم الدفع عبر الكريمي، ون كاش، جيب، بن يعلا، والريال السعودي والـ USDT.
        </p>

        {/* Value Props & Local Payments Banner */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-slate-300">
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span className="font-medium">تسليم وتفعيل فوري</span>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <Wallet className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">دفع محلي بالريال</span>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <ShieldCheck className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span className="font-medium">ضمان كامل للمدة</span>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm">
            <Headphones className="h-4 w-4 text-pink-400 flex-shrink-0" />
            <span className="font-medium">دعم فني متواصل 24/7</span>
          </div>
        </div>
      </section>

      {/* Catalogue & Filters Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              المنتجات والاشتراكات المتاحة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              اختر المنتج واضغط على &quot;طلب الآن&quot; للاستلام الفوري
            </p>
          </div>

          {/* Category Filter Tabs */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

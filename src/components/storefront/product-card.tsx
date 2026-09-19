'use client';

import React from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Clock, 
  Zap, 
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useCheckoutStore } from '@/store/use-checkout-store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, activeCurrency } = useCurrencyStore();
  const { openCheckout } = useCheckoutStore();

  const formattedPrice = formatPrice(product.priceUSD, 'ar');
  const platform = product.metadata?.platform || 'AI Tools';
  const brandColor = product.metadata?.brandColor || '#6366f1';

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-indigo-500/50 p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 w-full overflow-hidden">
      {/* Top Brand Accent Glow Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 opacity-80 group-hover:opacity-100 transition-opacity" 
        style={{ 
          background: `linear-gradient(90deg, ${brandColor}, transparent 90%)` 
        }} 
      />

      {/* Top Ambient Glow Circle on Hover */}
      <div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: brandColor }}
      />

      {/* Main Content Area */}
      <div>
        {/* Top Badges & Meta Row */}
        <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.badgeTextAr && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                {product.badgeTextAr}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/70">
              <Clock className="h-3 w-3 text-slate-400" />
              {product.metadata?.durationAr || 'شهر كامل'}
            </span>
          </div>

          <span 
            className="text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border flex-shrink-0"
            style={{ 
              backgroundColor: `${brandColor}18`, 
              color: brandColor, 
              borderColor: `${brandColor}40` 
            }}
          >
            {platform}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-200 transition-colors leading-snug mt-1">
          {product.titleAr}
        </h3>

        {/* Short Description */}
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
          {product.shortDescriptionAr}
        </p>

        {/* Delivery & Access Badge */}
        {product.metadata?.accessType && (
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>نوع التسليم: {product.metadata.accessType}</span>
          </div>
        )}

        {/* Key Features List */}
        <div className="mt-4 space-y-2 pt-3.5 border-t border-slate-800/80">
          {product.features.slice(0, 4).map((feature) => (
            <div key={feature.id} className="flex items-start gap-2 text-xs text-slate-300">
              <div className="h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span className="leading-relaxed font-normal text-[11px] sm:text-xs text-slate-200">
                {feature.titleAr}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Pricing & CTA */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3.5">
        {/* Price Row */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">السعر المطلوب ({activeCurrency}):</div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-1">
              {formattedPrice}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
              ${product.priceUSD.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Order Now Button */}
        <Button
          onClick={() => openCheckout(product)}
          className="w-full justify-between items-center text-xs sm:text-sm font-bold py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 border border-indigo-400/30 group/btn transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>طلب الاشتراك (Order Now)</span>
          </div>
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
        </Button>
      </div>
    </div>
  );
};



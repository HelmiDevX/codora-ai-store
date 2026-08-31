'use client';

import React from 'react';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ShoppingBag, Clock } from 'lucide-react';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useCheckoutStore } from '@/store/use-checkout-store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice } = useCurrencyStore();
  const { openCheckout } = useCheckoutStore();

  const formattedPrice = formatPrice(product.priceUSD, 'ar');

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-glass-glow sm:hover:-translate-y-1.5 flex-1 w-full">
      {/* Top Header & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {product.badgeTextAr && (
              <Badge variant={product.isPopular ? 'purple' : 'success'} size="sm" className="font-semibold text-[10px] sm:text-xs">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1" />
                {product.badgeTextAr}
              </Badge>
            )}
            <Badge variant="outline" size="sm" className="text-slate-400 border-slate-800 text-[10px] sm:text-xs">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 text-slate-400" />
              {product.metadata?.durationAr || 'شهر كامل'}
            </Badge>
          </div>

          <span className="text-[10px] sm:text-[11px] text-indigo-400/80 font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-500/20 flex-shrink-0">
            {product.metadata?.platform || product.category}
          </span>
        </div>

        {/* Title & Short Description */}
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
          {product.titleAr}
        </h3>

        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
          {product.shortDescriptionAr}
        </p>

        {/* Feature List (Key bullet points) */}
        <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-slate-800/80">
          {product.features.map((feature) => (
            <div key={feature.id} className="flex items-start gap-2 sm:gap-2.5 text-xs text-slate-300">
              <div className="h-4 w-4 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span className="leading-relaxed font-normal text-[11px] sm:text-xs">{feature.titleAr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Price & Order Button */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-800/80">
        <div className="flex items-baseline justify-between mb-3 sm:mb-4">
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-400">السعر بالعملة المختارة:</div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formattedPrice}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] sm:text-xs text-slate-500 font-mono font-semibold">
              ${product.priceUSD.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Action Button: طلب الآن */}
        <Button
          onClick={() => openCheckout(product)}
          className="w-full justify-center text-xs sm:text-sm font-bold py-3 sm:py-3.5 shadow-lg shadow-indigo-600/20 group/btn bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white rounded-xl border border-indigo-400/30 active:scale-[0.98]"
        >
          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 transition-transform group-hover/btn:scale-110" />
          طلب الآن (Order Now)
        </Button>
      </div>
    </div>
  );
};

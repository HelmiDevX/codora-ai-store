'use client';

import React from 'react';
import { ProductCategory } from '@/types/product';
import { CATEGORY_FILTERS } from '@/data/mock-products';
import { Sparkles, Bot, Code, Palette, GraduationCap, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
  productCounts?: Record<string, number>;
}

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Bot,
  Code,
  Palette,
  GraduationCap,
  Layers,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  productCounts = {},
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
      {CATEGORY_FILTERS.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const Icon = cat.iconName ? ICONS[cat.iconName] || Sparkles : Sparkles;
        const count = productCounts[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 border flex-shrink-0 active:scale-95 select-none',
              isSelected
                ? 'bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-indigo-600/30 text-white border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/70 text-slate-400 border-slate-800/90 hover:text-slate-100 hover:border-slate-700 hover:bg-slate-850'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
                isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
              )}
            />
            <span>{cat.labelAr}</span>
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors',
                  isSelected
                    ? 'bg-indigo-500/40 text-indigo-100 border border-indigo-400/30'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};


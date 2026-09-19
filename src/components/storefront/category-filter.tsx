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
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
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
              'flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border flex-shrink-0 active:scale-95',
              isSelected
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            )}
          >
            <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isSelected ? 'text-indigo-400' : 'text-slate-500')} />
            <span>{cat.labelAr}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-500'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

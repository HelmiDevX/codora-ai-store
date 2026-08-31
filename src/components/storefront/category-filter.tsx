'use client';

import React from 'react';
import { ProductCategory } from '@/types/product';
import { CATEGORY_FILTERS } from '@/data/mock-products';
import { Sparkles, Bot, GraduationCap, Coins, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
}

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Bot,
  GraduationCap,
  Coins,
  Layers,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORY_FILTERS.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const Icon = cat.iconName ? ICONS[cat.iconName] || Sparkles : Sparkles;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border',
              isSelected
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border-indigo-500/50 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            )}
          >
            <Icon className={cn('h-4 w-4', isSelected ? 'text-indigo-400' : 'text-slate-400')} />
            <span>{cat.labelAr}</span>
          </button>
        );
      })}
    </div>
  );
};

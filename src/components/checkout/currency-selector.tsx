'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Coins } from 'lucide-react';
import { CurrencyCode } from '@/types/currency';
import { CURRENCY_CONFIGS } from '@/lib/currency';
import { useCurrencyStore } from '@/store/use-currency-store';
import { cn } from '@/lib/utils';

export const CurrencySelector: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeCurrency, setCurrency } = useCurrencyStore();

  const activeConfig = CURRENCY_CONFIGS[activeCurrency] || CURRENCY_CONFIGS.USD;
  const currencyOptions = Object.values(CURRENCY_CONFIGS);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-500/50 text-slate-100 hover:text-white transition-all shadow-sm backdrop-blur-xl group active:scale-95 h-9 sm:h-10"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base leading-none">{activeConfig.flag}</span>
        <span className="font-bold text-indigo-300 group-hover:text-indigo-200 text-xs sm:text-sm">
          {activeConfig.code === 'YER_ADEN' ? 'YER (عدن)' : activeConfig.code === 'YER_SANAA' ? 'YER (صنعاء)' : activeConfig.code}
        </span>
        <span className="text-[10px] sm:text-xs text-slate-400 font-normal hidden xs:inline">
          ({activeConfig.symbol})
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-indigo-400')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-64 sm:w-72 rounded-2xl bg-slate-950/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Coins className="h-3.5 w-3.5" />
              عملة الدفع والأسعار
            </span>
            <span className="text-[10px] text-slate-500">تحويل مباشر</span>
          </div>

          <div className="p-1 space-y-1">
            {currencyOptions.map((curr) => {
              const isSelected = curr.code === activeCurrency;
              return (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code as CurrencyCode);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-right transition-all',
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 font-bold'
                      : 'hover:bg-slate-900/80 text-slate-300 hover:text-white border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base sm:text-lg">{curr.flag}</span>
                    <div className="text-right">
                      <div className="font-bold text-white flex items-center gap-1 text-[11px] sm:text-xs">
                        <span>{curr.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {curr.code} ({curr.symbol})
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

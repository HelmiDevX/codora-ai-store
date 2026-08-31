import { create } from 'zustand';
import { CurrencyCode, ExchangeRatesMap } from '@/types/currency';
import { DEFAULT_EXCHANGE_RATES, EXCHANGE_RATES_LAST_UPDATED } from '@/data/mock-rates';
import { convertFromUSD, formatCurrency } from '@/lib/currency';
import { 
  fetchExchangeRatesFromSupabase, 
  upsertExchangeRatesToSupabase, 
  subscribeToSupabaseChanges 
} from '@/lib/supabase';

interface CurrencyStoreState {
  activeCurrency: CurrencyCode;
  rates: ExchangeRatesMap;
  lastUpdated: string;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => void;
  updateRates: (newRates: Partial<ExchangeRatesMap>) => Promise<{ success: boolean; error?: string }>;
  convertPrice: (amountUSD: number) => number;
  formatPrice: (amountUSD: number, locale?: 'ar' | 'en') => string;
}

let isRatesSubscribed = false;

export const useCurrencyStore = create<CurrencyStoreState>()((set, get) => ({
  activeCurrency: 'USD',
  rates: DEFAULT_EXCHANGE_RATES,
  lastUpdated: EXCHANGE_RATES_LAST_UPDATED,
  isLoading: true,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const liveRates = await fetchExchangeRatesFromSupabase();
      if (liveRates) {
        set({ 
          rates: { ...DEFAULT_EXCHANGE_RATES, ...liveRates }, 
          lastUpdated: new Date().toISOString(),
          isLoading: false 
        });
      } else {
        set({ rates: DEFAULT_EXCHANGE_RATES, isLoading: false });
      }

      if (!isRatesSubscribed && typeof window !== 'undefined') {
        isRatesSubscribed = true;
        subscribeToSupabaseChanges('exchange_rates', async () => {
          const refreshed = await fetchExchangeRatesFromSupabase();
          if (refreshed) {
            set({ 
              rates: { ...DEFAULT_EXCHANGE_RATES, ...refreshed }, 
              lastUpdated: new Date().toISOString() 
            });
          }
        });
      }
    } catch (err) {
      console.warn('[Currency Store Hydration Error]', err);
      set({ rates: DEFAULT_EXCHANGE_RATES, isLoading: false });
    }
  },

  setCurrency: (currency: CurrencyCode) => {
    set({ activeCurrency: currency });
  },

  updateRates: async (newRates: Partial<ExchangeRatesMap>) => {
    const currentRates = get().rates;
    const mergedRates: ExchangeRatesMap = {
      ...currentRates,
      ...newRates,
    };

    // 1. Direct Supabase Query first
    const res = await upsertExchangeRatesToSupabase(mergedRates);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في حفظ أسعار الصرف في السحابة' };
    }

    // 2. Update local UI state ONLY after DB confirmation
    set({
      rates: mergedRates,
      lastUpdated: new Date().toISOString(),
    });

    return { success: true };
  },

  convertPrice: (amountUSD: number) => {
    const { activeCurrency, rates } = get();
    return convertFromUSD(amountUSD, activeCurrency, rates);
  },

  formatPrice: (amountUSD: number, locale: 'ar' | 'en' = 'ar') => {
    const { activeCurrency, rates } = get();
    const converted = convertFromUSD(amountUSD, activeCurrency, rates);
    return formatCurrency(converted, activeCurrency, locale);
  },
}));

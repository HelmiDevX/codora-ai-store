import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  updateRates: (newRates: Partial<ExchangeRatesMap>) => Promise<void>;
  convertPrice: (amountUSD: number) => number;
  formatPrice: (amountUSD: number, locale?: 'ar' | 'en') => string;
}

let isRatesSubscribed = false;

export const useCurrencyStore = create<CurrencyStoreState>()(
  persist(
    (set, get) => ({
      activeCurrency: 'USD',
      rates: DEFAULT_EXCHANGE_RATES,
      lastUpdated: EXCHANGE_RATES_LAST_UPDATED,
      isLoading: false,

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
            set({ isLoading: false });
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
          set({ isLoading: false });
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

        // 1. Optimistic Local Update
        set({
          rates: mergedRates,
          lastUpdated: new Date().toISOString(),
        });

        // 2. Direct Supabase Query
        await upsertExchangeRatesToSupabase(mergedRates);
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
    }),
    {
      name: 'codora_currency_rates_v2',
    }
  )
);

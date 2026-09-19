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
import { broadcastSyncEvent } from '@/lib/broadcast-bus';

interface CurrencyStoreState {
  activeCurrency: CurrencyCode;
  rates: ExchangeRatesMap;
  lastUpdated: string;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => void;
  updateRates: (newRates: Partial<ExchangeRatesMap>) => Promise<{ success: boolean; error?: string }>;
  setFullRates: (rates: ExchangeRatesMap) => void;
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
        try {
          const liveRates = await fetchExchangeRatesFromSupabase();
          if (liveRates) {
            set({ 
              rates: { ...DEFAULT_EXCHANGE_RATES, ...liveRates }, 
              lastUpdated: new Date().toISOString(),
              isLoading: false 
            });
          }

          if (!isRatesSubscribed && typeof window !== 'undefined') {
            isRatesSubscribed = true;
            subscribeToSupabaseChanges('exchange_rates', async () => {
              const refreshed = await fetchExchangeRatesFromSupabase();
              if (refreshed) {
                const merged = { ...DEFAULT_EXCHANGE_RATES, ...refreshed };
                set({ 
                  rates: merged, 
                  lastUpdated: new Date().toISOString() 
                });
                broadcastSyncEvent('RATES_UPDATED', merged);
              }
            });
          }
        } catch (err) {
          console.warn('[Currency Store Hydration Warning]', err);
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

        // 1. Immediate local state update
        set({
          rates: mergedRates,
          lastUpdated: new Date().toISOString(),
        });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('RATES_UPDATED', mergedRates);

        // 3. Persist to Supabase in background
        upsertExchangeRatesToSupabase(mergedRates).catch((err) => {
          console.warn('[Supabase Exchange Rates Save Warning]', err);
        });

        return { success: true };
      },

      setFullRates: (rates) => {
        set({ rates, lastUpdated: new Date().toISOString() });
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
      name: 'codora_currency_rates_v3',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyCode, ExchangeRatesMap } from '@/types/currency';
import { DEFAULT_EXCHANGE_RATES, EXCHANGE_RATES_LAST_UPDATED } from '@/data/mock-rates';
import { convertFromUSD, formatCurrency } from '@/lib/currency';

interface CurrencyStoreState {
  activeCurrency: CurrencyCode;
  rates: ExchangeRatesMap;
  lastUpdated: string;
  setCurrency: (currency: CurrencyCode) => void;
  updateRates: (newRates: Partial<ExchangeRatesMap>) => void;
  convertPrice: (amountUSD: number) => number;
  formatPrice: (amountUSD: number, locale?: 'ar' | 'en') => string;
}

export const useCurrencyStore = create<CurrencyStoreState>()(
  persist(
    (set, get) => ({
      activeCurrency: 'USD',
      rates: DEFAULT_EXCHANGE_RATES,
      lastUpdated: EXCHANGE_RATES_LAST_UPDATED,

      setCurrency: (currency: CurrencyCode) => {
        set({ activeCurrency: currency });
      },

      updateRates: (newRates: Partial<ExchangeRatesMap>) => {
        set((state) => ({
          rates: { ...state.rates, ...newRates },
          lastUpdated: new Date().toISOString(),
        }));
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
      name: 'codora_currency_rates_v1',
    }
  )
);

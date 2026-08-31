import { ExchangeRatesMap } from '@/types/currency';

/**
 * Exchange rates with 1 USD baseline:
 * 1 USD = 1,650 YER New (Aden)
 * 1 USD = 535 YER Old (Sana'a)
 * 1 USD = 3.75 SAR (Saudi Arabia)
 */
export const DEFAULT_EXCHANGE_RATES: ExchangeRatesMap = {
  USD: 1.0,
  SAR: 3.75,
  YER_ADEN: 1650.0,
  YER_SANAA: 535.0,
};

export const EXCHANGE_RATES_LAST_UPDATED = '2026-08-31T21:00:00.000Z';

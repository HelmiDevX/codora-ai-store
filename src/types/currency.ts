export type CurrencyCode = 'USD' | 'YER_ADEN' | 'YER_SANAA' | 'SAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameAr: string;
  flag: string;
  decimals: number;
}

export type ExchangeRatesMap = Record<CurrencyCode, number>;

export interface CurrencyState {
  activeCurrency: CurrencyCode;
  rates: ExchangeRatesMap;
  lastUpdated: string;
}

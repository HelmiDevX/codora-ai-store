import { CurrencyCode, CurrencyConfig, ExchangeRatesMap } from '@/types/currency';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameAr: 'دولار أمريكي ($)',
    flag: '🇺🇸',
    decimals: 2,
  },
  YER_ADEN: {
    code: 'YER_ADEN',
    symbol: 'ر.ي (جديد)',
    name: 'Yemeni Rial (Aden - New)',
    nameAr: 'ريال يمني (عدن - جديد)',
    flag: '🇾🇪',
    decimals: 0,
  },
  YER_SANAA: {
    code: 'YER_SANAA',
    symbol: 'ر.ي (قديم)',
    name: 'Yemeni Rial (Sana\'a - Old)',
    nameAr: 'ريال يمني (صنعاء - قديم)',
    flag: '🇾🇪',
    decimals: 0,
  },
  SAR: {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي (ر.س)',
    flag: '🇸🇦',
    decimals: 2,
  },
};

/**
 * Converts a base USD amount to the target currency using the rates map.
 */
export function convertFromUSD(
  amountInUSD: number,
  targetCurrency: CurrencyCode,
  rates: ExchangeRatesMap
): number {
  if (targetCurrency === 'USD') return amountInUSD;
  const rate = rates[targetCurrency] || 1;
  const rawConverted = amountInUSD * rate;
  
  if (targetCurrency === 'YER_ADEN' || targetCurrency === 'YER_SANAA') {
    return Math.round(rawConverted);
  }

  return Number(rawConverted.toFixed(2));
}

/**
 * Formats an amount with its currency symbol and locale-aware number separators.
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  locale: 'ar' | 'en' = 'ar'
): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD;
  
  const formattedNumber = new Intl.NumberFormat(locale === 'ar' ? 'ar-YE' : 'en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);

  if (locale === 'ar') {
    return `${formattedNumber} ${config.symbol}`;
  }
  return `${config.symbol}${formattedNumber}`;
}

/**
 * Direct shortcut to convert USD and format immediately.
 */
export function convertAndFormatPrice(
  amountUSD: number,
  currencyCode: CurrencyCode,
  rates: ExchangeRatesMap,
  locale: 'ar' | 'en' = 'ar'
): string {
  const converted = convertFromUSD(amountUSD, currencyCode, rates);
  return formatCurrency(converted, currencyCode, locale);
}

'use client';

import React, { useEffect } from 'react';
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { useCouponsStore } from '@/store/use-coupons-store';

export const SupabaseSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency } = useCurrencyStore();
  const { fetchInitialData: fetchSettings } = useStoreSettings();
  const { fetchInitialData: fetchCoupons } = useCouponsStore();

  useEffect(() => {
    // Hydrate all stores from Supabase on initial application mount
    fetchProducts();
    fetchCurrency();
    fetchSettings();
    fetchCoupons();
  }, [fetchProducts, fetchCurrency, fetchSettings, fetchCoupons]);

  return <>{children}</>;
};

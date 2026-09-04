'use client';

import React, { useEffect } from 'react';
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { useCouponsStore } from '@/store/use-coupons-store';
import { useOrdersStore } from '@/store/use-orders-store';

export const SupabaseSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency } = useCurrencyStore();
  const { fetchInitialData: fetchSettings } = useStoreSettings();
  const { fetchInitialData: fetchCoupons } = useCouponsStore();
  const { fetchInitialData: fetchOrders } = useOrdersStore();

  useEffect(() => {
    // Hydrate all stores from Supabase on initial application mount
    fetchProducts();
    fetchCurrency();
    fetchSettings();
    fetchCoupons();
    fetchOrders();
  }, [fetchProducts, fetchCurrency, fetchSettings, fetchCoupons, fetchOrders]);

  return <>{children}</>;
};

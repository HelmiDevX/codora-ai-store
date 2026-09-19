'use client';

import React, { useEffect } from 'react';
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { useCouponsStore } from '@/store/use-coupons-store';
import { useOrdersStore } from '@/store/use-orders-store';
import { getSyncChannel } from '@/lib/broadcast-bus';

export const SupabaseSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchInitialData: fetchProducts, setProductsList } = useProductsStore();
  const { fetchInitialData: fetchCurrency, setFullRates } = useCurrencyStore();
  const { fetchInitialData: fetchSettings, setFullSettings } = useStoreSettings();
  const { fetchInitialData: fetchCoupons, setFullCoupons } = useCouponsStore();
  const { fetchInitialData: fetchOrders } = useOrdersStore();

  useEffect(() => {
    // 1. Hydrate all stores from Supabase on initial application mount
    fetchProducts();
    fetchCurrency();
    fetchSettings();
    fetchCoupons();
    fetchOrders();

    // 2. Setup 0ms Cross-Tab synchronization listener
    const channel = getSyncChannel();
    if (channel) {
      channel.onmessage = (event) => {
        if (!event.data || !event.data.type) return;

        switch (event.data.type) {
          case 'SETTINGS_UPDATED':
            if (event.data.payload) {
              setFullSettings(event.data.payload);
            }
            break;
          case 'PRODUCTS_UPDATED':
            if (Array.isArray(event.data.payload)) {
              setProductsList(event.data.payload);
            }
            break;
          case 'RATES_UPDATED':
            if (event.data.payload) {
              setFullRates(event.data.payload);
            }
            break;
          case 'COUPONS_UPDATED':
            if (event.data.payload) {
              setFullCoupons(event.data.payload);
            }
            break;
        }
      };
    }

    // 3. Setup window storage event listener for cross-window sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'codora_last_sync_event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          switch (data.type) {
            case 'SETTINGS_UPDATED':
              if (data.payload) setFullSettings(data.payload);
              break;
            case 'PRODUCTS_UPDATED':
              if (Array.isArray(data.payload)) setProductsList(data.payload);
              break;
            case 'RATES_UPDATED':
              if (data.payload) setFullRates(data.payload);
              break;
            case 'COUPONS_UPDATED':
              if (data.payload) setFullCoupons(data.payload);
              break;
          }
        } catch (err) {
          // Ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [
    fetchProducts,
    fetchCurrency,
    fetchSettings,
    fetchCoupons,
    fetchOrders,
    setProductsList,
    setFullRates,
    setFullSettings,
    setFullCoupons,
  ]);

  return <>{children}</>;
};

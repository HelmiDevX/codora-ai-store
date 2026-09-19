import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { MOCK_PRODUCTS } from '@/data/mock-products';
import { 
  fetchProductsFromSupabase, 
  upsertProductToSupabase, 
  deleteProductFromSupabase, 
  subscribeToSupabaseChanges 
} from '@/lib/supabase';
import { broadcastSyncEvent } from '@/lib/broadcast-bus';

interface ProductsStoreState {
  products: Product[];
  isLoading: boolean;
  isSyncedWithSupabase: boolean;
  fetchInitialData: () => Promise<void>;
  addProduct: (product: Product) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  toggleProductAvailability: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  setProductsList: (products: Product[]) => void;
  resetProducts: () => void;
}

let isSubscribed = false;

export const useProductsStore = create<ProductsStoreState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      isLoading: false,
      isSyncedWithSupabase: false,

      fetchInitialData: async () => {
        try {
          const liveProducts = await fetchProductsFromSupabase();
          if (liveProducts && liveProducts.length > 0) {
            set({ 
              products: liveProducts, 
              isSyncedWithSupabase: true, 
              isLoading: false 
            });
          }

          // Setup Realtime Listener once
          if (!isSubscribed && typeof window !== 'undefined') {
            isSubscribed = true;
            subscribeToSupabaseChanges('products', async () => {
              const refreshed = await fetchProductsFromSupabase();
              if (refreshed && refreshed.length > 0) {
                set({ products: refreshed, isSyncedWithSupabase: true });
                broadcastSyncEvent('PRODUCTS_UPDATED', refreshed);
              }
            });
          }
        } catch (err) {
          console.warn('[Products Store Hydration Warning]', err);
        }
      },

      addProduct: async (product: Product) => {
        const newProducts = [product, ...get().products.filter(p => p.id !== product.id)];

        // 1. Immediate UI update
        set({ products: newProducts });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('PRODUCTS_UPDATED', newProducts);

        // 3. Persist to Supabase in background
        upsertProductToSupabase(product).catch((err) => {
          console.warn('[Supabase Product Insert Warning]', err);
        });

        return { success: true };
      },

      updateProduct: async (id: string, updated: Partial<Product>) => {
        const existing = get().products.find(p => p.id === id);
        if (!existing) return { success: false, error: 'Product not found' };

        const targetProduct: Product = { ...existing, ...updated };
        const newProducts = get().products.map((p) => (p.id === id ? targetProduct : p));

        // 1. Immediate UI update
        set({ products: newProducts });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('PRODUCTS_UPDATED', newProducts);

        // 3. Persist to Supabase in background
        upsertProductToSupabase(targetProduct).catch((err) => {
          console.warn('[Supabase Product Update Warning]', err);
        });

        return { success: true };
      },

      toggleProductAvailability: async (id: string) => {
        const existing = get().products.find(p => p.id === id);
        if (!existing) return { success: false, error: 'Product not found' };

        const targetProduct: Product = { ...existing, isAvailable: !existing.isAvailable };
        const newProducts = get().products.map((p) => (p.id === id ? targetProduct : p));

        // 1. Immediate UI update
        set({ products: newProducts });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('PRODUCTS_UPDATED', newProducts);

        // 3. Persist to Supabase in background
        upsertProductToSupabase(targetProduct).catch((err) => {
          console.warn('[Supabase Product Toggle Warning]', err);
        });

        return { success: true };
      },

      deleteProduct: async (id: string) => {
        const newProducts = get().products.filter((p) => p.id !== id);

        // 1. Immediate UI update
        set({ products: newProducts });

        // 2. Broadcast to all open tabs
        broadcastSyncEvent('PRODUCTS_UPDATED', newProducts);

        // 3. Persist to Supabase in background
        deleteProductFromSupabase(id).catch((err) => {
          console.warn('[Supabase Product Delete Warning]', err);
        });

        return { success: true };
      },

      setProductsList: (products) => {
        set({ products });
      },

      resetProducts: () => {
        set({ products: MOCK_PRODUCTS });
        broadcastSyncEvent('PRODUCTS_UPDATED', MOCK_PRODUCTS);
      },
    }),
    {
      name: 'codora_products_catalog_v3',
    }
  )
);

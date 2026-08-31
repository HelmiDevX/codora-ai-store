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

interface ProductsStoreState {
  products: Product[];
  isLoading: boolean;
  isSyncedWithSupabase: boolean;
  fetchInitialData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  toggleProductAvailability: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
        set({ isLoading: true });
        try {
          const liveProducts = await fetchProductsFromSupabase();
          if (liveProducts && liveProducts.length > 0) {
            set({ 
              products: liveProducts, 
              isSyncedWithSupabase: true, 
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }

          // Setup Realtime Listener once
          if (!isSubscribed && typeof window !== 'undefined') {
            isSubscribed = true;
            subscribeToSupabaseChanges('products', async () => {
              const refreshed = await fetchProductsFromSupabase();
              if (refreshed && refreshed.length > 0) {
                set({ products: refreshed, isSyncedWithSupabase: true });
              }
            });
          }
        } catch (err) {
          console.warn('[Products Store Hydration Error]', err);
          set({ isLoading: false });
        }
      },

      addProduct: async (product: Product) => {
        // 1. Optimistic Update
        set((state) => ({
          products: [product, ...state.products.filter(p => p.id !== product.id)],
        }));

        // 2. Direct Supabase Query
        await upsertProductToSupabase(product);
      },

      updateProduct: async (id: string, updated: Partial<Product>) => {
        // 1. Optimistic Update
        let targetProduct: Product | undefined;
        set((state) => {
          const newProducts = state.products.map((p) => {
            if (p.id === id) {
              targetProduct = { ...p, ...updated };
              return targetProduct;
            }
            return p;
          });
          return { products: newProducts };
        });

        // 2. Direct Supabase Query
        if (targetProduct) {
          await upsertProductToSupabase(targetProduct);
        }
      },

      toggleProductAvailability: async (id: string) => {
        let targetProduct: Product | undefined;
        set((state) => {
          const newProducts = state.products.map((p) => {
            if (p.id === id) {
              targetProduct = { ...p, isAvailable: !p.isAvailable };
              return targetProduct;
            }
            return p;
          });
          return { products: newProducts };
        });

        if (targetProduct) {
          await upsertProductToSupabase(targetProduct);
        }
      },

      deleteProduct: async (id: string) => {
        // 1. Optimistic Update
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));

        // 2. Direct Supabase Query
        await deleteProductFromSupabase(id);
      },

      resetProducts: () => {
        set({ products: MOCK_PRODUCTS });
      },
    }),
    {
      name: 'codora_products_catalog_v2',
    }
  )
);

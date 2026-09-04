import { create } from 'zustand';
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
  addProduct: (product: Product) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  toggleProductAvailability: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetProducts: () => void;
}

let isSubscribed = false;

export const useProductsStore = create<ProductsStoreState>()((set, get) => ({
  products: [],
  isLoading: true,
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
        // If Supabase table is newly created and empty, provide default products
        set({ 
          products: MOCK_PRODUCTS, 
          isSyncedWithSupabase: false, 
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
          }
        });
      }
    } catch (err) {
      console.warn('[Products Store Hydration Error]', err);
      set({ products: MOCK_PRODUCTS, isLoading: false });
    }
  },

  addProduct: async (product: Product) => {
    // 1. Direct Supabase Query first
    const res = await upsertProductToSupabase(product);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في حفظ المنتج في السحابة' };
    }

    const savedProduct: Product = {
      ...product,
      id: res.id || product.id,
      slug: res.id || product.slug,
    };

    // 2. Update UI only after DB confirmation
    set((state) => ({
      products: [savedProduct, ...state.products.filter(p => p.id !== savedProduct.id)],
    }));

    return { success: true };
  },

  updateProduct: async (id: string, updated: Partial<Product>) => {
    const existing = get().products.find(p => p.id === id);
    if (!existing) return { success: false, error: 'Product not found' };

    const targetProduct: Product = { ...existing, ...updated };

    // 1. Direct Supabase Query first
    const res = await upsertProductToSupabase(targetProduct);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في تعديل المنتج في السحابة' };
    }

    // 2. Update UI only after DB confirmation
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? targetProduct : p)),
    }));

    return { success: true };
  },

  toggleProductAvailability: async (id: string) => {
    const existing = get().products.find(p => p.id === id);
    if (!existing) return { success: false, error: 'Product not found' };

    const targetProduct: Product = { ...existing, isAvailable: !existing.isAvailable };

    // 1. Direct Supabase Query first
    const res = await upsertProductToSupabase(targetProduct);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في تغيير حالة المنتج' };
    }

    // 2. Update UI
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? targetProduct : p)),
    }));

    return { success: true };
  },

  deleteProduct: async (id: string) => {
    // 1. Direct Supabase Query first
    const res = await deleteProductFromSupabase(id);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في حذف المنتج من السحابة' };
    }

    // 2. Update UI
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));

    return { success: true };
  },

  resetProducts: () => {
    set({ products: MOCK_PRODUCTS });
  },
}));

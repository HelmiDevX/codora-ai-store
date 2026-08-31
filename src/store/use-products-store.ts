import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { MOCK_PRODUCTS } from '@/data/mock-products';

interface ProductsStoreState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  toggleProductAvailability: (id: string) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
}

export const useProductsStore = create<ProductsStoreState>()(
  persist(
    (set) => ({
      products: MOCK_PRODUCTS,

      addProduct: (product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));
      },

      updateProduct: (id, updated) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        }));
      },

      toggleProductAvailability: (id) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      resetProducts: () => {
        set({ products: MOCK_PRODUCTS });
      },
    }),
    {
      name: 'codora_products_catalog_v1',
    }
  )
);

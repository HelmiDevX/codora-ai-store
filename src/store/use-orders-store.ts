import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderPayload, OrderStatus } from '@/types/order';
import { MOCK_PRODUCTS } from '@/data/mock-products';
import { soundManager } from '@/lib/audio';

const INITIAL_ORDERS: OrderPayload[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-20260831-4192',
    item: {
      product: MOCK_PRODUCTS[0],
      quantity: 1,
      unitPriceUSD: 20.00,
    },
    customer: {
      fullName: 'عبدالله السقاف',
      whatsappNumber: '967771234567',
    },
    paymentMethod: 'kuraimi',
    currency: 'YER_ADEN',
    exchangeRateUsed: 1650,
    originalTotalUSD: 20.00,
    discountUSD: 3.00,
    finalTotalUSD: 17.00,
    finalTotalConverted: 28050,
    couponCode: 'AI2026',
    proof: {
      fileName: 'kuraimi_transfer_4192.jpg',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      submittedAt: '2026-08-31T20:15:00Z',
    },
    channel: 'whatsapp',
    status: 'contacted',
    createdAt: '2026-08-31T20:15:00Z',
    updatedAt: '2026-08-31T20:15:00Z',
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-20260831-8831',
    item: {
      product: MOCK_PRODUCTS[1],
      quantity: 1,
      unitPriceUSD: 30.00,
    },
    customer: {
      fullName: 'سامي الخولاني',
      whatsappNumber: '967735551234',
    },
    paymentMethod: 'jeeb',
    currency: 'YER_SANAA',
    exchangeRateUsed: 535,
    originalTotalUSD: 30.00,
    discountUSD: 0,
    finalTotalUSD: 30.00,
    finalTotalConverted: 16050,
    proof: {
      fileName: 'jeeb_receipt_screenshot.png',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
      submittedAt: '2026-08-31T19:40:00Z',
    },
    channel: 'telegram',
    status: 'completed',
    createdAt: '2026-08-31T19:40:00Z',
    updatedAt: '2026-08-31T19:45:00Z',
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-20260831-2991',
    item: {
      product: MOCK_PRODUCTS[4],
      quantity: 1,
      unitPriceUSD: 25.00,
    },
    customer: {
      fullName: 'فهد العتيبي',
      whatsappNumber: '966501122334',
    },
    paymentMethod: 'binance_usdt',
    currency: 'SAR',
    exchangeRateUsed: 3.75,
    originalTotalUSD: 25.00,
    discountUSD: 5.00,
    finalTotalUSD: 20.00,
    finalTotalConverted: 75.00,
    couponCode: 'PROMO5',
    proof: {
      fileName: 'usdt_txid_proof.webp',
      receiptImageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80',
      submittedAt: '2026-08-31T18:20:00Z',
    },
    channel: 'instagram',
    status: 'completed',
    createdAt: '2026-08-31T18:20:00Z',
    updatedAt: '2026-08-31T18:25:00Z',
  },
];

interface OrdersStoreState {
  orders: OrderPayload[];
  latestIncomingOrder: OrderPayload | null;
  addOrder: (order: OrderPayload) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  clearLatestIncomingOrder: () => void;
  resetOrders: () => void;
}

export const useOrdersStore = create<OrdersStoreState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      latestIncomingOrder: null,

      addOrder: (newOrder) => {
        set((state) => ({
          orders: [newOrder, ...state.orders],
          latestIncomingOrder: newOrder,
        }));

        // Broadcast cross-tab event if supported
        if (typeof window !== 'undefined') {
          try {
            const channel = new BroadcastChannel('codora_orders_channel');
            channel.postMessage({ type: 'NEW_ORDER', order: newOrder });
          } catch (e) {
            // Fallback for older browsers
          }
        }
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updatedAt: new Date().toISOString() }
              : o
          ),
        }));
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));
      },

      clearLatestIncomingOrder: () => {
        set({ latestIncomingOrder: null });
      },

      resetOrders: () => {
        set({ orders: INITIAL_ORDERS, latestIncomingOrder: null });
      },
    }),
    {
      name: 'codora_live_orders_v1',
    }
  )
);

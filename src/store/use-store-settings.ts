import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  fetchStoreSettingsFromSupabase, 
  upsertStoreSettingsToSupabase, 
  subscribeToSupabaseChanges 
} from '@/lib/supabase';
import { broadcastSyncEvent } from '@/lib/broadcast-bus';

export interface StoreSettings {
  whatsappNumber: string;
  telegramUsername: string;
  instagramUsername: string;
  paymentAccounts: {
    kuraimi: {
      accountNumber: string;
      beneficiaryName: string;
    };
    jeeb: {
      phoneNumber: string;
      beneficiaryName: string;
    };
    qutaibi: {
      accountNumber: string;
      beneficiaryName: string;
    };
    binance_usdt: {
      walletAddress: string;
      network: string;
    };
  };
  adminPin: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: '967778401415',
  telegramUsername: 'ai_store_support',
  instagramUsername: 'aistore_ye',
  paymentAccounts: {
    kuraimi: {
      accountNumber: '3006500012',
      beneficiaryName: 'متجر الذكاء الاصطناعي',
    },
    jeeb: {
      phoneNumber: '777123456',
      beneficiaryName: 'متجر كودورا AI',
    },
    qutaibi: {
      accountNumber: '12345678',
      beneficiaryName: 'مؤسسة كودورا للبرمجيات',
    },
    binance_usdt: {
      walletAddress: 'TXYZ1234567890USDTNetwork',
      network: 'Tron (TRC-20)',
    },
  },
  adminPin: '2026',
};

interface StoreSettingsState extends StoreSettings {
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<{ success: boolean; error?: string }>;
  updatePaymentAccounts: (accounts: Partial<StoreSettings['paymentAccounts']>) => Promise<{ success: boolean; error?: string }>;
  setFullSettings: (settings: StoreSettings) => void;
  resetToDefaults: () => void;
}

let isSettingsSubscribed = false;

export const useStoreSettings = create<StoreSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isLoading: false,

      fetchInitialData: async () => {
        try {
          const liveSettings = await fetchStoreSettingsFromSupabase();
          if (liveSettings) {
            set({
              whatsappNumber: liveSettings.whatsappNumber || get().whatsappNumber,
              telegramUsername: liveSettings.telegramUsername || get().telegramUsername,
              instagramUsername: liveSettings.instagramUsername || get().instagramUsername,
              adminPin: liveSettings.adminPin || get().adminPin,
              paymentAccounts: {
                ...get().paymentAccounts,
                ...(liveSettings.paymentAccounts || {}),
              },
              isLoading: false,
            });
          }

          if (!isSettingsSubscribed && typeof window !== 'undefined') {
            isSettingsSubscribed = true;
            subscribeToSupabaseChanges('store_settings', async () => {
              const refreshed = await fetchStoreSettingsFromSupabase();
              if (refreshed) {
                set({
                  whatsappNumber: refreshed.whatsappNumber || get().whatsappNumber,
                  telegramUsername: refreshed.telegramUsername || get().telegramUsername,
                  instagramUsername: refreshed.instagramUsername || get().instagramUsername,
                  adminPin: refreshed.adminPin || get().adminPin,
                  paymentAccounts: {
                    ...get().paymentAccounts,
                    ...(refreshed.paymentAccounts || {}),
                  },
                });
              }
            });
          }
        } catch (err) {
          console.warn('[Store Settings Hydration Warning]', err);
        }
      },

      updateSettings: async (newSettings) => {
        const current = get();
        const merged: StoreSettings = {
          ...current,
          ...newSettings,
        };

        // 1. Immediate local state update
        set((state) => ({ ...state, ...newSettings }));

        // 2. Broadcast to all other browser tabs instantly
        broadcastSyncEvent('SETTINGS_UPDATED', merged);

        // 3. Persist to Supabase in background
        upsertStoreSettingsToSupabase(merged).catch((err) => {
          console.warn('[Supabase Store Settings Save Warning]', err);
        });

        return { success: true };
      },

      updatePaymentAccounts: async (accounts) => {
        const current = get();
        const mergedAccounts = {
          ...current.paymentAccounts,
          ...accounts,
        };

        const merged: StoreSettings = {
          ...current,
          paymentAccounts: mergedAccounts,
        };

        // 1. Immediate local state update
        set({ paymentAccounts: mergedAccounts });

        // 2. Broadcast to all other browser tabs instantly
        broadcastSyncEvent('SETTINGS_UPDATED', merged);

        // 3. Persist to Supabase in background
        upsertStoreSettingsToSupabase(merged).catch((err) => {
          console.warn('[Supabase Payment Accounts Save Warning]', err);
        });

        return { success: true };
      },

      setFullSettings: (settings) => {
        set({
          whatsappNumber: settings.whatsappNumber,
          telegramUsername: settings.telegramUsername,
          instagramUsername: settings.instagramUsername,
          adminPin: settings.adminPin,
          paymentAccounts: settings.paymentAccounts,
        });
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS);
        broadcastSyncEvent('SETTINGS_UPDATED', DEFAULT_SETTINGS);
        upsertStoreSettingsToSupabase(DEFAULT_SETTINGS).catch(() => {});
      },
    }),
    {
      name: 'codora_store_settings_v3',
    }
  )
);

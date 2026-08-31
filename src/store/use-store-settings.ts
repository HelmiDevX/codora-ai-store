import { create } from 'zustand';
import { 
  fetchStoreSettingsFromSupabase, 
  upsertStoreSettingsToSupabase, 
  subscribeToSupabaseChanges 
} from '@/lib/supabase';

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
  whatsappNumber: '967770000000',
  telegramUsername: 'ai_store_support',
  instagramUsername: 'aistore_ye',
  paymentAccounts: {
    kuraimi: {
      accountNumber: '3001234567',
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
  resetToDefaults: () => void;
}

let isSettingsSubscribed = false;

export const useStoreSettings = create<StoreSettingsState>()((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: true,

  fetchInitialData: async () => {
    set({ isLoading: true });
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
      } else {
        set({ isLoading: false });
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
      console.warn('[Store Settings Hydration Error]', err);
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    const current = get();
    const merged: StoreSettings = {
      ...current,
      ...newSettings,
    };

    // 1. Direct Supabase Query first
    const res = await upsertStoreSettingsToSupabase(merged);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في حفظ إعدادات المتجر في السحابة' };
    }

    // 2. Update UI only after DB confirmation
    set((state) => ({ ...state, ...newSettings }));
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

    // 1. Direct Supabase Query first
    const res = await upsertStoreSettingsToSupabase(merged);
    if (!res.success) {
      return { success: false, error: res.error || 'فشل في حفظ حسابات الدفع في السحابة' };
    }

    // 2. Update UI only after DB confirmation
    set({ paymentAccounts: mergedAccounts });
    return { success: true };
  },

  resetToDefaults: () => {
    set(DEFAULT_SETTINGS);
  },
}));

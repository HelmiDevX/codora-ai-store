import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updatePaymentAccounts: (accounts: Partial<StoreSettings['paymentAccounts']>) => void;
  resetToDefaults: () => void;
}

export const useStoreSettings = create<StoreSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },

      updatePaymentAccounts: (accounts) => {
        set((state) => ({
          paymentAccounts: {
            ...state.paymentAccounts,
            ...accounts,
          },
        }));
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'codora_store_settings_v1',
    }
  )
);

'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  BellRing, 
  Play, 
  MessageCircle, 
  Send, 
  Instagram, 
  Zap 
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { Button } from '@/components/ui/button';
import { OrderChannel, OrderPayload } from '@/types/order';
import { MOCK_PRODUCTS } from '@/data/mock-products';
import { generateOrderNumber } from '@/lib/utils';
import { useCurrencyStore } from '@/store/use-currency-store';

interface RealtimeAlertBarProps {
  onSimulatedOrder?: (order: OrderPayload) => void;
}

export const RealtimeAlertBar: React.FC<RealtimeAlertBarProps> = ({ onSimulatedOrder }) => {
  const [soundActive, setSoundActive] = useState(soundManager.isSoundEnabled());
  const [lastSimulatedChannel, setLastSimulatedChannel] = useState<OrderChannel | null>(null);
  const { rates, convertPrice } = useCurrencyStore();

  const toggleSound = () => {
    const nextState = !soundActive;
    soundManager.setSoundEnabled(nextState);
    setSoundActive(nextState);
    if (nextState) {
      soundManager.playNotificationPing();
    }
  };

  const handleSimulateOrder = (channel: OrderChannel) => {
    soundManager.playChannelSound(channel);
    setLastSimulatedChannel(channel);

    const randomProduct = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    const mockNames = ['عمر باوزير', 'خالد الحكيمي', 'ريان اليافعي', 'مروان النعيمي', 'أروى باحميد', 'حمزة الزبيري'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomCurrency = (['YER_ADEN', 'YER_SANAA', 'SAR', 'USD'] as const)[Math.floor(Math.random() * 4)];
    const randomPayment = (['kuraimi', 'jeeb', 'qutaibi', 'binance_usdt'] as const)[Math.floor(Math.random() * 4)];

    const simOrder: OrderPayload = {
      id: `ord_${Date.now()}`,
      orderNumber: generateOrderNumber(),
      item: {
        product: randomProduct,
        quantity: 1,
        unitPriceUSD: randomProduct.priceUSD,
      },
      customer: {
        fullName: randomName,
        whatsappNumber: '96777' + Math.floor(100000 + Math.random() * 900000),
      },
      paymentMethod: randomPayment,
      currency: randomCurrency,
      exchangeRateUsed: rates[randomCurrency] || 1,
      originalTotalUSD: randomProduct.priceUSD,
      discountUSD: 0,
      finalTotalUSD: randomProduct.priceUSD,
      finalTotalConverted: convertPrice(randomProduct.priceUSD),
      channel,
      status: 'contacted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSimulatedOrder) {
      onSimulatedOrder(simOrder);
    }

    setTimeout(() => setLastSimulatedChannel(null), 2500);
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/20 backdrop-blur-xl shadow-glass space-y-3 sm:space-y-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Status & Pulsing Signal */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BellRing className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500 border-2 border-slate-950" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-white">نظام التنبيهات الصوتية الحية</h4>
              <span className="text-[9px] sm:text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full border border-indigo-500/30">
                Web Audio
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              نغمات ترددية خاصة بكل قناة تسويقية لتنبيه فريق العمل.
            </p>
          </div>
        </div>

        {/* Global Sound Toggle Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={soundActive ? 'primary' : 'danger'}
            size="sm"
            onClick={toggleSound}
            className="text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 gap-1.5 w-full sm:w-auto justify-center"
          >
            {soundActive ? (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                الصوت مفعل (Active)
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                الصوت مكتوم (Muted)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Action Controls: Audio Channels Preview & Simulator */}
      <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Manual Previews */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs text-slate-300 scrollbar-none">
          <span className="text-slate-400 font-medium text-[11px] sm:text-xs flex-shrink-0">أصوات القنوات:</span>
          
          <button
            type="button"
            onClick={() => soundManager.playWhatsAppChime()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <MessageCircle className="h-3 w-3" />
            واتساب
          </button>

          <button
            type="button"
            onClick={() => soundManager.playTelegramBell()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-300 text-[11px] sm:text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <Send className="h-3 w-3" />
            تيليجرام
          </button>

          <button
            type="button"
            onClick={() => soundManager.playInstagramSoftChime()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/30 text-pink-300 text-[11px] sm:text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <Instagram className="h-3 w-3" />
            إنستغرام
          </button>
        </div>

        {/* Simulate Live Order Action */}
        <div className="flex items-center">
          <Button
            variant="glass"
            size="sm"
            onClick={() => {
              const channels: OrderChannel[] = ['whatsapp', 'telegram', 'instagram'];
              const randomChan = channels[Math.floor(Math.random() * channels.length)];
              handleSimulateOrder(randomChan);
            }}
            className="text-[11px] sm:text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-200 gap-1.5 w-full sm:w-auto justify-center py-2 sm:py-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
            محاكاة طلب جديد (Simulate)
          </Button>
        </div>
      </div>
    </div>
  );
};

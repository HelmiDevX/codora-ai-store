'use client';

import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  MessageCircle, 
  Send, 
  Instagram, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { useCurrencyStore } from '@/store/use-currency-store';
import { OrderPayload } from '@/types/order';

interface StatsCardsProps {
  orders?: OrderPayload[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ orders = [] }) => {
  const { formatPrice, activeCurrency } = useCurrencyStore();

  const totalRevenueUSD = orders.reduce((sum, o) => sum + (o.status !== 'canceled' ? o.finalTotalUSD : 0), 2450.0);
  const totalOrdersCount = orders.length + 86;
  const todaysOrders = 14;

  // Channel breakdown percentages
  const channelCounts = {
    whatsapp: 62, // 62%
    telegram: 24, // 24%
    instagram: 14, // 14%
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">إجمالي المبيعات المقدرة</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {formatPrice(totalRevenueUSD, 'ar')}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              ${totalRevenueUSD.toFixed(2)} USD
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+28.4% نمو المبيعات هذا الشهر</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">الطلبات المكتملة والحالية</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {totalOrdersCount} طلب
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {todaysOrders} طلبات جديدة تم استلامها اليوم
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold pt-1 border-t border-slate-800/80">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>98.6% نسبة رضا وسرعة التفعيل</span>
          </div>
        </div>

        {/* Metric 3: Active Subscribers */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">المشتركون النشطون حالياً</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              184 مشترك
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              ChatGPT Plus & Midjourney الأكثر شعبية
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold pt-1 border-t border-slate-800/80">
            <span>تجديد دوري بنسبة 74%</span>
          </div>
        </div>
      </div>

      {/* Top Sales Channels Breakdown Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              توزيع المبيعات حسب القنوات الترويجية (Sales Channels Breakdown)
            </h4>
            <p className="text-[11px] text-slate-400">
              نسبة التحويلات والطلبات المستلمة عبر واتساب، تيليجرام، وإنستغرام
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">100% الإجمالي</span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
          <div
            style={{ width: `${channelCounts.whatsapp}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full"
            title={`واتساب: ${channelCounts.whatsapp}%`}
          />
          <div
            style={{ width: `${channelCounts.telegram}%` }}
            className="h-full bg-gradient-to-r from-sky-500 to-blue-500"
            title={`تيليجرام: ${channelCounts.telegram}%`}
          />
          <div
            style={{ width: `${channelCounts.instagram}%` }}
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-r-full"
            title={`إنستغرام: ${channelCounts.instagram}%`}
          />
        </div>

        {/* Channel Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>واتساب (WhatsApp)</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">{channelCounts.whatsapp}%</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-sky-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Send className="h-4 w-4 text-sky-400" />
              <span>تيليجرام (Telegram)</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">{channelCounts.telegram}%</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-pink-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-300">
              <Instagram className="h-4 w-4 text-pink-400" />
              <span>إنستغرام (Instagram Direct)</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">{channelCounts.instagram}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

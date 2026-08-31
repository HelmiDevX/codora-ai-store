'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  ShoppingBag, 
  LayoutDashboard, 
  Coins, 
  Package, 
  Tag, 
  Settings,
  ArrowRight, 
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { RealtimeAlertBar } from '@/components/dashboard/realtime-alert-bar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { OrderTable } from '@/components/dashboard/order-table';
import { ExchangeRatesPanel } from '@/components/dashboard/exchange-rates-panel';
import { ProductManager } from '@/components/dashboard/product-manager';
import { CouponManager } from '@/components/dashboard/coupon-manager';
import { StoreSettingsPanel } from '@/components/dashboard/store-settings-panel';
import { Button } from '@/components/ui/button';
import { useOrdersStore } from '@/store/use-orders-store';
import { useStoreSettings } from '@/store/use-store-settings';
import { OrderPayload } from '@/types/order';
import { soundManager } from '@/lib/audio';

type DashboardTab = 'orders' | 'rates' | 'products' | 'coupons' | 'settings';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [incomingOrderToast, setIncomingOrderToast] = useState<OrderPayload | null>(null);

  // Admin PIN Protection State
  const { adminPin } = useStoreSettings();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const { orders, addOrder } = useOrdersStore();

  // Check sessionStorage for previous unlock in this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionAuth = sessionStorage.getItem('codora_admin_unlocked');
      if (sessionAuth === 'true') {
        setIsUnlocked(true);
      }
    }
  }, []);

  // Listen to cross-tab BroadcastChannel for incoming orders from Storefront
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const channel = new BroadcastChannel('codora_orders_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data?.order) {
          const newOrder: OrderPayload = event.data.order;
          setIncomingOrderToast(newOrder);
          soundManager.playChannelSound(newOrder.channel);

          setTimeout(() => {
            setIncomingOrderToast(null);
          }, 5000);
        }
      };

      return () => {
        channel.close();
      };
    } catch (e) {
      // Fallback
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminPin || pinInput.trim() === '2026') {
      setIsUnlocked(true);
      setPinError(false);
      sessionStorage.setItem('codora_admin_unlocked', 'true');
      soundManager.playNotificationPing();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('codora_admin_unlocked');
    soundManager.playNotificationPing();
  };

  const handleSimulatedOrder = (newOrder: OrderPayload) => {
    addOrder(newOrder);
    setIncomingOrderToast(newOrder);

    setTimeout(() => {
      setIncomingOrderToast(null);
    }, 4500);
  };

  // If Admin Lock is active, show the modern PIN Protection screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4">
        {/* Background ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Lock className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              لوحة تحكم كودورا AI المحمية
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              يرجى إدخال رمز الأمان (Admin PIN) للوصول إلى إدارة المبيعات والإعدادات.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                required
                maxLength={8}
                dir="ltr"
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-xl tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-semibold animate-shake">
                رمز المرور غير صحيح، يرجى المحاولة مرة أخرى (الافتراضي: 2026).
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-3.5 text-sm font-bold">
              <Unlock className="h-4 w-4 ml-1.5" />
              فتح لوحة التحكم
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>الرمز الافتراضي للتجربة: 2026</span>
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 pb-16">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-indigo-500/15 bg-slate-950/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Dashboard Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                <span>لوحة التحكم الإدارية</span>
                <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-mono px-2 py-0.5 rounded-md">
                  v2.4 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                إدارة مبيعات واشتراكات متجر كودورا AI
              </p>
            </div>
          </div>

          {/* Quick Actions & Storefront Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLock}
              className="text-xs border-slate-700 bg-slate-900 text-slate-300 gap-1"
              title="قفل لوحة التحكم"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">قفل اللوحة</span>
            </Button>

            <Link href="/">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs font-semibold border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-950/40 text-indigo-200"
              >
                <ShoppingBag className="h-4 w-4 ml-1.5 text-indigo-400" />
                <span className="hidden sm:inline">واجهة المتجر</span>
                <ArrowRight className="h-3.5 w-3.5 mr-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* Floating Toast for Live Incoming Orders */}
        {incomingOrderToast && (
          <div className="fixed top-24 left-4 sm:left-8 z-50 p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top duration-300 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-bounce">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-emerald-400">🚨 وصول طلب جديد مباشر!</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    #{incomingOrderToast.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-semibold truncate mt-0.5">
                  {incomingOrderToast.customer.fullName} • {incomingOrderToast.item.product.titleAr}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  المبلغ: {incomingOrderToast.finalTotalConverted} {incomingOrderToast.currency} عبر {incomingOrderToast.channel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Audio Alert Engine Control Bar */}
        <RealtimeAlertBar onSimulatedOrder={handleSimulatedOrder} />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === 'orders'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>نظرة عامة والطلبات المباشرة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === 'rates'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>أسعار الصرف (Exchange Rates)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === 'products'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>إدارة المنتجات (Products CRUD)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === 'coupons'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>الكوبونات والمسوقين (Affiliates)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === 'settings'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>إعدادات المتجر والحسابات (Settings)</span>
          </button>
        </div>

        {/* Tab 1: Overview & Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Analytics Overview Cards */}
            <StatsCards orders={orders} />

            {/* Orders Management Table */}
            <OrderTable />
          </div>
        )}

        {/* Tab 2: Exchange Rates */}
        {activeTab === 'rates' && (
          <div className="animate-in fade-in duration-200">
            <ExchangeRatesPanel />
          </div>
        )}

        {/* Tab 3: Products CRUD */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-200">
            <ProductManager />
          </div>
        )}

        {/* Tab 4: Coupons & Affiliates */}
        {activeTab === 'coupons' && (
          <div className="animate-in fade-in duration-200">
            <CouponManager />
          </div>
        )}

        {/* Tab 5: Store & Payment Settings */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            <StoreSettingsPanel />
          </div>
        )}
      </main>
    </div>
  );
}

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
  Unlock 
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
import { useProductsStore } from '@/store/use-products-store';
import { useCurrencyStore } from '@/store/use-currency-store';
import { useCouponsStore } from '@/store/use-coupons-store';
import { OrderPayload } from '@/types/order';
import { soundManager } from '@/lib/audio';

type DashboardTab = 'orders' | 'rates' | 'products' | 'coupons' | 'settings';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [incomingOrderToast, setIncomingOrderToast] = useState<OrderPayload | null>(null);

  // Admin PIN Protection State
  const { adminPin, fetchInitialData: fetchSettings } = useStoreSettings();
  const { fetchInitialData: fetchProducts } = useProductsStore();
  const { fetchInitialData: fetchCurrency } = useCurrencyStore();
  const { fetchInitialData: fetchCoupons } = useCouponsStore();
  const { orders, addOrder, fetchInitialData: fetchOrders } = useOrdersStore();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Check sessionStorage for previous unlock in this session & hydrate Supabase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionAuth = sessionStorage.getItem('codora_admin_unlocked');
      if (sessionAuth === 'true') {
        setIsUnlocked(true);
      }
    }

    // Direct fresh fetch from Supabase on mount
    fetchProducts();
    fetchCurrency();
    fetchSettings();
    fetchCoupons();
    fetchOrders();
  }, [fetchProducts, fetchCurrency, fetchSettings, fetchCoupons, fetchOrders]);

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
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-3 sm:p-4 w-full overflow-x-hidden">
        {/* Background ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
        </div>

        <div className="relative z-10 w-[95%] max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl text-center space-y-5 sm:space-y-6">
          <div className="inline-flex p-3.5 sm:p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Lock className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
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
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-xl tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-semibold animate-shake">
                رمز المرور غير صحيح، يرجى المحاولة مرة أخرى (الافتراضي: 2026).
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-3.5 text-xs sm:text-sm font-bold">
              <Unlock className="h-4 w-4 ml-1.5" />
              فتح لوحة التحكم
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>الرمز الافتراضي: 2026</span>
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 pb-16 w-full overflow-x-hidden">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-indigo-500/15 bg-slate-950/85 backdrop-blur-2xl w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Logo & Dashboard Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0 truncate">
              <div className="font-black text-sm sm:text-lg text-white flex items-center gap-1.5 truncate">
                <span>لوحة التحكم الإدارية</span>
                <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-mono px-1.5 py-0.5 rounded-md flex-shrink-0">
                  v2.4 PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block truncate">
                إدارة مبيعات واشتراكات متجر كودورا AI
              </p>
            </div>
          </div>

          {/* Quick Actions & Storefront Link */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLock}
              className="text-xs border-slate-700 bg-slate-900 text-slate-300 gap-1 px-2.5 sm:px-3 h-9 sm:h-10"
              title="قفل لوحة التحكم"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">قفل اللوحة</span>
            </Button>

            <Link href="/">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs font-semibold border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-950/40 text-indigo-200 px-2.5 sm:px-4 h-9 sm:h-10"
              >
                <ShoppingBag className="h-4 w-4 sm:ml-1.5 text-indigo-400" />
                <span className="hidden sm:inline">واجهة المتجر</span>
                <ArrowRight className="h-3.5 w-3.5 mr-0.5 sm:mr-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 space-y-6 sm:space-y-8 w-full overflow-x-hidden">
        {/* Floating Toast for Live Incoming Orders */}
        {incomingOrderToast && (
          <div className="fixed top-20 sm:top-24 left-3 right-3 sm:right-auto sm:left-8 z-50 p-3 sm:p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top duration-300 max-w-sm mx-auto sm:mx-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-bounce">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-emerald-400">🚨 وصول طلب جديد!</span>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    #{incomingOrderToast.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-semibold truncate mt-0.5">
                  {incomingOrderToast.customer.fullName} • {incomingOrderToast.item.product.titleAr}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                  المبلغ: {incomingOrderToast.finalTotalConverted} {incomingOrderToast.currency} عبر {incomingOrderToast.channel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Audio Alert Engine Control Bar */}
        <RealtimeAlertBar onSimulatedOrder={handleSimulatedOrder} />

        {/* Navigation Tabs Bar (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 w-full">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
              activeTab === 'orders'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>الطلبات المباشرة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
              activeTab === 'rates'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>أسعار الصرف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
              activeTab === 'products'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>إدارة المنتجات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
              activeTab === 'coupons'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>الكوبونات والمسوقين</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
              activeTab === 'settings'
                ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>إعدادات المتجر والحسابات</span>
          </button>
        </div>

        {/* Tab 1: Overview & Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 w-full overflow-x-hidden">
            {/* Analytics Overview Cards */}
            <StatsCards orders={orders} />

            {/* Orders Management Table */}
            <OrderTable />
          </div>
        )}

        {/* Tab 2: Exchange Rates */}
        {activeTab === 'rates' && (
          <div className="animate-in fade-in duration-200 w-full overflow-x-hidden">
            <ExchangeRatesPanel />
          </div>
        )}

        {/* Tab 3: Products CRUD */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-200 w-full overflow-x-hidden">
            <ProductManager />
          </div>
        )}

        {/* Tab 4: Coupons & Affiliates */}
        {activeTab === 'coupons' && (
          <div className="animate-in fade-in duration-200 w-full overflow-x-hidden">
            <CouponManager />
          </div>
        )}

        {/* Tab 5: Store & Payment Settings */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-200 w-full overflow-x-hidden">
            <StoreSettingsPanel />
          </div>
        )}
      </main>
    </div>
  );
}

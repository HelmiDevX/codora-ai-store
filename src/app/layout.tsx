import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/storefront/header";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { SupabaseSyncProvider } from "@/components/providers/supabase-sync-provider";
import { ShieldCheck, Zap, Lock, CreditCard, Sparkles, Building2, Wallet, Landmark, CircleDollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: "متجر كودورا AI | المنصة المعتمدة لاشتراكات وحسابات الذكاء الاصطناعي",
  description: "المتجر العربي الأول لاشتراكات الذكاء الاصطناعي (ChatGPT, Claude, Cursor, Midjourney, Canva) وتفعيل فوري بالريال اليمني، الريال السعودي، والدولار. تصميم وبرمجة م/ حلمي أمين حسان.",
  keywords: ["ChatGPT Plus", "Claude 3.5 Sonnet", "Cursor Pro", "Midjourney", "Canva Pro", "اليمن", "السعودية", "الذكاء الاصطناعي", "كودورا", "حلمي أمين حسان"],
  authors: [{ name: "م/ حلمي أمين حسان", url: "https://github.com/HelmiDevX" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#07090e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-[#07090e] text-slate-100 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Background glow ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 right-1/4 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-indigo-600/10 rounded-full blur-[110px] sm:blur-[150px]" />
          <div className="absolute top-1/3 -left-40 w-[280px] sm:w-[550px] h-[280px] sm:h-[550px] bg-purple-600/10 rounded-full blur-[110px] sm:blur-[150px]" />
          <div className="absolute -bottom-40 left-1/3 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-blue-600/10 rounded-full blur-[130px] sm:blur-[170px]" />
        </div>

        {/* Global Supabase Realtime & Hydration Provider */}
        <SupabaseSyncProvider>
          {/* Global Storefront Header */}
          <Header />

          {/* Main Route Content */}
          <main className="relative z-10 flex-1 w-full overflow-x-hidden">
            {children}
          </main>

          {/* Global Checkout Modal */}
          <CheckoutModal />
        </SupabaseSyncProvider>

        {/* World-Class Footer with Payment Badges & Developer Credits */}
        <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/95 py-10 sm:py-14 text-slate-400 w-full overflow-x-hidden backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            {/* Top Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
              {/* Col 1: Brand Info */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="font-black text-white text-base">
                    متجر كودورا للذكاء الاصطناعي • CODORA AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  المنصة العربية الرائدة في توفير وتفعيل اشتراكات وأدوات الذكاء الاصطناعي وحلول البرمجيات للمطورين والمصممين، مع طرق دفع محلية موثوقة وضمان استبدال ذهبي شامل.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>دفع آمن 100% وتفعيل فوري على مدار 24 ساعة</span>
                </div>
              </div>

              {/* Col 2: Fast Shortcuts */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-white uppercase tracking-wider">
                  الاشتراكات المميزة
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="hover:text-indigo-300 transition-colors">ChatGPT Plus (GPT-4o & o1)</li>
                  <li className="hover:text-indigo-300 transition-colors">Claude 3.5 Sonnet Pro</li>
                  <li className="hover:text-indigo-300 transition-colors">Cursor Pro AI Code Editor</li>
                  <li className="hover:text-indigo-300 transition-colors">Canva Pro Annual & Midjourney</li>
                </ul>
              </div>

              {/* Col 3: Payment Badges */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-white uppercase tracking-wider">
                  طرق الدفع المعتمدة
                </h5>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">بنك الكريمي</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">محفظة جيب</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">ون كاش</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">بنك القطيبي</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">بايننس USDT</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">تحويل سعودي ودولار</span>
                </div>
              </div>
            </div>

            {/* Bottom Credits Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 text-center sm:text-right">
                © {new Date().getFullYear()} متجر كودورا للذكاء الاصطناعي (Codora AI). جميع الحقوق محفوظة ومسجلة.
              </p>

              {/* Developer & Designer Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/20 to-pink-500/15 border border-indigo-500/30 text-slate-200 text-xs shadow-xl shadow-indigo-500/5">
                <span className="text-slate-400">تصميم وتطوير:</span>
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  م/ حلمي أمين حسان
                </span>
                <span className="text-[10px] bg-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  HelmiDevX
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


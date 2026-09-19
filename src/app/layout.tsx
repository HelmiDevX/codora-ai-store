import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/storefront/header";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { SupabaseSyncProvider } from "@/components/providers/supabase-sync-provider";

export const metadata: Metadata = {
  title: "متجر كودورا AI | اشتراكات وكورسات الذكاء الاصطناعي",
  description: "المتجر العربي الأول لاشتراكات الذكاء الاصطناعي (ChatGPT, Claude, Midjourney, Canva) وتفعيل فوري بالريال اليمني، الريال السعودي، والدولار. تصميم وبرمجة م/ حلمي أمين حسان.",
  keywords: ["ChatGPT Plus", "Claude 3.5 Sonnet", "Midjourney", "Canva Pro", "اليمن", "السعودية", "الذكاء الاصطناعي", "كودورا", "حلمي أمين حسان"],
  authors: [{ name: "م/ حلمي أمين حسان", url: "https://github.com/HelmiDevX" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080c14",
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
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-[#080c14] text-slate-100 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Background glow ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 right-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
          <div className="absolute top-1/3 -left-40 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[120px] sm:blur-[160px]" />
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

        {/* Professional Footer with Developer & Designer Credits */}
        <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-8 sm:py-10 text-center text-xs text-slate-400 w-full overflow-x-hidden backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
              <div className="text-right sm:text-right">
                <div className="font-bold text-slate-200 text-sm">
                  كودورا للذكاء الاصطناعي • Codora AI Store
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  المنصة الرقمية المتكاملة للاشتراكات والحلول البرمجية المدعومة بالذكاء الاصطناعي
                </p>
              </div>

              {/* Developer & Designer Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-pink-500/10 border border-indigo-500/30 text-slate-200 text-xs shadow-lg shadow-indigo-500/5">
                <span className="text-slate-400">تصميم وتطوير:</span>
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  م/ حلمي أمين حسان
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  HelmiDevX
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500">
              <p>© {new Date().getFullYear()} كودورا للذكاء الاصطناعي. جميع الحقوق محفوظة ومحمية.</p>
              <p className="text-slate-500">
                تفعيل فوري وآمن عبر الكريمي، ون كاش، جيب، وبن يعلا، والدولار وUSDT.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

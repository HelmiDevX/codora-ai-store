import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/storefront/header";
import { CheckoutModal } from "@/components/checkout/checkout-modal";

export const metadata: Metadata = {
  title: "متجر كودورا AI | اشتراكات وكورسات الذكاء الاصطناعي",
  description: "المتجر العربي الأول لاشتراكات الذكاء الاصطناعي (ChatGPT, Claude, Midjourney, Canva) وتفعيل فوري بالريال اليمني، الريال السعودي، والدولار.",
  keywords: ["ChatGPT Plus", "Claude 3.5 Sonnet", "Midjourney", "Canva Pro", "اليمن", "السعودية", "الذكاء الاصطناعي", "كودورا"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-[#080c14] text-slate-100 flex flex-col min-h-screen">
        {/* Background glow ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px]" />
        </div>

        {/* Global Storefront Header */}
        <Header />

        {/* Main Route Content */}
        <main className="relative z-10 flex-1">
          {children}
        </main>

        {/* Global Checkout Modal */}
        <CheckoutModal />

        {/* Minimal Footer */}
        <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p>© {new Date().getFullYear()} كودورا للذكاء الاصطناعي (Codora AI Store). جميع الحقوق محفوظة.</p>
            <p className="mt-1 text-slate-600">
              دعم فوري وتفعيل آمن عبر الكريمي، ون كاش، جيب، وبن يعلا والعملات الرقمية USDT.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CurrencySelector } from '@/components/checkout/currency-selector';
import { 
  Zap, 
  MessageCircle, 
  PhoneCall, 
  ExternalLink, 
  ShieldCheck, 
  Headphones, 
  Sparkles,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useStoreSettings } from '@/store/use-store-settings';

export const Header: React.FC = () => {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const { whatsappNumber, telegramUsername } = useStoreSettings();

  const cleanWhatsapp = (whatsappNumber || '967778401415').replace(/[^0-9]/g, '');

  return (
    <>
      {/* 1. Top Global Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-500/20 py-1.5 px-3 text-center text-[11px] sm:text-xs text-slate-300 font-medium overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            ⚡ تفعيل فوري متاح الآن
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300">
            ضمان استبدال ذهبي 100% لكافة الحسابات
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="hidden md:inline-flex items-center gap-1 text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
            <Tag className="h-3 w-3" />
            كود الخصم: AI2026
          </span>
        </div>
      </div>

      {/* 2. Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl transition-all shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Logo & Store Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0 select-none">
            <div className="relative">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-indigo-600/30 border border-indigo-500/40 flex items-center justify-center group-hover:border-indigo-400/80 transition-all duration-300 shadow-lg shadow-indigo-500/10 group-hover:scale-105">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
            </div>

            <div>
              <div className="font-black text-sm sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                <span>كودورا</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold text-xs sm:text-base font-mono">
                  CODORA AI
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  مباشر
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden xs:block">
                المنصة المعتمدة للاشتراكات الرقمية والذكاء الاصطناعي
              </div>
            </div>
          </Link>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Multi-Currency Dropdown */}
            <CurrencySelector compact />

            {/* Direct WhatsApp Support Button */}
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً بكودورا، أريد الاستفسار عن الاشتراكات الرقمية والتفعيل الفوري.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>واتساب الدعم</span>
            </a>

            {/* Support Dialog Trigger */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSupportModalOpen(true)}
              className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-600 transition-all text-xs font-semibold py-2 px-2.5 sm:px-3.5 h-9 sm:h-10 rounded-xl"
            >
              <Headphones className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 sm:ml-1.5" />
              <span className="hidden sm:inline">مركز المساعدة</span>
              <span className="sm:hidden text-[11px]">مساعدة</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Support Dialog Modal */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        maxWidth="md"
        title="خدمة العملاء والدعم الفني 🎧"
        description="فريق الدعم متواجد على مدار الساعة لمساعدتك في التفعيل والاستفسارات"
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              تفعيل رسمي مباشر وضمان استبدال ذهبي
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا كان لديك أي استفسار قبل أو بعد الشراء حول الحسابات، التحويل المالي عبر الكريمي أو جيب أو ون كاش أو بايننس USDT، يسعدنا خدمتك مباشرة:
            </p>
          </div>

          <div className="space-y-2.5">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً كودورا، أريد الاستفسار عن الاشتراكات وطرق الدفع والتفعيل.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 transition-all text-xs font-bold group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <div>واتساب الدعم السريع</div>
                  <div className="text-[10px] text-emerald-400/80 font-mono font-normal dir-ltr text-right">{whatsappNumber}</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </a>

            <a
              href={`https://t.me/${telegramUsername || 'ai_store_support'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-200 transition-all text-xs font-bold group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <div>تيليجرام الدعم الفني</div>
                  <div className="text-[10px] text-sky-400/80 font-mono font-normal">@{telegramUsername || 'ai_store_support'}</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          <div className="pt-2">
            <Button variant="secondary" onClick={() => setSupportModalOpen(false)} className="w-full text-xs py-3 font-semibold rounded-xl">
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};


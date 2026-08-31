'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CurrencySelector } from '@/components/checkout/currency-selector';
import { Bot, MessageCircle, PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useStoreSettings } from '@/store/use-store-settings';

export const Header: React.FC = () => {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const { whatsappNumber, telegramUsername } = useStoreSettings();

  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-indigo-500/10 bg-slate-950/80 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Store Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
              <div className="relative h-11 w-11 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
            </div>

            <div>
              <div className="font-black text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
                <span>كودورا</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-extrabold">
                  AI STORE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                متجر اشتراكات وأدوات الذكاء الاصطناعي
              </div>
            </div>
          </Link>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Multi-Currency Dropdown */}
            <CurrencySelector />

            {/* Contact Support Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSupportModalOpen(true)}
              className="border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-950/40 text-indigo-200 hover:text-white transition-all shadow-sm text-xs font-semibold py-2 px-3 sm:px-4"
            >
              <MessageCircle className="h-4 w-4 text-indigo-400 ml-1.5" />
              <span className="hidden sm:inline">تواصل مع الدعم الفني</span>
              <span className="sm:hidden">الدعم</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Support Dialog */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        maxWidth="md"
        title="خدمة العملاء والدعم الفني 🎧"
        description="فريقنا متواجد على مدار 24 ساعة للإجابة على استفساراتك وتفعيل الطلبات"
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              ضمان تفعيل فوري ومتابعة مباشرة
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              يمكنك التواصل مباشرة مع فريق الدعم عبر القنوات التالية لأي استفسار حول طرق الدفع أو الحسابات:
            </p>
          </div>

          <div className="space-y-2.5">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D9%85%D8%AA%D8%AC%D8%B1%20%D9%83%D9%88%D8%AF%D9%88%D8%B1%D8%A7%20AI`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 transition-all text-xs font-semibold group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span>واتساب الدعم السريع ({whatsappNumber})</span>
              </div>
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </a>

            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-200 transition-all text-xs font-semibold group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <span>تيليجرام الدعم الفني (@{telegramUsername})</span>
              </div>
              <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          <div className="pt-2">
            <Button variant="secondary" onClick={() => setSupportModalOpen(false)} className="w-full text-xs">
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

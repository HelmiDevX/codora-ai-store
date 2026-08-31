'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Save, Coins, AlertCircle, Loader2 } from 'lucide-react';
import { useCurrencyStore } from '@/store/use-currency-store';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/audio';

export const ExchangeRatesPanel: React.FC = () => {
  const { rates, updateRates, lastUpdated } = useCurrencyStore();

  const [adenRate, setAdenRate] = useState<number>(rates.YER_ADEN || 1650);
  const [sanaaRate, setSanaaRate] = useState<number>(rates.YER_SANAA || 535);
  const [sarRate, setSarRate] = useState<number>(rates.SAR || 3.75);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const res = await updateRates({
      YER_ADEN: Number(adenRate),
      YER_SANAA: Number(sanaaRate),
      SAR: Number(sarRate),
    });

    setIsSaving(false);

    if (!res.success) {
      setErrorMessage(res.error || 'فشل في حفظ أسعار الصرف في السحابة');
      return;
    }

    setSavedSuccess(true);
    soundManager.playNotificationPing();

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleResetDefaults = () => {
    setAdenRate(1650);
    setSanaaRate(535);
    setSarRate(3.75);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-glass space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-indigo-400" />
            إدارة وتحديث أسعار الصرف العالمية (Exchange Rates Manager)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            الأسعار المسجلة هنا تُحفظ مباشرة في Supabase وتُحدّث تلقائياً كافة أسعار المنتجات والفواتير فوراً.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          آخر تحديث: {new Date(lastUpdated).toLocaleTimeString('ar-YE')}
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>تم حفظ وبث أسعار الصرف الجديدة في Supabase بنجاح! تم تحديث المتجر بالكامل فوراً.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold animate-shake">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSaveRates} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Rate 1: YER Aden (New) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                🇾🇪 ريال يمني (عدن والمحافظات الجنوبية - جديد)
              </label>
              <span className="text-[10px] text-indigo-400 font-mono">1 USD =</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                required
                value={adenRate}
                onChange={(e) => setAdenRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">
                ر.ي (قعيطي)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">القيمة الافتراضية المقترحة: 1,650 ر.ي</p>
          </div>

          {/* Rate 2: YER Sana'a (Old) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                🇾🇪 ريال يمني (صنعاء والمحافظات الشمالية - قديم)
              </label>
              <span className="text-[10px] text-indigo-400 font-mono">1 USD =</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                required
                value={sanaaRate}
                onChange={(e) => setSanaaRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">
                ر.ي (قديم)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">القيمة الافتراضية المقترحة: 535 ر.ي</p>
          </div>

          {/* Rate 3: SAR */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                🇸🇦 ريال سعودي (Saudi Riyal)
              </label>
              <span className="text-[10px] text-indigo-400 font-mono">1 USD =</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={sarRate}
                onChange={(e) => setSarRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">
                ر.س
              </span>
            </div>
            <p className="text-[11px] text-slate-500">القيمة الافتراضية الرسمية: 3.75 ر.س</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5 ml-1.5" />
            استعادة القيم الافتراضية
          </Button>

          <Button type="submit" variant="primary" disabled={isSaving} className="text-xs font-bold px-6 py-2.5 gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-1" />
                جارٍ الحفظ في السحابة...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ وتحديث الأسعار (Save & Broadcast)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

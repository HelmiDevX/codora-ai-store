'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  MessageCircle, 
  Send, 
  Instagram, 
  Building2, 
  Wallet, 
  Landmark, 
  CircleDollarSign, 
  KeyRound, 
  CheckCircle2, 
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useStoreSettings } from '@/store/use-store-settings';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/audio';

export const StoreSettingsPanel: React.FC = () => {
  const {
    whatsappNumber,
    telegramUsername,
    instagramUsername,
    paymentAccounts,
    adminPin,
    updateSettings,
    updatePaymentAccounts,
    resetToDefaults,
  } = useStoreSettings();

  // Form local state
  const [wa, setWa] = useState(whatsappNumber);
  const [tg, setTg] = useState(telegramUsername);
  const [ig, setIg] = useState(instagramUsername);
  const [pin, setPin] = useState(adminPin);

  // Accounts
  const [kuraimiAcc, setKuraimiAcc] = useState(paymentAccounts.kuraimi.accountNumber);
  const [kuraimiName, setKuraimiName] = useState(paymentAccounts.kuraimi.beneficiaryName);

  const [jeebPhone, setJeebPhone] = useState(paymentAccounts.jeeb.phoneNumber);
  const [jeebName, setJeebName] = useState(paymentAccounts.jeeb.beneficiaryName);

  const [qutaibiAcc, setQutaibiAcc] = useState(paymentAccounts.qutaibi.accountNumber);
  const [qutaibiName, setQutaibiName] = useState(paymentAccounts.qutaibi.beneficiaryName);

  const [usdtAddr, setUsdtAddr] = useState(paymentAccounts.binance_usdt.walletAddress);
  const [usdtNet, setUsdtNet] = useState(paymentAccounts.binance_usdt.network);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const settingsRes = await updateSettings({
      whatsappNumber: wa.trim(),
      telegramUsername: tg.trim(),
      instagramUsername: ig.trim(),
      adminPin: pin.trim(),
    });

    const accountsRes = await updatePaymentAccounts({
      kuraimi: { accountNumber: kuraimiAcc.trim(), beneficiaryName: kuraimiName.trim() },
      jeeb: { phoneNumber: jeebPhone.trim(), beneficiaryName: jeebName.trim() },
      qutaibi: { accountNumber: qutaibiAcc.trim(), beneficiaryName: qutaibiName.trim() },
      binance_usdt: { walletAddress: usdtAddr.trim(), network: usdtNet.trim() },
    });

    setIsSaving(false);

    if (!settingsRes.success || !accountsRes.success) {
      setErrorMessage(settingsRes.error || accountsRes.error || 'فشل في حفظ الإعدادات في السحابة');
      return;
    }

    setSavedSuccess(true);
    soundManager.playNotificationPing();
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleReset = () => {
    if (confirm('هل تريد استعادة كافة الإعدادات الافتراضية؟')) {
      resetToDefaults();
      setWa('967770000000');
      setTg('ai_store_support');
      setIg('aistore_ye');
      setPin('2026');
      setKuraimiAcc('3001234567');
      setKuraimiName('متجر الذكاء الاصطناعي');
      setJeebPhone('777123456');
      setJeebName('متجر كودورا AI');
      setQutaibiAcc('12345678');
      setQutaibiName('مؤسسة كودورا للبرمجيات');
      setUsdtAddr('TXYZ1234567890USDTNetwork');
      setUsdtNet('Tron (TRC-20)');
      soundManager.playNotificationPing();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            إعدادات المتجر وحسابات التحويل (Store & Payment Configuration)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            تعديل أرقام الدعم الفني، روابط التواصل الاجتماعي، وبيانات الحسابات البنكية ومحافظ USDT.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs border-slate-700 bg-slate-950/60 text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5 ml-1" />
          استعادة الإعدادات الافتراضية
        </Button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in zoom-in-95">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>تم حفظ وتعميم الإعدادات في Supabase بنجاح! تم تحديث المتجر ونوافذ الدفع فوراً.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold animate-shake">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Social & Messaging Channels */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            قنوات الدعم الفني والرسائل المباشرة
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                رقم واتساب الدعم الفني (مع الرمز الدولي) *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="967770000000"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/50 text-left"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                تُرسل إليه رسائل الفواتير والطلبات تلقائياً
              </span>
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-sky-400" />
                معرّف تليجرام الدعم (Telegram Username) *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="ai_store_support"
                value={tg}
                onChange={(e) => setTg(e.target.value.replace('@', ''))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:ring-2 focus:ring-sky-500/50 text-left"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                بدون علامة @ (مثال: ai_store_support)
              </span>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5 text-pink-400" />
                يوزر إنستغرام (Instagram Profile) *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="aistore_ye"
                value={ig}
                onChange={(e) => setIg(e.target.value.replace('@', ''))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:ring-2 focus:ring-pink-500/50 text-left"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                رابط صفحة المتجر على إنستغرام
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Payment Accounts Manager */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building2 className="h-4 w-4 text-indigo-400" />
            بيانات الحسابات البنكية والمحافظ (تظهر للعملاء في نافذة الدفع)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kuraimi */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                بنك الكريمي (Kuraimi Bank)
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رقم الحساب المميز</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={kuraimiAcc}
                  onChange={(e) => setKuraimiAcc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs text-left"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">اسم المستفيد</label>
                <input
                  type="text"
                  required
                  value={kuraimiName}
                  onChange={(e) => setKuraimiName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* Jeeb */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                محفظة جيب (Jeeb Wallet)
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رقم المحفظة / الهاتف</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={jeebPhone}
                  onChange={(e) => setJeebPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs text-left"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">اسم المستفيد</label>
                <input
                  type="text"
                  required
                  value={jeebName}
                  onChange={(e) => setJeebName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* Al-Qutaibi */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                <Landmark className="h-4 w-4" />
                بنك القطيبي (Al-Qutaibi)
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رقم الحساب</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={qutaibiAcc}
                  onChange={(e) => setQutaibiAcc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs text-left"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">اسم المستفيد</label>
                <input
                  type="text"
                  required
                  value={qutaibiName}
                  onChange={(e) => setQutaibiName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* Binance USDT */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4" />
                العملات الرقمية (Binance USDT - TRC20)
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">عنوان المحفظة (Address)</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={usdtAddr}
                  onChange={(e) => setUsdtAddr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs text-left"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الشبكة (Network)</label>
                <input
                  type="text"
                  required
                  value={usdtNet}
                  onChange={(e) => setUsdtNet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Admin Security PIN */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
            <KeyRound className="h-4 w-4 text-amber-400" />
            رمز حماية لوحة التحكم (Admin PIN Protection)
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز الدخول (PIN Code) *
            </label>
            <input
              type="text"
              required
              dir="ltr"
              maxLength={8}
              placeholder="2026"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-sm tracking-widest text-center focus:ring-2 focus:ring-amber-500/50"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              الرمز الافتراضي: 2026
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end pt-2">
          <Button type="submit" variant="primary" disabled={isSaving} className="text-xs font-bold px-8 py-3 gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-1" />
                جارٍ الحفظ في السحابة...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ وتعميم الإعدادات (Save Configuration)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

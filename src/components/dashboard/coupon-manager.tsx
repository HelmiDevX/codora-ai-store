'use client';

import React, { useState } from 'react';
import { Coupon, DiscountType } from '@/types/coupon';
import { useCouponsStore } from '@/store/use-coupons-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  Tag, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { soundManager } from '@/lib/audio';

export const CouponManager: React.FC = () => {
  const { 
    coupons, 
    addCoupon, 
    toggleCouponActive, 
    deleteCoupon, 
    resetCoupons 
  } = useCouponsStore();

  const couponList = Object.values(coupons);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Coupon Form State
  const [newCode, setNewCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<DiscountType>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(10);
  const [newAffiliateName, setNewAffiliateName] = useState('');

  const handleToggle = async (code: string) => {
    const res = await toggleCouponActive(code);
    if (!res.success) {
      alert(`خطأ: ${res.error}`);
    } else {
      soundManager.playNotificationPing();
    }
  };

  const handleDelete = async (code: string) => {
    if (confirm(`هل أنت متأكد من حذف كود الخصم (${code}) نهائياً من السحابة؟`)) {
      const res = await deleteCoupon(code);
      if (!res.success) {
        alert(`خطأ في الحذف: ${res.error}`);
      } else {
        soundManager.playNotificationPing();
      }
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const created: Coupon = {
      code: newCode.trim().toUpperCase(),
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue),
      affiliateName: newAffiliateName || 'حملة داخلية',
      usedCount: 0,
      totalRevenueUSD: 0,
      isActive: true,
    };

    const res = await addCoupon(created);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'فشل في حفظ الكوبون في السحابة');
      return;
    }

    setIsAddModalOpen(false);
    soundManager.playNotificationPing();

    // Reset Form
    setNewCode('');
    setNewDiscountValue(10);
    setNewAffiliateName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-400" />
            إدارة الكوبونات والمسوقين (Coupons & Affiliates)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء رموز الخصم، وتتبع عدد مرات الاستخدام، وعائدات كل مؤثر ومسوق بالعمولة في Supabase مباشرة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('هل تريد استعادة الكوبونات الافتراضية؟')) {
                resetCoupons();
                soundManager.playNotificationPing();
              }
            }}
            className="text-xs border-slate-700 bg-slate-950/60 text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5 ml-1" />
            استعادة الافتراضي
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setErrorMessage(null);
              setIsAddModalOpen(true);
            }}
            className="text-xs font-bold px-4 py-2 gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            إنشاء كود خصم جديد (New Coupon)
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="py-3.5 px-4">كود الخصم</th>
                <th className="py-3.5 px-4">نوع وقيمة الخصم</th>
                <th className="py-3.5 px-4">المسوق / الشريك (Affiliate)</th>
                <th className="py-3.5 px-4">مرات الاستخدام (Current Uses)</th>
                <th className="py-3.5 px-4">إجمالي المبيعات المحققة</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {couponList.map((coupon) => (
                <tr key={coupon.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-indigo-300 text-sm">
                    <span className="bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={coupon.discountType === 'percentage' ? 'purple' : 'info'} size="sm">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% خصم`
                        : `$${coupon.discountValue} خصم ثابت`}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-200">
                    {coupon.affiliateName || 'بدون مسوق'}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-100">
                    {coupon.usedCount || 0} طلب
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                    ${(coupon.totalRevenueUSD || 0).toFixed(2)} USD
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(coupon.code)}
                      className="flex items-center gap-1.5 text-xs font-semibold focus:outline-none transition-colors"
                    >
                      {coupon.isActive ? (
                        <>
                          <ToggleRight className="h-6 w-6 text-emerald-400" />
                          <span className="text-emerald-300">نشط</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-6 w-6 text-slate-500" />
                          <span className="text-slate-500">معطل</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coupon.code)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 h-8 w-8"
                      title="حذف الكوبون"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        title="إنشاء كود خصم للمسوقين 🎟️"
        description="حدد كود الخصم، النسبة المئوية، واسم الشريك ليتم حفظه في Supabase"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold animate-shake">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كود الخصم (Coupon Code) *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: MEGA20"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white uppercase font-mono text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">نوع الخصم *</label>
              <select
                value={newDiscountType}
                onChange={(e) => setNewDiscountType(e.target.value as DiscountType)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="percentage">نسبة مئوية (Percentage %)</option>
                <option value="fixed_usd">مبلغ ثابت بالدولار (Fixed $)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                قيمة الخصم ({newDiscountType === 'percentage' ? '%' : '$'}) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={newDiscountValue}
                onChange={(e) => setNewDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم المسوق / المؤثر / القناة الترويجية (Affiliate) *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: يوتيوبر تقني / قناة تيليجرام"
              value={newAffiliateName}
              onChange={(e) => setNewAffiliateName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-1" />
                  جارٍ الحفظ في السحابة...
                </>
              ) : (
                'تفعيل الكود'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

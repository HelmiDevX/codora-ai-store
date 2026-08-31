'use client';

import React, { useState } from 'react';
import { Product, ProductCategory } from '@/types/product';
import { useProductsStore } from '@/store/use-products-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  Plus, 
  Package, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { useCurrencyStore } from '@/store/use-currency-store';
import { soundManager } from '@/lib/audio';

export const ProductManager: React.FC = () => {
  const { 
    products, 
    addProduct, 
    toggleProductAvailability, 
    deleteProduct, 
    resetProducts 
  } = useProductsStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { activeCurrency, formatPrice } = useCurrencyStore();

  // Form State for Add Product Modal
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('ai-subscription');
  const [newPriceUSD, setNewPriceUSD] = useState<number>(20);
  const [newDuration, setNewDuration] = useState('شهر كامل (30 يوم)');
  const [newDeliveryType, setNewDeliveryType] = useState<'Shared Account' | 'Private Key' | 'Invite' | 'Direct LMS'>('Shared Account');
  const [newDescription, setNewDescription] = useState('');
  const [newBadge, setNewBadge] = useState('جديد');

  const handleToggle = (productId: string) => {
    toggleProductAvailability(productId);
    soundManager.playNotificationPing();
  };

  const handleDelete = (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج من المتجر؟')) {
      deleteProduct(productId);
      soundManager.playNotificationPing();
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      slug: newTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newTitle,
      titleAr: newTitle,
      shortDescription: newDescription || 'وصف للمنتج الجديد',
      shortDescriptionAr: newDescription || 'وصف للمنتج الجديد باللغة العربية',
      fullDescription: newDescription,
      fullDescriptionAr: newDescription,
      category: newCategory,
      tier: 'monthly',
      priceUSD: Number(newPriceUSD),
      badgeTextAr: newBadge,
      isAvailable: true,
      instantDelivery: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      features: [
        { id: 'f1', title: 'Full Warranty', titleAr: 'ضمان كامل ومستمر طوال المدة', included: true },
        { id: 'f2', title: 'Instant Activation', titleAr: 'تسليم وتفعيل فوري على مدار 24 ساعة', included: true },
      ],
      metadata: {
        durationAr: newDuration,
        accessType: newDeliveryType,
      },
    };

    addProduct(newProd);
    setIsAddModalOpen(false);
    soundManager.playNotificationPing();

    // Reset Form
    setNewTitle('');
    setNewPriceUSD(20);
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Product CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-400" />
            إدارة المنتجات والاشتراكات (Catalogue Manager)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            المنتجات المضافة هنا تظهر مباشرة لجميع زوار المتجر في الصفحة الرئيسية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('هل تريد استعادة قائمة المنتجات الافتراضية؟')) {
                resetProducts();
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
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold px-4 py-2 gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            إضافة منتج جديد (Add Product)
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="py-3.5 px-4">اسم المنتج</th>
                <th className="py-3.5 px-4">القسم</th>
                <th className="py-3.5 px-4">المدة والترخيص</th>
                <th className="py-3.5 px-4">السعر الأساسي (USD)</th>
                <th className="py-3.5 px-4">السعر بالعملة الحالية ({activeCurrency})</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div>{product.titleAr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" size="sm">
                      {product.category === 'ai-subscription' ? 'اشتراك AI' : 'كورس تعليمي'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {product.metadata?.durationAr || 'شهر'} ({product.metadata?.accessType || 'حساب'})
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-200">
                    ${product.priceUSD.toFixed(2)} USD
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                    {formatPrice(product.priceUSD, 'ar')}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(product.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold focus:outline-none transition-colors"
                    >
                      {product.isAvailable ? (
                        <>
                          <ToggleRight className="h-6 w-6 text-emerald-400" />
                          <span className="text-emerald-300">متاح للطلب</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-6 w-6 text-slate-500" />
                          <span className="text-slate-500">متوقف مؤقتاً</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 h-8 w-8"
                      title="حذف المنتج"
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

      {/* Add New Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title="إضافة منتج أو اشتراك جديد 📦"
        description="أدخل تفاصيل المنتج ليظهر في المتجر مباشرة"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              عنوان المنتج (بالعربية) *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: اشتراك Cursor Pro (شهر كامل)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">القسم *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="ai-subscription">اشتراكات الذكاء الاصطناعي</option>
                <option value="course">كورسات ومواد تعليمية</option>
                <option value="credits">رصيد ونقاط API</option>
                <option value="bundle">باقة مجمعة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                السعر بالدولار ($ USD) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={newPriceUSD}
                onChange={(e) => setNewPriceUSD(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                مدة الاشتراك / الترخيص *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: شهر كامل (30 يوم)"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نوع التسليم والتفعيل *
              </label>
              <select
                value={newDeliveryType}
                onChange={(e) =>
                  setNewDeliveryType(
                    e.target.value as 'Shared Account' | 'Private Key' | 'Invite' | 'Direct LMS'
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Shared Account">حساب جاهز (بيانات تسجيل)</option>
                <option value="Invite">دعوة على البريد الشخصي (Invite)</option>
                <option value="Private Key">مفتاح خاص (API Key / License)</option>
                <option value="Direct LMS">روابط Drive ومحتوى تعليمي</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              الوصف والمميزات *
            </label>
            <textarea
              rows={3}
              placeholder="اكتب نبذة عن مميزات الاشتراك والتفعيل..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              إضافة المنتج للمتجر
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

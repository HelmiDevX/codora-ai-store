'use client';

import React, { useState } from 'react';
import { OrderPayload, OrderStatus, OrderChannel } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  CheckCircle2, 
  Search, 
  XCircle,
  Clock,
  MessageCircle,
  Send,
  Instagram,
  Eye,
  Download,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { useOrdersStore } from '@/store/use-orders-store';
import { soundManager } from '@/lib/audio';

export const OrderTable: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrdersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<OrderChannel | 'all'>('all');

  // Lightbox Modal State
  const [selectedProofOrder, setSelectedProofOrder] = useState<OrderPayload | null>(null);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    soundManager.playNotificationPing();
  };

  const handleDelete = (orderId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
      deleteOrder(orderId);
      soundManager.playNotificationPing();
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item.product.titleAr.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Export to CSV Function with UTF-8 BOM for Excel Arabic Support
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('لا توجد طلبات لتصديرها.');
      return;
    }

    const headers = [
      'رقم الطلب',
      'تاريخ الطلب',
      'اسم العميل',
      'رقم الواتساب',
      'المنتج',
      'المدة',
      'السعر الأصلي (USD)',
      'الخصم (USD)',
      'الإجمالي النهائي (USD)',
      'المبلغ بالعملة المحلية',
      'العملة',
      'طريقة الدفع',
      'كود الخصم',
      'القناة',
      'حالة الطلب',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString('ar-YE')}"`,
      `"${o.customer.fullName}"`,
      `"${o.customer.whatsappNumber || ''}"`,
      `"${o.item.product.titleAr}"`,
      `"${o.item.product.metadata?.durationAr || o.item.product.tier}"`,
      o.originalTotalUSD,
      o.discountUSD || 0,
      o.finalTotalUSD,
      o.finalTotalConverted,
      `"${o.currency}"`,
      `"${o.paymentMethod}"`,
      `"${o.couponCode || 'لا يوجد'}"`,
      `"${o.channel}"`,
      `"${o.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Codora_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    soundManager.playNotificationPing();
  };

  const getChannelBadge = (channel: OrderChannel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <Badge variant="success" size="sm" className="bg-emerald-950/60 text-emerald-300 border-emerald-500/30 gap-1">
            <MessageCircle className="h-3 w-3" />
            واتساب 🟢
          </Badge>
        );
      case 'telegram':
        return (
          <Badge variant="info" size="sm" className="bg-sky-950/60 text-sky-300 border-sky-500/30 gap-1">
            <Send className="h-3 w-3" />
            تيليجرام 🔵
          </Badge>
        );
      case 'instagram':
        return (
          <Badge variant="purple" size="sm" className="bg-pink-950/60 text-pink-300 border-pink-500/30 gap-1">
            <Instagram className="h-3 w-3" />
            إنستغرام 🟣
          </Badge>
        );
      default:
        return <Badge variant="outline" size="sm">{channel}</Badge>;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            تم التسليم
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="h-3 w-3" />
            قيد التواصل
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <XCircle className="h-3 w-3" />
            ملغي
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-hidden shadow-2xl space-y-4">
        {/* Table Toolbar & Filters */}
        <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>سجل الطلبات والتحويلات المباشرة (Live Orders Feed)</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredOrders.length} طلب
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة قنوات البيع، مراجعة سندات التحويل البنكي، وتحديث حالة التفعيل الفوري.
            </p>
          </div>

          {/* Filter Bar & Export */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الرقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">كافة الحالات</option>
              <option value="contacted">⏳ قيد التواصل</option>
              <option value="completed">✅ تم التسليم</option>
              <option value="canceled">❌ ملغي</option>
            </select>

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as OrderChannel | 'all')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">كافة القنوات</option>
              <option value="whatsapp">واتساب (WhatsApp)</option>
              <option value="telegram">تيليجرام (Telegram)</option>
              <option value="instagram">إنستغرام (Instagram)</option>
            </select>

            {/* Export CSV Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>تصدير CSV</span>
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="py-3.5 px-4">رقم الطلب والتاريخ</th>
                <th className="py-3.5 px-4">العميل</th>
                <th className="py-3.5 px-4">المنتج والمدة</th>
                <th className="py-3.5 px-4">المبلغ المستحق</th>
                <th className="py-3.5 px-4">كود الخصم</th>
                <th className="py-3.5 px-4">وسيلة الدفع وسند التحويل</th>
                <th className="py-3.5 px-4">قناة الطلب</th>
                <th className="py-3.5 px-4">حالة الطلب</th>
                <th className="py-3.5 px-4 text-center">تحديث الحالة</th>
                <th className="py-3.5 px-4 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    لا توجد طلبات تطابق معايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-4 px-4 font-mono">
                      <div className="font-bold text-white text-xs">#{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {formatDate(order.createdAt, 'ar')}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{order.customer.fullName}</div>
                      {order.customer.whatsappNumber && (
                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                          {order.customer.whatsappNumber}
                        </div>
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200">{order.item.product.titleAr}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="purple" size="sm">
                          {order.item.product.metadata?.durationAr || order.item.product.tier}
                        </Badge>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-emerald-400">
                        {formatCurrency(order.finalTotalConverted, order.currency, 'ar')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        (${order.finalTotalUSD.toFixed(2)} USD)
                      </div>
                    </td>

                    {/* Coupon */}
                    <td className="py-4 px-4">
                      {order.couponCode ? (
                        <Badge variant="purple" size="sm" className="font-mono">
                          {order.couponCode}
                        </Badge>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </td>

                    {/* Payment Method & Proof Preview */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-200">{order.paymentMethod}</div>
                      {order.proof?.receiptImageUrl || order.proof?.receiptImageBase64 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofOrder(order)}
                          className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>معاينة السند 📎</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">لا يوجد مرفق</span>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="py-4 px-4">{getChannelBadge(order.channel)}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>

                    {/* Actions Dropdown */}
                    <td className="py-4 px-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="contacted">⏳ قيد التواصل</option>
                        <option value="completed">✅ تم التسليم</option>
                        <option value="canceled">❌ ملغي</option>
                      </select>
                    </td>

                    {/* Delete Action */}
                    <td className="py-4 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 h-8 w-8"
                        title="حذف الطلب"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal for Receipt Proof Inspection */}
      {selectedProofOrder && (
        <Modal
          isOpen={Boolean(selectedProofOrder)}
          onClose={() => setSelectedProofOrder(null)}
          maxWidth="md"
          title={`معاينة سند التحويل (#${selectedProofOrder.orderNumber})`}
          description={`العميل: ${selectedProofOrder.customer.fullName} | المبلغ: ${selectedProofOrder.finalTotalConverted} ${selectedProofOrder.currency}`}
        >
          <div className="space-y-4 py-2">
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  selectedProofOrder.proof?.receiptImageUrl ||
                  selectedProofOrder.proof?.receiptImageBase64
                }
                alt="Receipt Proof"
                className="max-h-[60vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                الملف: {selectedProofOrder.proof?.fileName || 'إشعار الدفع'}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedProofOrder(null)}
                className="text-xs"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentProof } from '@/types/order';

interface ProofUploaderProps {
  proof: PaymentProof | null;
  onProofChange: (proof: PaymentProof | null) => void;
  hasError?: boolean;
}

export const ProofUploader: React.FC<ProofUploaderProps> = ({
  proof,
  onProofChange,
  hasError = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('يرجى اختيار صورة بصيغة صالحة (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onProofChange({
        fileName: file.name,
        receiptImageBase64: base64,
        receiptImageUrl: base64,
        submittedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    onProofChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-indigo-400" />
          <span>إرفاق إشعار التحويل / صورة السند</span>
          <span className="text-red-400 font-bold">*</span>
        </label>
        <span className="text-[11px] text-slate-500">PNG, JPG, WEBP</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!proof ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center ${
            hasError
              ? 'border-red-500/70 bg-red-950/20 ring-1 ring-red-500/40 animate-pulse'
              : isDragging
              ? 'border-indigo-400 bg-indigo-950/40 scale-[0.99]'
              : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/50 hover:bg-slate-950/80'
          }`}
        >
          <div
            className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-2 ${
              hasError
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            }`}
          >
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className={`text-xs sm:text-sm font-medium ${hasError ? 'text-red-300 font-bold' : 'text-slate-200'}`}>
            اضغط لاختيار صورة السند أو اسحب الملف وأفلته هنا
          </p>
          <p className={`text-[11px] mt-1 ${hasError ? 'text-red-400 font-semibold' : 'text-slate-500'}`}>
            {hasError
              ? '⚠️ مطلوب: يجب إرفاق سند التحويل لإتمام الطلب'
              : 'إرفاق سند الدفع إجباري لتأكيد التحويل والبدء بتفعيل الحساب مباشرة'}
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950/80 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proof.receiptImageBase64 || proof.receiptImageUrl}
                alt="Receipt Proof"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{proof.fileName || 'تم إرفاق السند بنجاح'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">جاهز للإرسال مع بيانات الفاتورة</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleChangeImage}
              className="text-[11px] h-8 px-2.5 border-slate-700 hover:border-slate-600 bg-slate-900"
            >
              <RefreshCw className="h-3 w-3 ml-1 text-slate-400" />
              تغيير
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemove}
              className="text-[11px] h-8 px-2.5"
            >
              <Trash2 className="h-3 w-3 ml-1" />
              حذف
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

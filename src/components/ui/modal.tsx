'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Dialog (Mobile-First 95% width with max-h-[90vh]) */}
      <div
        className={cn(
          'relative w-[95%] max-w-lg mx-auto max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-slate-700/70 p-4 sm:p-6 text-slate-100 shadow-2xl backdrop-blur-2xl z-10 animate-in zoom-in-95 duration-200 scrollbar-thin',
          maxWidths[maxWidth]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-800">
            <div className="pr-1 pl-6">
              {title && <h3 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">{title}</h3>}
              {description && (
                <p className="mt-0.5 sm:mt-1 text-xs text-slate-400">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors active:scale-95"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

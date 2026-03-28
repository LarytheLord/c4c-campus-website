/**
 * Toast Component - Branded notifications for C4C Campus
 * Replaces browser alert() with styled, accessible notifications
 */

import React, { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  info: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
  },
};

const icons: Record<ToastType, React.JSX.Element> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function Toast({ toast, onDismiss }: ToastProps) {
  const style = toastStyles[toast.type];

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-sm w-full animate-slide-in`}
    >
      <div className={`${style.iconBg} ${style.icon} p-1.5 rounded-full flex-shrink-0`}>
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-gray-900 text-sm">{toast.title}</p>
        )}
        <p className="text-gray-700 text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: ToastType,
    message: string,
    options?: { title?: string; duration?: number }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: ToastMessage = {
      id,
      type,
      message,
      title: options?.title,
      duration: options?.duration,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return addToast('success', message, options);
  }, [addToast]);

  const error = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return addToast('error', message, options);
  }, [addToast]);

  const warning = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return addToast('warning', message, options);
  }, [addToast]);

  const info = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return addToast('info', message, options);
  }, [addToast]);

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
}

export default Toast;

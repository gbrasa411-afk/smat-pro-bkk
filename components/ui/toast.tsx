'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

// Simple global store
let listeners: Array<() => void> = [];
let toastState: Toast[] = [];

function emitChange() {
  listeners.forEach((l) => l());
}

export function showToast(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2, 9);
  toastState = [...toastState, { id, type, message }];
  emitChange();

  // Auto-dismiss
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    emitChange();
  }, 3000);
}

function useToastStore(): ToastStore {
  const [toasts, setToasts] = useState<Toast[]>(toastState);

  useEffect(() => {
    const listener = () => setToasts([...toastState]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    showToast(type, message);
  }, []);

  const removeToast = useCallback((id: string) => {
    toastState = toastState.filter((t) => t.id !== id);
    emitChange();
  }, []);

  return { toasts, addToast, removeToast };
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: 'bg-green-500/15 border-green-500/30 text-green-300',
  error: 'bg-red-500/15 border-red-500/30 text-red-300',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
};

const iconColorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl
              animate-fade-in-up pointer-events-auto shadow-2xl
              ${styleMap[toast.type]}
            `}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColorMap[toast.type]}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;

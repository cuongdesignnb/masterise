'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // ms
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Theme config per toast type                                        */
/* ------------------------------------------------------------------ */

const TOAST_CONFIG: Record<ToastType, {
  icon: typeof CheckCircle2;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  progressColor: string;
  label: string;
}> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-l-emerald-500',
    bgColor: 'bg-[#0D1F12]',
    iconColor: 'text-emerald-400',
    progressColor: 'bg-emerald-500',
    label: 'Thành công',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-l-red-500',
    bgColor: 'bg-[#1F0D0D]',
    iconColor: 'text-red-400',
    progressColor: 'bg-red-500',
    label: 'Lỗi',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-[#1F1A0D]',
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-500',
    label: 'Cảnh báo',
  },
  info: {
    icon: Info,
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-[#0D131F]',
    iconColor: 'text-blue-400',
    progressColor: 'bg-blue-500',
    label: 'Thông tin',
  },
};

const DEFAULT_DURATION = 4500; // ms

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: log to console when used outside provider (safety net)
    return {
      success: (m) => console.log('[toast:success]', m),
      error: (m) => console.error('[toast:error]', m),
      warning: (m) => console.warn('[toast:warning]', m),
      info: (m) => console.info('[toast:info]', m),
    };
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Single Toast Item                                                  */
/* ------------------------------------------------------------------ */

function ToastItemComponent({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const frameRef = useRef<number | undefined>(undefined);

  // Animate progress bar
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [toast.duration]);

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 320);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 320);
  }, [toast.id, onRemove]);

  return (
    <div
      role="alert"
      className={`
        relative overflow-hidden rounded-xl border-l-4 ${config.borderColor} ${config.bgColor}
        shadow-2xl shadow-black/40 backdrop-blur-sm
        w-[calc(100vw-2rem)] sm:w-[420px]
        transition-all duration-300 ease-out
        ${exiting
          ? 'opacity-0 translate-x-[120%] scale-95'
          : 'opacity-100 translate-x-0 scale-100 animate-[slideInRight_0.35s_ease-out]'
        }
      `}
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4 pr-10">
        <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 break-words leading-relaxed">
            {toast.message}
          </p>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="h-[3px] w-full bg-white/5">
        <div
          className={`h-full ${config.progressColor} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast Container (portal-rendered)                                  */
/* ------------------------------------------------------------------ */

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItemComponent toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = DEFAULT_DURATION) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = React.useMemo<ToastContextValue>(
    () => ({
      success: (msg, dur?) => addToast('success', msg, dur),
      error: (msg, dur?) => addToast('error', msg, dur),
      warning: (msg, dur?) => addToast('warning', msg, dur),
      info: (msg, dur?) => addToast('info', msg, dur),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

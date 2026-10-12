import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, description, duration = 4000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setExiting(true);
        setTimeout(() => onClose(id), 300);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [duration, id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    loading: <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />,
  };

  const bgColors = {
    success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800',
    error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800',
    info: 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800',
    loading: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800',
  };

  const textColors = {
    success: 'text-slate-900 dark:text-white',
    error: 'text-slate-900 dark:text-white',
    info: 'text-slate-900 dark:text-white',
    loading: 'text-slate-900 dark:text-white',
  };

  const descColors = {
    success: 'text-slate-500 dark:text-slate-400',
    error: 'text-slate-500 dark:text-slate-400',
    info: 'text-slate-500 dark:text-slate-400',
    loading: 'text-slate-500 dark:text-slate-400',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md
        min-w-[320px] max-w-sm w-full pointer-events-auto
        transition-all duration-300 ease-out
        ${exiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
        ${bgColors[type]}
      `}
    >
      <div className="p-3.5 flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${textColors[type]}`}>{message}</p>
          {description && <p className={`text-xs mt-0.5 ${descColors[type]}`}>{description}</p>}
        </div>
        {type !== 'loading' && (
          <button
            onClick={() => {
              setExiting(true);
              setTimeout(() => onClose(id), 300);
            }}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {type !== 'loading' && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-slate-300 dark:bg-slate-600 transition-all duration-75 linear"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
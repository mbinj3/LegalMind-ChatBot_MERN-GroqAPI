import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_ICONS = {
  success: <FaCheckCircle className="text-emerald-400 text-sm flex-shrink-0" />,
  error: <FaExclamationCircle className="text-rose-400 text-sm flex-shrink-0" />,
  warning: <FaExclamationTriangle className="text-amber-400 text-sm flex-shrink-0" />,
  info: <FaInfoCircle className="text-indigo-400 text-sm flex-shrink-0" />
};

const BORDER_ACCENTS = {
  success: 'border-l-emerald-500',
  error: 'border-l-rose-500',
  warning: 'border-l-amber-500',
  info: 'border-l-indigo-500'
};

function ToastItem({ toast, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(toast.duration || 4000);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingTimeRef.current);
  }, [onDismiss, toast.id]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseEnter = () => {
    clearTimer();
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (remainingTimeRef.current > 0) {
      startTimer();
    } else {
      onDismiss(toast.id);
    }
  };

  React.useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [startTimer, clearTimer]);

  const isAlert = toast.variant === 'error';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto flex items-start gap-3 w-80 sm:w-96 p-3.5 rounded-xl bg-slate-900 border border-slate-800 border-l-4 ${
        BORDER_ACCENTS[toast.variant] || BORDER_ACCENTS.info
      } shadow-2xl backdrop-blur-md transition-all duration-200 animate-toastSlide`}
    >
      <div className="mt-0.5">{TOAST_ICONS[toast.variant] || TOAST_ICONS.info}</div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-bold text-slate-100 mb-0.5">{toast.title}</h4>
        )}
        <p className="text-xs text-slate-300 leading-relaxed break-words">{toast.message}</p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <FaTimes className="text-xs" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, variant = 'info', options = {}) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast = {
      id,
      message,
      variant,
      title: options.title,
      duration: options.duration || 4000
    };

    setToasts((prev) => {
      // Stack up to 3 toasts max (drop oldest)
      const next = [...prev, newToast];
      return next.slice(-3);
    });

    return id;
  }, []);

  const toast = {
    success: (msg, opts) => addToast(msg, 'success', opts),
    error: (msg, opts) => addToast(msg, 'error', opts),
    warning: (msg, opts) => addToast(msg, 'warning', opts),
    info: (msg, opts) => addToast(msg, 'info', opts),
    dismiss
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container: Top-Right on Desktop, Top-Center on Mobile */}
      <div
        aria-label="Notifications"
        className="fixed top-4 right-4 left-4 sm:left-auto z-50 pointer-events-none flex flex-col items-center sm:items-end gap-2.5 max-w-full"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}


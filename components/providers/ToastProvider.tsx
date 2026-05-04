"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms — default 4 000
}

interface ToastCtx {
  toast: (opts: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastCtx | null>(null);

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<
  ToastType,
  { border: string; glow: string; icon: ReactNode }
> = {
  success: {
    border: "rgba(74,222,128,0.35)",
    glow: "rgba(74,222,128,0.08)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
        <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="1.5" />
        <path
          d="M8 12l3 3 5-5"
          stroke="#4ade80"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  error: {
    border: "rgba(248,113,113,0.35)",
    glow: "rgba(248,113,113,0.06)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
        <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
        <path
          d="M12 8v4m0 4h.01"
          stroke="#f87171"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  warning: {
    border: "rgba(251,191,36,0.35)",
    glow: "rgba(251,191,36,0.06)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
        <path
          d="M12 2L2 22h20L12 2z"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 10v4m0 4h.01"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  info: {
    border: "rgba(124,58,237,0.4)",
    glow: "rgba(124,58,237,0.08)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
        <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="1.5" />
        <path
          d="M12 8h.01M12 12v4"
          stroke="#a78bfa"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

const TYPE_TITLE_COLOR: Record<ToastType, string> = {
  success: "#4ade80",
  error: "#f87171",
  warning: "#fbbf24",
  info: "#c4b5fd",
};

// ---------------------------------------------------------------------------
// Single toast item
// ---------------------------------------------------------------------------

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const style = TYPE_STYLES[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      role="alert"
      aria-live="assertive"
      className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3.5 shadow-2xl"
      style={{
        minWidth: "260px",
        maxWidth: "340px",
        background: "rgba(10,14,38,0.97)",
        border: `1px solid ${style.border}`,
        backdropFilter: "blur(16px)",
        boxShadow: `0 8px 32px ${style.glow}, 0 2px 8px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Icon */}
      <div className="mt-0.5">{style.icon}</div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: TYPE_TITLE_COLOR[t.type] }}
        >
          {t.title}
        </p>
        {t.message && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
            {t.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(t.id)}
        className="mt-0.5 text-slate-600 hover:text-slate-300 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

let _counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<Toast, "id">): string => {
      const id = `toast-${++_counter}`;
      const duration = opts.duration ?? 4000;

      setToasts((prev) => [...prev, { ...opts, id }]);

      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Portal — fixed bottom-right, stacks upward */}
      <div
        aria-label="Notifications"
        className="fixed bottom-6 right-4 z-9999 flex flex-col-reverse gap-2 pointer-events-none"
        style={{ maxWidth: "100vw" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

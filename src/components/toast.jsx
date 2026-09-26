import { useState, useCallback, useRef } from "react";
import { ToastContext } from "./toastContext";

// ─── Context ────────────────────────────────────────────────────────────────

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children, maxToasts = 4, duration = 4000 }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback(
    ({ type = "info", title, message }) => {
      const id = ++counterRef.current;

      setToasts((prev) => {
        const next = [{ id, type, title, message, dismissing: false }, ...prev];
        return next.slice(0, maxToasts);
      });

      const timer = setTimeout(() => dismiss(id), duration);
      // Store timer ref on the toast object for manual dismissal cleanup
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, _timer: timer } : t))
      );

      return id;
    },
    [dismiss, duration, maxToasts]
  );

  // Convenience methods
  const success = useCallback((title, message) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title, message) => toast({ type: "error",   title, message }), [toast]);
  const warning = useCallback((title, message) => toast({ type: "warning", title, message }), [toast]);
  const info    = useCallback((title, message) => toast({ type: "info",    title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} duration={duration} />
    </ToastContext.Provider>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss, duration }) {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2.5"
      style={{ width: 340 }}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} duration={duration} />
      ))}
    </div>
  );
}

// ─── Single Toast ────────────────────────────────────────────────────────────

const VARIANTS = {
  success: {
    bar:      "#4ade80",
    iconBg:   "rgba(74,222,128,0.10)",
    iconColor:"#4ade80",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  error: {
    bar:      "#f87171",
    iconBg:   "rgba(248,113,113,0.10)",
    iconColor:"#f87171",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
      </svg>
    ),
  },
  warning: {
    bar:      "#C9A85C",
    iconBg:   "rgba(201,168,92,0.12)",
    iconColor:"#C9A85C",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m10.29 3.86-8.62 14.93A1 1 0 0 0 2.54 20h18.92a1 1 0 0 0 .87-1.5L13.71 3.86a1 1 0 0 0-1.73-.01z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    bar:      "#60a5fa",
    iconBg:   "rgba(96,165,250,0.10)",
    iconColor:"#60a5fa",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

function Toast({ toast, onDismiss, duration }) {
  const v = VARIANTS[toast.type] ?? VARIANTS.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        backgroundColor: "#1a1a1a",
        borderColor:      "#2a2a2a",
        fontFamily:       "Inter, system-ui, sans-serif",
        animation: toast.dismissing
          ? "llc-toast-out 0.22s ease-in forwards"
          : "llc-toast-in 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}
      className="relative flex items-start gap-3 rounded-[10px] border p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Left accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[10px]"
        style={{ backgroundColor: v.bar }}
        aria-hidden="true"
      />

      {/* Icon */}
      <span
        className="mt-0.5 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: v.iconBg, color: v.iconColor }}
        aria-hidden="true"
      >
        {v.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-[13px] font-semibold leading-snug text-white mb-0.5">
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-[12px] leading-[1.45]" style={{ color: "#888888" }}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 flex-shrink-0 text-base leading-none transition-colors"
        style={{ background: "none", border: "none", color: "#444444", cursor: "pointer", padding: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A85C")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#444444")}
        aria-label="Dismiss notification"
      >
        ×
      </button>

      {/* Progress bar */}
      <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: "#2a2a2a" }} aria-hidden="true">
        <span
          className="block h-full w-full origin-left"
          style={{
            backgroundColor: v.bar,
            animation: `llc-shrink ${duration}ms linear forwards`,
          }}
        />
      </span>

      <style>{`
        @keyframes llc-toast-in {
          from { opacity: 0; transform: translateX(20px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes llc-toast-out {
          from { opacity: 1; transform: translateX(0); max-height: 80px; }
          to   { opacity: 0; transform: translateX(20px); max-height: 0; padding: 0; margin: 0; }
        }
        @keyframes llc-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}



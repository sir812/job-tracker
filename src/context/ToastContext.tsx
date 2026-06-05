import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, t?: string) => toast(msg, "success", t), [toast]);
  const error = useCallback((msg: string, t?: string) => toast(msg, "error", t), [toast]);
  const info = useCallback((msg: string, t?: string) => toast(msg, "info", t), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? AlertCircle : Info;
            const bgClass =
              t.type === "success"
                ? "bg-white/95 dark:bg-black/90 border-emerald-500/30 text-emerald-700 dark:text-emerald-100"
                : t.type === "error"
                ? "bg-white/95 dark:bg-black/90 border-rose-500/30 text-rose-700 dark:text-rose-100"
                : "bg-white/95 dark:bg-black/90 border-cyan-500/30 text-cyan-700 dark:text-cyan-100";

            const iconColor =
              t.type === "success"
                ? "text-emerald-400"
                : t.type === "error"
                ? "text-rose-400"
                : "text-cyan-400";

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${bgClass}`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <div className="flex-1">
                  {t.title && <h4 className="font-semibold text-sm mb-0.5">{t.title}</h4>}
                  <p className="text-xs opacity-90 leading-relaxed">{t.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Dismiss toast"
                  title="Dismiss"
                  className="text-black hover:text-black dark:text-white dark:hover:text-white transition-colors p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToasts must be used within ToastProvider");
  return context;
};

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
};

type ToastContextType = {
  showToast: (type: ToastType, message: string) => void;
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    isDanger: boolean;
    isAlert: boolean;
    resolve: (val: boolean) => void;
  } | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showAlert = useCallback((message: string, title = "Informasi") => {
    return new Promise<void>((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        confirmLabel: "OK",
        cancelLabel: "",
        isDanger: false,
        isAlert: true,
        resolve: () => {
          setModal(null);
          resolve();
        },
      });
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModal({
        isOpen: true,
        title: options.title || "Konfirmasi Tindakan",
        message: options.message,
        confirmLabel: options.confirmLabel || "Ya, Lanjutkan",
        cancelLabel: options.cancelLabel || "Batal",
        isDanger: !!options.isDanger,
        isAlert: false,
        resolve: (result: boolean) => {
          setModal(null);
          resolve(result);
        },
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* Floating Toasts container */}
      <div role="status" aria-live="polite" className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let themeClasses = "bg-[#0B2A4A]/95 text-white border-slate-700/50 shadow-slate-900/10";
          let icon = "ℹ️";
          if (t.type === "success") {
            themeClasses = "bg-emerald-50/95 text-emerald-950 border-emerald-100 shadow-emerald-900/5";
            icon = "✓";
          } else if (t.type === "error") {
            themeClasses = "bg-red-50/95 text-red-950 border-red-100 shadow-red-900/5";
            icon = "×";
          }
          
          return (
            /* Double-Bezel for Premium Toast (concentric curves, outer shell + inner core) */
            <div
              key={t.id}
              className="pointer-events-auto p-1 bg-black/5 rounded-2xl border border-black/5 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] animate-slide-in"
            >
              <div className={`flex items-start gap-3 p-4 rounded-[calc(1rem-0.25rem)] border backdrop-blur-md ${themeClasses}`}>
                <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center font-bold text-sm shrink-0">
                  {icon}
                </span>
                <p className="text-xs font-bold leading-relaxed pt-0.5">{t.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Modal Dialog (Double-Bezel & Glass overlay) */}
      {modal && modal.isOpen && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-[#0B2A4A]/40 backdrop-blur-md animate-fade-in"
          onKeyDown={(e) => { if (e.key === 'Escape') modal.resolve(false); }}
        >
          {/* Outer Shell */}
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="bg-slate-950/5 p-1.5 rounded-[2rem] border border-black/5 shadow-2xl max-w-md w-full animate-scale-up">
            {/* Inner Core */}
            <div className="bg-white rounded-[calc(2rem-0.375rem)] p-8 border border-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <h3 id="modal-title" className="text-lg font-extrabold text-[#0B2A4A] mb-3 uppercase tracking-wider">
                {modal.title}
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
                {modal.message}
              </p>
              <div className="flex items-center justify-end gap-3">
                {!modal.isAlert && (
                  <button
                    type="button"
                    onClick={() => modal.resolve(false)}
                    className="px-6 py-3 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                  >
                    {modal.cancelLabel}
                  </button>
                )}
                {/* Island Button with custom micro hover */}
                <button
                  type="button"
                  onClick={() => modal.resolve(true)}
                  className={`px-7 py-3 rounded-full text-xs font-bold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-lg hover:scale-102 active:scale-98 cursor-pointer ${
                    modal.isDanger
                      ? "bg-[#DC0017] hover:bg-red-700 shadow-red-150"
                      : "bg-[#0B2A4A] hover:bg-slate-800 shadow-slate-150"
                  }`}
                >
                  {modal.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useUi() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useUi must be used within a ToastProvider");
  }
  return context;
}

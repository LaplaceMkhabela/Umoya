"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

const ToastCtx = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {msg && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

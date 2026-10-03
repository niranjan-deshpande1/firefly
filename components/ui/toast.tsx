"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const TOAST_MS = 3000; // manual 7.13: one line, 3 seconds

type ToastItem = { id: number; message: string };
const ToastContext = createContext<(message: string) => void>(() => undefined);

/** Polite live region with one specific line, e.g. "check-in posted" (manual 13.4). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((message: string) => setItems((prev) => [...prev, { id: Date.now(), message }]), []);
  return (
    <ToastContext.Provider value={show}>
      <ToastPrimitive.Provider duration={TOAST_MS} swipeDirection="down">
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            className="toast enter-up type-body-s px-4 py-3"
            onOpenChange={(open) => !open && setItems((prev) => prev.filter((t) => t.id !== item.id))}
          >
            <ToastPrimitive.Description>{item.message}</ToastPrimitive.Description>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="z-toast fixed inset-x-4 bottom-20 flex flex-col gap-2 desktop:inset-x-auto desktop:end-6 desktop:bottom-6" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

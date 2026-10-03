"use client";

import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";

/** Action menu: arrows move, Escape closes and restores the trigger (manual 13.3). */
export function Menu({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger asChild>{trigger}</MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Content sideOffset={8} align="end" className="overlay enter-up z-menu flex min-w-48 flex-col rounded-card p-2">
          {children}
        </MenuPrimitive.Content>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}

export function MenuItem({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) {
  return (
    <MenuPrimitive.Item onSelect={onSelect} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control px-3 outline-none data-[highlighted]:bg-raised">
      {children}
    </MenuPrimitive.Item>
  );
}

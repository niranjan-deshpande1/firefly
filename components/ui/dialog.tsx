"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "./cn";
import { Icon } from "./icon";

type DialogProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
  /** drawer slides in from the end edge; modal is centered. */
  kind?: "modal" | "drawer";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Modal or drawer: focus trap, Escape closes, focus returns to the opener (manual 13.3). */
export function Dialog({ title, description, trigger, children, kind = "modal", open, onOpenChange }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={cn("scrim enter-fade fixed inset-0", kind === "modal" ? "z-modal" : "z-drawer")} />
        <DialogPrimitive.Content
          className={cn(
            "overlay fixed flex flex-col gap-6 overflow-y-auto p-6",
            kind === "modal"
              ? "enter-up z-modal start-1/2 top-1/2 max-h-[90dvh] w-[min(100%-2rem,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-card"
              : "enter-side z-drawer inset-y-0 end-0 w-[min(100%,28rem)] rounded-s-card",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <DialogPrimitive.Title className="type-display-3">{title}</DialogPrimitive.Title>
              {description ? <DialogPrimitive.Description className="type-body-s text-secondary measure">{description}</DialogPrimitive.Description> : null}
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost">
                <Icon icon={X} />
                close
              </Button>
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DialogClose = DialogPrimitive.Close;

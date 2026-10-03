"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "./cn";

/** Hand-drawn tick, one open path on the 24 unit grid (manual 5.4). */
function Tick() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M4 12.5 C6.8 15.2 8.3 16.7 10.6 18 C13.1 13.6 16.7 9.1 21 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Checkbox({ className, ...rest }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root className={cn("selection selection-box", className)} {...rest}>
      <CheckboxPrimitive.Indicator>
        <Tick />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export const RadioGroup = RadioPrimitive.Root;

export function Radio({ className, ...rest }: ComponentProps<typeof RadioPrimitive.Item>) {
  return (
    <RadioPrimitive.Item className={cn("selection selection-radio", className)} {...rest}>
      <RadioPrimitive.Indicator className="radio-mark" />
    </RadioPrimitive.Item>
  );
}

export function Toggle({ className, ...rest }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root className={cn("toggle", className)} {...rest}>
      <SwitchPrimitive.Thumb className="toggle-thumb" />
    </SwitchPrimitive.Root>
  );
}

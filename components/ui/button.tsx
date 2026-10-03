import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Visible label while working, e.g. "posting check-in" (manual 7.2). */
  loadingLabel?: string;
  loading?: boolean;
  asChild?: boolean;
};

/** One primary per view. Loading keeps the accessible name and blocks a second activation. */
export function Button({ variant = "secondary", loading, loadingLabel, asChild, className, children, disabled, onClick, ...rest }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn("btn", `btn-${variant}`, className)}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled}
      onClick={loading ? (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault() : onClick}
      {...(asChild ? {} : { type: rest.type ?? "button" })}
      {...rest}
    >
      {loading && loadingLabel && !asChild ? loadingLabel : children}
    </Comp>
  );
}

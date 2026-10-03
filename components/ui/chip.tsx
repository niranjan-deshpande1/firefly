import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/** Spot sticker chip (manual 7.5). Render as a span for labels; use ChipButton when actionable. */
export function Chip({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("chip", className)} {...rest} />;
}

export function ChipButton({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn("chip", className)} {...rest} />;
}

// Blue is never a status (links, focus, active, selected only), so there is no accent tone.
export type StatusTone = "neutral" | "success" | "error" | "warning";

/** Flat pill with a literal label; color never carries meaning alone (manual 13.2). */
export function StatusPill({ tone = "neutral", className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: StatusTone }) {
  return <span className={cn("status", tone !== "neutral" && `status-${tone}`, className)} {...rest} />;
}

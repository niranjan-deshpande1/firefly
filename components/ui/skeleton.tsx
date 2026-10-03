import { cn } from "./cn";

/** Final-geometry block. Never pulses or shimmers (manual 7.10). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}

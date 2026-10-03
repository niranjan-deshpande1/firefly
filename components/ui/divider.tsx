import { cn } from "./cn";

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("divider", className)} />;
}

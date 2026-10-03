import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Leading sticker card: landing and onboarding only (DESIGN.md, manual 5.3). */
  leading?: boolean;
  tilt?: "a" | "b";
};

export function Card({ leading, tilt, className, ...rest }: CardProps) {
  return <div className={cn("card", leading && "card-leading", leading && tilt && `rotate-card-${tilt}`, className)} {...rest} />;
}

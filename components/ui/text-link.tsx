import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

/** Link names its destination; never "click here" or "learn more" (manual 11.1). */
export function TextLink({ className, ...rest }: ComponentProps<typeof NextLink>) {
  return <NextLink className={cn("link", className)} {...rest} />;
}

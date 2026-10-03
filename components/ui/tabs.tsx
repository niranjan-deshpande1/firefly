"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export const Tabs = TabsPrimitive.Root;
export const TabPanel = TabsPrimitive.Content;

export function TabList({ className, ...rest }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex gap-2 overflow-x-auto border-b border-line", className)} {...rest} />;
}

export function Tab({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn("tab", className)} {...rest} />;
}

/** Route-backed tabs (each tab is a URL). Selected tab carries aria-current. */
export function TabLinks({ items, current, label }: { items: { href: string; label: string }[]; current: string; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-2 overflow-x-auto border-b border-line">
      {items.map((item) => (
        <NextLink key={item.href} href={item.href} className="tab inline-flex items-center" aria-current={item.href === current ? "page" : undefined}>
          {item.label}
        </NextLink>
      ))}
    </nav>
  );
}

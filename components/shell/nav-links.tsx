"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Icon, cn } from "@/components/ui";
import { isActive, NAV_ICONS, type NavItem } from "./nav";

/** Active item: accent text plus aria-current; no pill, badge or dot (manual 9.1, 9.2). */
export function NavLinks({ items, layout }: { items: NavItem[]; layout: "rail" | "bar" }) {
  const pathname = usePathname();
  return (
    <ul className={layout === "rail" ? "flex flex-col gap-2" : "grid h-14 auto-cols-fr grid-flow-col"}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} className="flex">
            <NextLink
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 items-center type-label transition-state",
                active ? "text-accent" : "text-secondary hover:text-primary",
                layout === "rail" ? "gap-3 rounded-control px-3 hover:bg-raised" : "flex-col justify-center gap-1 tracking-normal",
              )}
            >
              <Icon icon={NAV_ICONS[item.icon]} size={24} />
              <span>{item.label}</span>
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { TabLinks } from "@/components/ui";

const ITEMS = [
  { href: "/admin", label: "funnel" },
  { href: "/admin/audit", label: "audit log" },
  { href: "/admin/emails", label: "email log" },
  { href: "/admin/invoices", label: "invoices" },
  { href: "/admin/data-requests", label: "data requests" },
  { href: "/admin/settings", label: "settings" },
];

/** Route-backed tabs for the operator area. */
export function AdminTabs() {
  const pathname = usePathname();
  return <TabLinks items={ITEMS} current={pathname} label="operator area" />;
}

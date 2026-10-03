"use client";

import { usePathname } from "next/navigation";
import { TabLinks } from "@/components/ui";
import { currentTabHref, tabItems } from "@/lib/discovery/tabs";

/** Route-backed tabs; the current tab carries aria-current="page". */
export function HackathonTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  return <TabLinks label="hackathon sections" items={tabItems(slug)} current={currentTabHref(pathname, slug)} />;
}

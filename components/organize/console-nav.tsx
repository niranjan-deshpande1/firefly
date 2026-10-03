"use client";

import { usePathname } from "next/navigation";
import { TabLinks } from "@/components/ui";

/** Route-backed tabs for one hackathon's console. The details tab stays current across every edit step. */
export function ConsoleNav({ slug, type }: { slug: string; type: string }) {
  const pathname = usePathname();
  const base = `/organize/${slug}`;
  const items = [
    { href: base, label: "overview" },
    { href: `${base}/edit/basics`, label: "details" },
    { href: `${base}/prizes`, label: "prizes" },
    { href: `${base}/schedule`, label: "schedule" },
    { href: `${base}/criteria`, label: "criteria" },
    { href: `${base}/resources`, label: "resources" },
    { href: `${base}/participants`, label: "participants" },
    { href: `${base}/updates`, label: "updates" },
    type === "HIRING_COHORT" ? { href: `${base}/reviewers`, label: "reviewers" } : { href: `${base}/judges`, label: "judges" },
    ...(type === "OPEN" ? [{ href: `${base}/winners`, label: "awards" }] : []),
  ];
  const current = pathname.startsWith(`${base}/edit/`) ? `${base}/edit/basics` : pathname;
  return <TabLinks items={items} current={current} label="hackathon console" />;
}

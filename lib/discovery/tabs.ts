// Route-backed hackathon tabs. projects and teams pages belong to other builders; the list keeps them.
export const HACKATHON_TABS = ["", "rules", "prizes", "schedule", "judging", "resources", "updates", "participants", "projects", "teams"] as const;

export function tabItems(slug: string) {
  const base = `/hackathons/${slug}`;
  return HACKATHON_TABS.map((t) => ({ href: t ? `${base}/${t}` : base, label: t || "overview" }));
}

/** The tab a pathname belongs to: overview only on the exact base, others on their subtree. */
export function currentTabHref(pathname: string, slug: string): string {
  const base = `/hackathons/${slug}`;
  const path = pathname.replace(/\/+$/, "");
  if (path === base) return base;
  const match = tabItems(slug).find((t) => t.href !== base && (path === t.href || path.startsWith(`${t.href}/`)));
  return match?.href ?? "";
}

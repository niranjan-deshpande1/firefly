// Funnel step definitions, kept pure so labels and order are tested.
export type FunnelCounts = {
  signups: number;
  registrations: number;
  checkIns: number;
  projects: number;
  reviews: number;
  advances: number;
  interviews: number;
  shortlisted: number;
  hires: number;
};

export const FUNNEL_STEPS: { key: keyof FunnelCounts; label: string }[] = [
  { key: "signups", label: "builder signups" },
  { key: "registrations", label: "registrations" },
  { key: "checkIns", label: "check-ins posted" },
  { key: "projects", label: "projects posted" },
  { key: "reviews", label: "reviews" },
  { key: "advances", label: "advances" },
  { key: "interviews", label: "interviews" },
  { key: "shortlisted", label: "shortlisted" },
  { key: "hires", label: "hires" },
];

export type FunnelRow = { key: keyof FunnelCounts; label: string; value: number };

export function funnelRows(counts: FunnelCounts): FunnelRow[] {
  return FUNNEL_STEPS.map((s) => ({ ...s, value: counts[s.key] }));
}

export type Revenue = { invoicedCents: number; paidCents: number; outstandingCents: number };

/** Invoiced counts sent and paid invoices; drafts are not revenue yet. */
export function revenueFrom(invoices: { status: string; amountCents: number }[]): Revenue {
  const invoicedCents = invoices.filter((i) => i.status !== "DRAFT").reduce((sum, i) => sum + i.amountCents, 0);
  const paidCents = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + i.amountCents, 0);
  return { invoicedCents, paidCents, outstandingCents: invoicedCents - paidCents };
}

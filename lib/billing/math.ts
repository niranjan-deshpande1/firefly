// Fee math, kept pure so it is unit tested. Amounts are integer cents.
export function hireFeeCents(salaryCents: number, hireFeeBps: number): number {
  if (!Number.isInteger(salaryCents) || salaryCents <= 0) throw new RangeError("Salary must be a positive whole number of cents.");
  if (!Number.isInteger(hireFeeBps) || hireFeeBps < 0) throw new RangeError("Fee rate must be a non-negative whole number of basis points.");
  return Math.round((salaryCents * hireFeeBps) / 10_000);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** A hire counts toward Firefly if it starts within the attribution window after cohort end. */
export function isWithinAttributionWindow(cohortEndsAt: Date, hireDate: Date, windowMonths: number): boolean {
  return hireDate.getTime() <= addMonths(cohortEndsAt, windowMonths).getTime();
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}

export const INVOICE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SENT"],
  SENT: ["PAID"],
  PAID: [],
};

export function canTransition(from: string, to: string): boolean {
  return INVOICE_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Flat fees are never refunded (DECISION, issue #3). There is no refund path for any invoice in v1. */
export function isRefundable(invoice: { type: string; nonRefundable: boolean }): boolean {
  return !invoice.nonRefundable && invoice.type !== "FLAT_FEE";
}

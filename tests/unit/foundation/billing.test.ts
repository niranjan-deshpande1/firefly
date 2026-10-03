import { describe, expect, it } from "vitest";
import { canTransition, formatCents, hireFeeCents, isRefundable, isWithinAttributionWindow } from "@/lib/billing/math";

describe("hireFeeCents", () => {
  it("charges 5% of a $140,000 salary as $7,000", () => {
    expect(hireFeeCents(140_000_00, 500)).toBe(7_000_00);
  });
  it("rounds to the nearest cent", () => {
    expect(hireFeeCents(100_001, 500)).toBe(5_000);
  });
  it("rejects bad input", () => {
    expect(() => hireFeeCents(0, 500)).toThrow(RangeError);
    expect(() => hireFeeCents(-5, 500)).toThrow(RangeError);
    expect(() => hireFeeCents(1.5, 500)).toThrow(RangeError);
    expect(() => hireFeeCents(100, -1)).toThrow(RangeError);
  });
});

describe("refunds", () => {
  it("never refunds flat fees", () => {
    expect(isRefundable({ type: "FLAT_FEE", nonRefundable: true })).toBe(false);
    expect(isRefundable({ type: "FLAT_FEE", nonRefundable: false })).toBe(false);
  });
  it("respects the non-refundable flag on any invoice", () => {
    expect(isRefundable({ type: "HIRE_FEE", nonRefundable: true })).toBe(false);
  });
});

describe("invoice states", () => {
  it("moves draft to sent to paid only", () => {
    expect(canTransition("DRAFT", "SENT")).toBe(true);
    expect(canTransition("SENT", "PAID")).toBe(true);
    expect(canTransition("DRAFT", "PAID")).toBe(false);
    expect(canTransition("PAID", "SENT")).toBe(false);
    expect(canTransition("NOPE", "PAID")).toBe(false);
  });
});

describe("attribution window", () => {
  const end = new Date("2026-10-01T00:00:00Z");
  it("counts hires within 12 months of cohort end", () => {
    expect(isWithinAttributionWindow(end, new Date("2027-09-30T00:00:00Z"), 12)).toBe(true);
    expect(isWithinAttributionWindow(end, new Date("2027-10-02T00:00:00Z"), 12)).toBe(false);
  });
});

describe("formatCents", () => {
  it("formats whole dollars without decimals", () => {
    expect(formatCents(100_000)).toBe("$1,000");
    expect(formatCents(7_000_00)).toBe("$7,000");
    expect(formatCents(1050)).toBe("$10.50");
  });
});

import { describe, expect, it } from "vitest";
import { auditFilterSchema, auditWhere, dateRange, emailFilterSchema, emailWhere, filterHref, parseFilters } from "@/lib/admin/filters";
import { FUNNEL_STEPS, funnelRows, revenueFrom } from "@/lib/admin/funnel";
import { settingsFormSchema, settingsFromForm, settingsToForm } from "@/lib/admin/forms";
import { actionLabel, describeMetadata } from "@/lib/admin/labels";

describe("audit filters", () => {
  it("parses valid params and defaults the page", () => {
    const f = parseFilters(auditFilterSchema, { action: "REPORT_VIEW", actor: " Jordan ", from: "2026-10-01" });
    expect(f).toEqual({ action: "REPORT_VIEW", actor: "Jordan", subject: undefined, from: "2026-10-01", to: undefined, page: 1 });
  });

  it("drops invalid values instead of failing the page", () => {
    const f = parseFilters(auditFilterSchema, { action: "DROP_TABLE", from: "yesterday", page: "-3", subject: "Maya" });
    expect(f.action).toBeUndefined();
    expect(f.from).toBeUndefined();
    expect(f.page).toBe(1);
    expect(f.subject).toBe("Maya");
  });

  it("takes the first value when a param repeats", () => {
    expect(parseFilters(auditFilterSchema, { action: ["HIRE_REPORTED", "REPORT_VIEW"] }).action).toBe("HIRE_REPORTED");
  });

  it("builds a where clause from every filter", () => {
    const where = auditWhere({ action: "REPORT_VIEW", actor: "jordan", subject: "maya", from: "2026-10-01", to: "2026-10-01", page: 1 });
    expect(where.action).toBe("REPORT_VIEW");
    expect(where.actor).toEqual({ OR: [{ id: "jordan" }, { name: { contains: "jordan" } }, { email: { contains: "jordan" } }, { username: { contains: "jordan" } }] });
    expect(where.subjectUser).toBeDefined();
    expect(where.createdAt).toEqual({ gte: new Date("2026-10-01T00:00:00.000Z"), lt: new Date("2026-10-02T00:00:00.000Z") });
  });

  it("leaves the where clause empty with no filters", () => {
    expect(auditWhere({ page: 1 })).toEqual({});
    expect(dateRange()).toBeUndefined();
  });
});

describe("email filters", () => {
  it("filters by template and recipient", () => {
    const f = parseFilters(emailFilterSchema, { template: "invoiceIssued", to: "example.test" });
    expect(emailWhere(f)).toEqual({ template: "invoiceIssued", to: { contains: "example.test" } });
  });
});

describe("filterHref", () => {
  it("omits empty values and page 1", () => {
    expect(filterHref("/admin/audit", { action: "REPORT_VIEW", actor: "", page: 1 })).toBe("/admin/audit?action=REPORT_VIEW");
    expect(filterHref("/admin/audit", { page: 3 })).toBe("/admin/audit?page=3");
    expect(filterHref("/admin/invoices", { status: undefined })).toBe("/admin/invoices");
  });
});

describe("funnel", () => {
  it("keeps the brief's order from signup to hire", () => {
    expect(FUNNEL_STEPS.map((s) => s.key)).toEqual(["signups", "registrations", "checkIns", "projects", "reviews", "advances", "interviews", "shortlisted", "hires"]);
  });

  it("maps counts to labelled rows", () => {
    const rows = funnelRows({ signups: 24, registrations: 27, checkIns: 20, projects: 18, reviews: 19, advances: 5, interviews: 6, shortlisted: 5, hires: 2 });
    expect(rows[0]).toEqual({ key: "signups", label: "builder signups", value: 24 });
    expect(rows.at(-1)?.value).toBe(2);
  });

  it("counts sent and paid as invoiced, leaves drafts out", () => {
    const r = revenueFrom([
      { status: "PAID", amountCents: 100_000 },
      { status: "SENT", amountCents: 750_000 },
      { status: "DRAFT", amountCents: 660_000 },
    ]);
    expect(r).toEqual({ invoicedCents: 850_000, paidCents: 100_000, outstandingCents: 750_000 });
  });
});

describe("settings form", () => {
  it("converts dollars and percent to cents and basis points", () => {
    const form = settingsFormSchema.parse({ flatFee: "$1,000", hireFeePercent: "5", attributionWindowMonths: "12", retentionMonths: "12" });
    expect(settingsFromForm(form)).toEqual({ flatFeeCents: 100_000, hireFeeBps: 500, attributionWindowMonths: 12, retentionMonths: 12 });
  });

  it("handles fractional percents", () => {
    const form = settingsFormSchema.parse({ flatFee: "1500.50", hireFeePercent: "2.5", attributionWindowMonths: "6", retentionMonths: "24" });
    expect(settingsFromForm(form)).toMatchObject({ flatFeeCents: 150_050, hireFeeBps: 250 });
  });

  it("rejects text and negative numbers", () => {
    expect(settingsFormSchema.safeParse({ flatFee: "lots", hireFeePercent: "-5", attributionWindowMonths: "1.5", retentionMonths: "" }).success).toBe(false);
  });

  it("round-trips stored settings to form values", () => {
    const stored = { flatFeeCents: 100_000, hireFeeBps: 500, attributionWindowMonths: 12, retentionMonths: 12 };
    expect(settingsFromForm(settingsFormSchema.parse(settingsToForm(stored)))).toEqual(stored);
  });
});

describe("labels", () => {
  it("names audit actions in lowercase words", () => {
    expect(actionLabel("REPORT_VIEW")).toBe("candidate report viewed");
    expect(actionLabel("SOMETHING_NEW")).toBe("something new");
  });

  it("describes metadata in one line", () => {
    expect(describeMetadata({ kind: "DELETE", status: "COMPLETED" })).toBe("kind DELETE; status COMPLETED");
    expect(describeMetadata({ before: { hireFeeBps: 500 } })).toBe("before: hireFeeBps 500");
    expect(describeMetadata({})).toBe("");
  });
});

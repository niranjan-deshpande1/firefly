// Pure form parsing for admin actions, unit tested.
import { z } from "zod";

const money = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/[$,\s]/g, "") : v),
  z.string().regex(/^\d+(\.\d{1,2})?$/, "enter an amount in dollars, like 1000"),
);
const percent = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "enter a percent, like 5");
const months = z.string().trim().regex(/^\d+$/, "enter a whole number of months");

/** The settings form shows dollars and percent; storage uses cents and basis points. */
export const settingsFormSchema = z.object({
  flatFee: money,
  hireFeePercent: percent,
  attributionWindowMonths: months,
  retentionMonths: months,
});

export type SettingsForm = z.infer<typeof settingsFormSchema>;

export function settingsFromForm(form: SettingsForm) {
  return {
    flatFeeCents: Math.round(Number(form.flatFee) * 100),
    hireFeeBps: Math.round(Number(form.hireFeePercent) * 100),
    attributionWindowMonths: Number(form.attributionWindowMonths),
    retentionMonths: Number(form.retentionMonths),
  };
}

export function settingsToForm(s: { flatFeeCents: number; hireFeeBps: number; attributionWindowMonths: number; retentionMonths: number }): SettingsForm {
  return {
    flatFee: String(s.flatFeeCents / 100),
    hireFeePercent: String(s.hireFeeBps / 100),
    attributionWindowMonths: String(s.attributionWindowMonths),
    retentionMonths: String(s.retentionMonths),
  };
}

export const resolveRequestSchema = z.object({
  id: z.string().min(1).max(64),
  outcome: z.enum(["COMPLETED", "REJECTED"]),
  note: z.string().trim().max(500).optional(),
});

/** Field-keyed errors for the form, first message per field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

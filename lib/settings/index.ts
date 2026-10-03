import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Admin-editable settings stored in AppSetting. Defaults apply until an admin saves a value.
export const SETTING_DEFAULTS = {
  flatFeeCents: 100_000, // $1,000 per company per hiring cohort, charged at enrollment
  hireFeeBps: 500, // 5% of reported first-year salary
  attributionWindowMonths: 12, // ASSUMPTION, from cohort end (docs/build/decisions-log.md #3)
  retentionMonths: 12,
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = { [K in SettingKey]: number };

const TOO_HIGH = "that value is too high, enter a smaller number.";

export const settingsSchema = z.object({
  flatFeeCents: z.coerce.number().int().min(100, "the cohort fee is below $1, enter 1 or more.").max(10_000_000, TOO_HIGH),
  hireFeeBps: z.coerce.number().int().min(1, "the hire fee is 0%, enter a percent above 0, like 5.").max(5_000, TOO_HIGH),
  attributionWindowMonths: z.coerce.number().int().min(1, "the window is under a month, enter 1 or more.").max(60, TOO_HIGH),
  retentionMonths: z.coerce.number().int().min(1, "retention is under a month, enter 1 or more.").max(120, TOO_HIGH),
});

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.appSetting.findMany();
  const merged: Settings = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in SETTING_DEFAULTS) {
      const n = Number(JSON.parse(row.value));
      if (Number.isFinite(n)) merged[row.key as SettingKey] = n;
    }
  }
  return merged;
}

export async function saveSettings(input: unknown): Promise<Settings> {
  const parsed = settingsSchema.parse(input);
  await prisma.$transaction(
    Object.entries(parsed).map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        create: { key, value: JSON.stringify(value) },
        update: { value: JSON.stringify(value) },
      }),
    ),
  );
  return parsed;
}

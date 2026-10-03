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

export const settingsSchema = z.object({
  flatFeeCents: z.coerce.number().int().min(0).max(10_000_000),
  hireFeeBps: z.coerce.number().int().min(0).max(5_000),
  attributionWindowMonths: z.coerce.number().int().min(1).max(60),
  retentionMonths: z.coerce.number().int().min(1).max(120),
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

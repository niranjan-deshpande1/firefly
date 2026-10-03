// Pure input parsing for company forms. No database access, so it is unit tested.
import { z } from "zod";
import { EXPERIENCE_LEVELS, REMOTE_POLICIES, ROLE_STATUSES } from "@/lib/db/enums";

// Words that stand in for protected traits or unwritten preference (constitution 4.10, legal-flags F3).
// ponytail: a word list catches the common proxies; a human still reviews every criterion.
// Words with job-related meanings ("race" as in race condition, "single" as in single page) are left out on purpose.
export const PROXY_TERMS = [
  "culture fit",
  "cultural fit",
  "culture add",
  "personality",
  "vibe",
  "young",
  "youthful",
  "energetic",
  "digital native",
  "recent grad",
  "native speaker",
  "native english",
  "family",
  "married",
  "age",
  "gender",
  "religion",
  "nationality",
  "pregnan",
  "disab",
  "attractive",
  "lifestyle",
  "pedigree",
  "ivy league",
  "top school",
] as const;

/** The first proxy term found in the text, or null. Matches whole words (prefixes for stems like "pregnan"). */
export function findProxyTerm(text: string): string | null {
  const lower = text.toLowerCase();
  for (const term of PROXY_TERMS) {
    const stem = term === "pregnan" || term === "disab";
    const re = new RegExp(`\\b${term.replace(/ /g, "\\s+")}${stem ? "" : "\\b"}`);
    if (re.test(lower)) return term;
  }
  return null;
}

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  text(max)
    .optional()
    .transform((v) => (v ? v : null));

/** Dollars typed by a person ("140,000" or "140000") to integer cents. Empty means not set. */
/** Salaries are whole dollars; cents ("140,000.50") are refused so fees stay round. */
export function dollarsToCents(value: string | null | undefined): number | null {
  const cleaned = (value ?? "").replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return Number.NaN;
  return Number(cleaned) * 100;
}

export function splitList(value: string | null | undefined): string[] {
  return [...new Set((value ?? "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean))];
}

export const zCriterion = z
  .object({
    id: z.string().optional(),
    name: text(80).min(2, "name each criterion, for example \"API design\"."),
    description: text(500).min(10, "describe what good looks like for this criterion in a sentence."),
    jobRelated: text(500).min(10, "say why this criterion is job-related, in a sentence about the work."),
  })
  .superRefine((c, ctx) => {
    for (const field of ["name", "description", "jobRelated"] as const) {
      const term = findProxyTerm(c[field]);
      if (term) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `"${term}" is not a job-related criterion, describe a skill or behavior the work needs instead.`,
        });
      }
    }
  });

export type CriterionInput = z.infer<typeof zCriterion>;

export const zRole = z
  .object({
    title: text(120).min(2, "add a role title, for example \"Founding Engineer\"."),
    level: z.enum(EXPERIENCE_LEVELS, { message: "choose a level from the list." }),
    description: text(5000).min(20, "describe the role in at least a few sentences."),
    requiredSkills: z.array(text(60)).min(1, "list at least one required skill.").max(20),
    domainKnowledge: optionalText(1000),
    traits: optionalText(1000),
    numberOfHires: z.coerce.number().int().min(1, "plan at least 1 hire.").max(50, "plan 50 hires or fewer per role."),
    salaryMinCents: z.number().int().positive().nullable(),
    salaryMaxCents: z.number().int().positive().nullable(),
    location: optionalText(120),
    remote: z.enum(REMOTE_POLICIES, { message: "choose onsite, hybrid or remote." }),
    status: z.enum(ROLE_STATUSES).default("OPEN"),
    criteria: z.array(zCriterion).min(1, "add at least 1 company-specific criterion.").max(6, "keep it to 6 criteria or fewer."),
  })
  .superRefine((r, ctx) => {
    if (r.salaryMinCents !== null && r.salaryMaxCents !== null && r.salaryMinCents > r.salaryMaxCents) {
      ctx.addIssue({ code: "custom", path: ["salaryMaxCents"], message: "the top of the salary range is below the bottom, swap them." });
    }
    if (r.traits) {
      const term = findProxyTerm(r.traits);
      if (term) ctx.addIssue({ code: "custom", path: ["traits"], message: `"${term}" is not a job-related trait, describe how the person works instead.` });
    }
  });

export type RoleInput = z.infer<typeof zRole>;

export const MAX_CRITERIA_ROWS = 6;

/** Reads the role intake form into the shape zRole validates. */
export function roleFromForm(form: FormData) {
  const get = (k: string) => (form.get(k) as string | null) ?? "";
  const criteria = [];
  for (let i = 0; i < MAX_CRITERIA_ROWS; i++) {
    const row = { id: get(`criteria.${i}.id`) || undefined, name: get(`criteria.${i}.name`), description: get(`criteria.${i}.description`), jobRelated: get(`criteria.${i}.jobRelated`) };
    if (row.name.trim() || row.description.trim() || row.jobRelated.trim()) criteria.push(row);
  }
  const salaryMin = dollarsToCents(get("salaryMin"));
  const salaryMax = dollarsToCents(get("salaryMax"));
  return {
    input: {
      title: get("title"),
      level: get("level"),
      description: get("description"),
      requiredSkills: splitList(get("requiredSkills")),
      domainKnowledge: get("domainKnowledge"),
      traits: get("traits"),
      numberOfHires: get("numberOfHires") || "1",
      salaryMinCents: salaryMin,
      salaryMaxCents: salaryMax,
      location: get("location"),
      remote: get("remote"),
      status: get("status") || "OPEN",
      criteria,
    },
    salaryInvalid: Number.isNaN(salaryMin) || Number.isNaN(salaryMax),
  };
}

export const zCompany = z.object({
  name: text(120).min(2, "add your company name."),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https?:\/\/\S+\.\S+/.test(v), "use a full web address starting with https://."),
  description: optionalText(2000),
  size: optionalText(40),
  stage: optionalText(40),
  location: optionalText(120),
});

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "company"
  );
}

export const zHire = z.object({
  roleId: z.string().min(1),
  candidateId: z.string().min(1, "choose the candidate you hired from the shortlist."),
  salaryCents: z
    .number({ message: "enter the first-year salary in dollars, for example 140000." })
    .int()
    .min(1_000_00, "enter the first-year salary in dollars, for example 140000.")
    .max(10_000_000_00, "that salary looks too large, check the number of zeros."),
  startDate: z.coerce.date({ message: "choose a start date." }),
});

export const zInterviewRequest = z.object({
  roleId: z.string().min(1, "choose the role this interview is for."),
  candidateId: z.string().min(1),
  message: optionalText(1000),
});

/** Zod issues to { "criteria.0.name": message }, first message per field. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}

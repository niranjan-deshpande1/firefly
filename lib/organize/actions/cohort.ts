"use server";

import { z } from "zod";
import { parseJson, prisma, toJson } from "@/lib/db";
import { auditHackathon, guarded, managedForAction, revalidateHackathon } from "../guard";
import { defaultCohortConfig } from "../defaults";
import {
  addOfficeHour,
  checkInSlotSchema,
  cohortBriefSchema,
  cohortDatesSchema,
  formObject,
  invalid,
  officeHourSchema,
  removeAt,
  upsertCheckIn,
  type ActionResult,
  type CheckInSlot,
  type OfficeHour,
} from "../schemas";

const NOT_COHORT: ActionResult = { ok: false, error: "cohort settings apply to hiring cohorts only, change the type in basics first." };

/** Loads (or creates with defaults) the cohort config of a managed hiring cohort. */
async function cohortFor(form: FormData) {
  const { user, hackathon } = await managedForAction(form);
  if (hackathon.type !== "HIRING_COHORT") return null;
  const config =
    hackathon.cohortConfig ??
    (await prisma.cohortConfig.create({ data: { hackathonId: hackathon.id, ...defaultCohortConfig(hackathon.submissionDeadline) } }));
  return { user, hackathon, config };
}

/** Audits a cohort settings change, naming the section (brief, dates, checkIns, officeHours). */
function auditCohort(found: { user: { id: string }; hackathon: { id: string } }, section: string) {
  return auditHackathon(found.user.id, "COHORT_CONFIG_CHANGED", found.hackathon.id, { section });
}

export async function saveCohortBrief(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = cohortBriefSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const found = await cohortFor(form);
    if (!found) return NOT_COHORT;
    await prisma.cohortConfig.update({ where: { id: found.config.id }, data: parsed.data });
    await auditCohort(found, "brief");
    revalidateHackathon(found.hackathon.slug);
    return { ok: true, message: "cohort brief saved" };
  });
}

export async function saveCohortDates(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = cohortDatesSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const found = await cohortFor(form);
    if (!found) return NOT_COHORT;
    await prisma.cohortConfig.update({ where: { id: found.config.id }, data: parsed.data });
    await auditCohort(found, "dates");
    revalidateHackathon(found.hackathon.slug);
    return { ok: true, message: "defense and results saved" };
  });
}

export async function saveCheckIn(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = checkInSlotSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const found = await cohortFor(form);
    if (!found) return NOT_COHORT;
    const list = upsertCheckIn(parseJson<CheckInSlot[]>(found.config.checkInSchedule, []), parsed.data);
    await prisma.cohortConfig.update({ where: { id: found.config.id }, data: { checkInSchedule: toJson(list) } });
    await auditCohort(found, "checkIns");
    revalidateHackathon(found.hackathon.slug);
    return { ok: true, message: `week ${parsed.data.week} check-in saved` };
  });
}

export async function addOfficeHours(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = officeHourSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const found = await cohortFor(form);
    if (!found) return NOT_COHORT;
    const list = addOfficeHour(parseJson<OfficeHour[]>(found.config.officeHours, []), parsed.data);
    await prisma.cohortConfig.update({ where: { id: found.config.id }, data: { officeHours: toJson(list) } });
    await auditCohort(found, "officeHours");
    revalidateHackathon(found.hackathon.slug);
    return { ok: true, message: "office hours added" };
  });
}

const zIndex = z.coerce.number().int().min(0).max(200);

async function removeFromList(form: FormData, column: "checkInSchedule" | "officeHours", message: string): Promise<ActionResult> {
  const index = zIndex.safeParse(form.get("index"));
  if (!index.success) return { ok: false, error: "that row was not found, reload the page and try again." };
  return guarded(async () => {
    const found = await cohortFor(form);
    if (!found) return NOT_COHORT;
    const list = removeAt(parseJson<unknown[]>(found.config[column], []), index.data);
    await prisma.cohortConfig.update({ where: { id: found.config.id }, data: { [column]: toJson(list) } });
    await auditCohort(found, column === "checkInSchedule" ? "checkIns" : "officeHours");
    revalidateHackathon(found.hackathon.slug);
    return { ok: true, message };
  });
}

export async function removeCheckIn(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return removeFromList(form, "checkInSchedule", "check-in removed");
}

export async function removeOfficeHours(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return removeFromList(form, "officeHours", "office hours removed");
}

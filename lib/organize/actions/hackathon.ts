"use server";

import { redirect } from "next/navigation";
import { prisma, toJson } from "@/lib/db";
import { authorize, requireRoleForAction } from "@/lib/permissions";
import { deleteStoredFile, fileUrl, saveFile, UploadError } from "@/lib/storage";
import { auditHackathon, guarded, isUniqueViolation, managedForAction, revalidateHackathon } from "../guard";
import {
  applyTeamPolicy,
  basicsSchema,
  changedFields,
  datesSchema,
  formatSchema,
  formObject,
  invalid,
  rulesSchema,
  statusSchema,
  type ActionResult,
} from "../schemas";
import { defaultCohortConfig, defaultDates } from "../defaults";

const SLUG_TAKEN = { ok: false as const, error: "that slug is taken, choose another.", fieldErrors: { slug: "that slug is taken, choose another." } };

export async function createHackathon(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = basicsSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const user = await requireRoleForAction("ORGANIZER");
    await authorize(user, "hackathon.create");
    const input = parsed.data;
    if (await prisma.hackathon.findUnique({ where: { slug: input.slug }, select: { id: true } })) return SLUG_TAKEN;
    const dates = defaultDates(new Date());
    let created;
    try {
      created = await prisma.hackathon.create({
        data: {
          ...input,
          ...dates,
          ...applyTeamPolicy(input.type, { teamPolicy: "SOLO", maxTeamSize: 1 }),
          status: "DRAFT",
          rules: "",
          eligibility: "",
          organizerId: user.id,
          cohortConfig: input.type === "HIRING_COHORT" ? { create: defaultCohortConfig(dates.submissionDeadline) } : undefined,
        },
        select: { id: true },
      });
    } catch (e) {
      if (isUniqueViolation(e)) return SLUG_TAKEN;
      throw e;
    }
    await auditHackathon(user.id, "HACKATHON_CREATED", created.id, { type: input.type });
    revalidateHackathon(input.slug);
    redirect(`/organize/${input.slug}/edit/dates`);
  });
}

export async function saveBasics(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = basicsSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    const input = parsed.data;
    const clash = await prisma.hackathon.findUnique({ where: { slug: input.slug }, select: { id: true } });
    if (clash && clash.id !== hackathon.id) return SLUG_TAKEN;
    if (input.type !== hackathon.type) {
      // Paid enrollments, reviews and decisions hang off the type; it can't change once people are in.
      const [registrations, enrollments] = await Promise.all([
        prisma.registration.count({ where: { hackathonId: hackathon.id } }),
        prisma.cohortEnrollment.count({ where: { hackathonId: hackathon.id } }),
      ]);
      if (registrations + enrollments > 0) {
        const msg = "the type can't change once people have registered or companies have enrolled.";
        return { ok: false as const, error: msg, fieldErrors: { type: msg } };
      }
    }
    const becomesCohort = input.type === "HIRING_COHORT";
    try {
      await prisma.hackathon.update({
        where: { id: hackathon.id },
        data: {
          ...input,
          ...(becomesCohort ? { teamPolicy: "SOLO", maxTeamSize: 1 } : {}),
          cohortConfig:
            becomesCohort && !hackathon.cohortConfig ? { create: defaultCohortConfig(hackathon.submissionDeadline) } : undefined,
        },
      });
    } catch (e) {
      if (isUniqueViolation(e)) return SLUG_TAKEN;
      throw e;
    }
    const fields = changedFields(hackathon, input);
    if (fields.length > 0) await auditHackathon(user.id, "HACKATHON_UPDATED", hackathon.id, { section: "basics", fields });
    revalidateHackathon(hackathon.slug);
    if (input.slug !== hackathon.slug) {
      revalidateHackathon(input.slug);
      redirect(`/organize/${input.slug}/edit/basics`);
    }
    return { ok: true, message: "basics saved" };
  });
}

export async function saveStatus(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = statusSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    await prisma.hackathon.update({ where: { id: hackathon.id }, data: { status: parsed.data.status } });
    if (hackathon.status !== parsed.data.status) {
      await auditHackathon(user.id, "HACKATHON_STATUS_CHANGED", hackathon.id, { from: hackathon.status, to: parsed.data.status });
    }
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "status saved" };
  });
}

export async function saveDates(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = datesSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    await prisma.hackathon.update({ where: { id: hackathon.id }, data: parsed.data });
    const fields = changedFields(hackathon, parsed.data);
    if (fields.length > 0) await auditHackathon(user.id, "HACKATHON_UPDATED", hackathon.id, { section: "dates", fields });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "dates saved" };
  });
}

export async function saveRules(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = rulesSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    await prisma.hackathon.update({ where: { id: hackathon.id }, data: parsed.data });
    const fields = changedFields(hackathon, parsed.data);
    if (fields.length > 0) await auditHackathon(user.id, "HACKATHON_UPDATED", hackathon.id, { section: "rules", fields });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "rules saved" };
  });
}

export async function saveFormat(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = formatSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    const { format, location, themes } = parsed.data;
    const data = {
      format,
      location: format === "ONLINE" ? null : location,
      themes: toJson(themes),
      ...applyTeamPolicy(hackathon.type, parsed.data),
    };
    await prisma.hackathon.update({ where: { id: hackathon.id }, data });
    const fields = changedFields(hackathon, data);
    if (fields.length > 0) await auditHackathon(user.id, "HACKATHON_UPDATED", hackathon.id, { section: "format", fields });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "format saved" };
  });
}

const COVER_PREFIX = "/api/files/";

export async function saveCover(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const file = form.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "choose an image to upload.", fieldErrors: { cover: "choose an image to upload." } };
  }
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    let stored;
    try {
      stored = await saveFile(user.id, "IMAGE", file);
    } catch (e) {
      if (e instanceof UploadError) return { ok: false, error: e.message, fieldErrors: { cover: e.message } };
      throw e;
    }
    await prisma.hackathon.update({ where: { id: hackathon.id }, data: { coverImage: fileUrl(stored.id) } });
    await removeOldCover(hackathon.coverImage);
    await auditHackathon(user.id, "HACKATHON_UPDATED", hackathon.id, { section: "cover", fields: ["coverImage"] });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "cover image saved" };
  });
}

export async function removeCover(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    await prisma.hackathon.update({ where: { id: hackathon.id }, data: { coverImage: null } });
    await removeOldCover(hackathon.coverImage);
    await auditHackathon(user.id, "HACKATHON_UPDATED", hackathon.id, { section: "cover", fields: ["coverImage"] });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "cover image removed" };
  });
}

/** Deletes the previous upload when it was one of ours (seeded covers may be plain URLs). */
async function removeOldCover(previous: string | null) {
  if (!previous?.startsWith(COVER_PREFIX)) return;
  await deleteStoredFile(previous.slice(COVER_PREFIX.length)).catch(() => undefined);
}

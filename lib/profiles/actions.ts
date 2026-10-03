"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma, toJson } from "@/lib/db";
import { audit } from "@/lib/audit";
import { authorize, ForbiddenError, requireRoleForAction } from "@/lib/permissions";
import {
  CONSENT_VERSION,
  SELF_SERVE_ROLES,
  VISIBILITY_CHOICES,
  nameSchema,
  parseLinks,
  profileSchema,
  safeNext,
  uniqueBlindCode,
  type ActionResult,
} from "./index";

const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "something in the form is not valid, check it and try again.";

async function forbiddenAsResult<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    throw e;
  }
}

const roleInput = z.object({ role: z.enum(SELF_SERVE_ROLES, "choose builder or company member, then continue."), next: z.string().max(500).optional() });

/** Onboarding step 1. Only people who have not agreed to the builder consent and are not on a company yet may switch. */
export async function chooseRole(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = roleInput.safeParse({ role: formData.get("role") ?? undefined, next: formData.get("next") ?? undefined });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const result = await forbiddenAsResult(async () => {
    const user = await requireRoleForAction("CANDIDATE", "COMPANY");
    await authorize(user, "profile.edit", { subjectUserId: user.id });
    if (user.role === "ADMIN") return { ok: false, error: "admins keep the admin role, ask another admin to change it." };
    const [profile, memberships] = await Promise.all([
      prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { consentAt: true } }),
      prisma.companyMember.count({ where: { userId: user.id } }),
    ]);
    if (user.role !== parsed.data.role && (profile?.consentAt || memberships > 0)) {
      return { ok: false, error: "your account is already set up, ask an admin to change your role." };
    }
    if (user.role !== parsed.data.role) await prisma.user.update({ where: { id: user.id }, data: { role: parsed.data.role } });
    return { ok: true };
  });
  if (!result.ok) return result;
  revalidatePath("/", "layout");
  const next = safeNext(parsed.data.next, "");
  if (parsed.data.role === "COMPANY") redirect(next || "/company");
  redirect(`/onboarding?step=consent${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}

const consentInput = z.object({ version: z.literal(CONSENT_VERSION, "the consent text changed while this page was open, reload it and read it again."), next: z.string().max(500).optional() });

/** Onboarding step 2 for builders: stores the consent version and time, creating the profile if missing. */
export async function recordConsent(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = consentInput.safeParse({ version: formData.get("version"), next: formData.get("next") ?? undefined });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const result = await forbiddenAsResult(async () => {
    const user = await requireRoleForAction("CANDIDATE");
    await authorize(user, "privacy.manage", { subjectUserId: user.id });
    const consentAt = new Date();
    const existing = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (existing) {
      await prisma.candidateProfile.update({ where: { id: existing.id }, data: { consentVersion: CONSENT_VERSION, consentAt } });
    } else {
      const blindCode = await uniqueBlindCode(async (code) => !!(await prisma.candidateProfile.findUnique({ where: { blindCode: code }, select: { id: true } })));
      await prisma.candidateProfile.create({ data: { userId: user.id, blindCode, consentVersion: CONSENT_VERSION, consentAt } });
      if (!user.username) {
        // ponytail: a neutral default handle so /u/<username> works; the builder can rename it in settings.
        const username = `builder-${blindCode.toLowerCase()}`;
        const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
        if (!taken) await prisma.user.update({ where: { id: user.id }, data: { username } });
      }
    }
    return { ok: true };
  });
  if (!result.ok) return result;
  revalidatePath("/", "layout");
  redirect(safeNext(parsed.data.next, "/dashboard"));
}

/** Profile editing. Builders edit the full profile; everyone else edits their name. */
export async function saveProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return forbiddenAsResult(async () => {
    const user = await requireRoleForAction();
    await authorize(user, "profile.edit", { subjectUserId: user.id });
    const fields = Object.fromEntries(["name", "username", "headline", "bio", "skills", "links", "location", "school", "experienceLevel"].map((k) => [k, String(formData.get(k) ?? "")]));

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!profile) {
      const parsed = nameSchema.safeParse(fields);
      if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
      await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
      revalidatePath("/", "layout");
      return { ok: true };
    }

    const parsed = profileSchema.safeParse(fields);
    if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
    const links = parseLinks(parsed.data.links);
    if (links.error) return { ok: false, error: links.error };
    const { name, username, headline, bio, skills, location, school, experienceLevel } = parsed.data;

    const owner = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (owner && owner.id !== user.id) return { ok: false, error: `${username} is taken, choose another username.` };

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name, username } }),
      prisma.candidateProfile.update({
        where: { id: profile.id },
        data: { headline, bio, skills: toJson(skills), links: toJson(links.links), location, school, experienceLevel },
      }),
    ]);
    revalidatePath("/settings");
    revalidatePath(`/u/${username}`);
    if (user.username && user.username !== username) revalidatePath(`/u/${user.username}`);
    return { ok: true };
  });
}

async function updateOwnPrivacy(data: { visibility?: string; talentPoolOptIn?: boolean }): Promise<ActionResult> {
  return forbiddenAsResult(async () => {
    const user = await requireRoleForAction("CANDIDATE");
    await authorize(user, "privacy.manage", { subjectUserId: user.id });
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!profile) return { ok: false, error: "you have no builder profile yet, finish onboarding first." };
    await prisma.candidateProfile.update({ where: { id: profile.id }, data });
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    if (user.username) revalidatePath(`/u/${user.username}`);
    return { ok: true };
  });
}

export async function setVisibility(value: string): Promise<ActionResult> {
  const parsed = z.enum(VISIBILITY_CHOICES).safeParse(value);
  if (!parsed.success) return { ok: false, error: "choose public or hidden, then try again." };
  return updateOwnPrivacy({ visibility: parsed.data });
}

export async function setTalentPoolOptIn(value: boolean): Promise<ActionResult> {
  const parsed = z.boolean().safeParse(value);
  if (!parsed.success) return { ok: false, error: "the talent pool choice was not saved, try the switch again." };
  return updateOwnPrivacy({ talentPoolOptIn: parsed.data });
}

/** Files a delete request for an admin to handle. One open request at a time. */
export async function requestDeletion(): Promise<ActionResult> {
  return forbiddenAsResult(async () => {
    const user = await requireRoleForAction();
    await authorize(user, "privacy.manage", { subjectUserId: user.id });
    const open = await prisma.dataRequest.findFirst({ where: { userId: user.id, kind: "DELETE", status: "OPEN" }, select: { id: true } });
    if (open) return { ok: true };
    const request = await prisma.dataRequest.create({ data: { userId: user.id, kind: "DELETE" } });
    await audit({ actorId: user.id, action: "DATA_REQUEST_CREATED", resourceType: "DataRequest", resourceId: request.id, subjectUserId: user.id, metadata: { kind: "DELETE" } });
    revalidatePath("/settings");
    revalidatePath("/admin");
    return { ok: true };
  });
}

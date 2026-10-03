"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, toJson } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { authorize, check, ForbiddenError, requireRoleForAction } from "@/lib/permissions";
import { BillingError, enrollRoleInCohort, reportHire } from "@/lib/billing";
import { sendEmail } from "@/lib/email";
import { fieldErrors, roleFromForm, slugify, zCompany, zHire, zInterviewRequest, zRole, dollarsToCents } from "./schemas";

export type FormState<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fields?: Record<string, string> }
  | null;

const str = (form: FormData, key: string) => ((form.get(key) as string | null) ?? "").trim();

class CompanyError extends Error {}

/** Turns expected failures into one-sentence errors; anything else is rethrown so it is not swallowed. */
function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof ForbiddenError || error instanceof BillingError || error instanceof CompanyError) return { ok: false, error: error.message };
  throw error;
}

const INVALID = "some answers need a fix, see the notes beside each field.";

// ---------- company onboarding, profile and team ----------

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; ; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await prisma.company.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

function companyFromForm(form: FormData) {
  return zCompany.safeParse({
    name: str(form, "name"),
    website: str(form, "website"),
    description: str(form, "description"),
    size: str(form, "size"),
    stage: str(form, "stage"),
    location: str(form, "location"),
  });
}

export async function createCompanyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = companyFromForm(form);
  if (!parsed.success) return { ok: false, error: INVALID, fields: fieldErrors(parsed.error.issues) };
  try {
    const user = await requireRoleForAction("COMPANY");
    const existing = await prisma.companyMember.findFirst({ where: { userId: user.id } });
    if (existing) return { ok: false, error: "you already belong to a company, open your company dashboard." };
    await prisma.company.create({
      data: { ...parsed.data, slug: await uniqueSlug(parsed.data.name), members: { create: { userId: user.id, isOwner: true, title: str(form, "title") || null } } },
    });
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/company");
  return { ok: true, message: "company created" };
}

export async function updateCompanyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const companyId = str(form, "companyId");
  const parsed = companyFromForm(form);
  if (!parsed.success) return { ok: false, error: INVALID, fields: fieldErrors(parsed.error.issues) };
  try {
    await authorize(await getCurrentUser(), "company.manage", { companyId });
    await prisma.company.update({ where: { id: companyId }, data: parsed.data });
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/company", "layout");
  return { ok: true, message: "company profile saved" };
}

const zMember = z.object({
  companyId: z.string().min(1),
  email: z.string().trim().toLowerCase().email("enter the teammate's sign-in email."),
  title: z.string().trim().max(80).optional(),
});

export async function addMemberAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = zMember.safeParse({ companyId: str(form, "companyId"), email: str(form, "email"), title: str(form, "title") });
  if (!parsed.success) return { ok: false, error: INVALID, fields: fieldErrors(parsed.error.issues) };
  const { companyId, email, title } = parsed.data;
  try {
    await authorize(await getCurrentUser(), "company.manage", { companyId });
    const teammate = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!teammate || teammate.role !== "COMPANY") {
      return { ok: false, error: "no company account uses that email, ask your teammate to sign in as a company first.", fields: { email: "no company account uses that email." } };
    }
    const elsewhere = await prisma.companyMember.findFirst({ where: { userId: teammate.id } });
    if (elsewhere) return { ok: false, error: "that person already belongs to a company, ask them to leave it first.", fields: { email: "already on a company team." } };
    await prisma.companyMember.create({ data: { companyId, userId: teammate.id, title: title || null } });
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/company/profile");
  return { ok: true, message: "teammate added" };
}

export async function removeMemberAction(_prev: FormState, form: FormData): Promise<FormState> {
  const companyId = str(form, "companyId");
  const memberId = str(form, "memberId");
  try {
    const user = await getCurrentUser();
    await authorize(user, "company.manage", { companyId });
    const member = await prisma.companyMember.findUnique({ where: { id: memberId } });
    if (!member || member.companyId !== companyId) return { ok: false, error: "that teammate is not on this team, refresh the page." };
    if (member.isOwner) return { ok: false, error: "the company owner can't be removed, add another owner first." };
    await prisma.companyMember.delete({ where: { id: memberId } });
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/company/profile");
  return { ok: true, message: "teammate removed" };
}

// ---------- role intake ----------

export async function saveRoleAction(_prev: FormState<{ roleId: string }>, form: FormData): Promise<FormState<{ roleId: string }>> {
  const roleId = str(form, "roleId") || null;
  const companyIdInput = str(form, "companyId");
  const { input, salaryInvalid } = roleFromForm(form);
  if (salaryInvalid) return { ok: false, error: INVALID, fields: { salaryMinCents: "enter whole dollars, for example 140000." } };
  const parsed = zRole.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID, fields: fieldErrors(parsed.error.issues) };
  const { criteria, requiredSkills, ...fields } = parsed.data;

  try {
    const user = await getCurrentUser();
    let companyId = companyIdInput;
    if (roleId) {
      const existing = await prisma.role.findUnique({ where: { id: roleId }, select: { companyId: true } });
      if (!existing) return { ok: false, error: "that role no longer exists, return to your dashboard." };
      companyId = existing.companyId;
    }
    await authorize(user, "role.manage", { companyId });

    const id = await prisma.$transaction(async (tx) => {
      const role = roleId
        ? await tx.role.update({ where: { id: roleId }, data: { ...fields, requiredSkills: toJson(requiredSkills) } })
        : await tx.role.create({ data: { ...fields, companyId, requiredSkills: toJson(requiredSkills) } });

      const current = await tx.roleCriterion.findMany({ where: { roleId: role.id }, include: { _count: { select: { scores: true } } } });
      const keep = new Set(criteria.map((c) => c.id).filter(Boolean));
      const removed = current.filter((c) => !keep.has(c.id));
      // Deleting a scored criterion would cascade-delete reviewer scores, so it is refused.
      const scored = removed.find((c) => c._count.scores > 0);
      if (scored) throw new CompanyError(`"${scored.name}" already has reviewer scores, keep it and edit its wording instead.`);
      await tx.roleCriterion.deleteMany({ where: { id: { in: removed.map((c) => c.id) } } });
      for (const [sortOrder, { id: criterionId, ...c }] of criteria.entries()) {
        const owned = criterionId && current.some((x) => x.id === criterionId);
        if (owned) await tx.roleCriterion.update({ where: { id: criterionId }, data: { ...c, sortOrder } });
        else await tx.roleCriterion.create({ data: { ...c, sortOrder, roleId: role.id } });
      }
      return role.id;
    });
    revalidatePath("/company");
    revalidatePath(`/company/roles/${id}`);
    return { ok: true, data: { roleId: id }, message: roleId ? "role saved" : "role created" };
  } catch (error) {
    return failure(error);
  }
}

// ---------- cohort enrollment ----------

export type EnrollResult = { number: string; amountCents: number; nonRefundable: boolean; cohort: string };

export async function enrollAction(_prev: FormState<EnrollResult>, form: FormData): Promise<FormState<EnrollResult>> {
  const parsed = z.object({ roleId: z.string().min(1), hackathonId: z.string().min(1, "choose a hiring cohort from the list.") }).safeParse({
    roleId: str(form, "roleId"),
    hackathonId: str(form, "hackathonId"),
  });
  if (!parsed.success) return { ok: false, error: "choose a hiring cohort from the list, then confirm.", fields: fieldErrors(parsed.error.issues) };
  const { roleId, hackathonId } = parsed.data;
  try {
    const user = await getCurrentUser();
    await authorize(user, "cohort.enroll", { roleId });
    const { invoice, enrollment } = await enrollRoleInCohort({ hackathonId, roleId, actorId: user!.id });
    const cohort = await prisma.hackathon.findUnique({ where: { id: enrollment.hackathonId }, select: { title: true } });
    revalidatePath("/company");
    revalidatePath(`/company/roles/${roleId}`);
    revalidatePath("/company/billing");
    revalidatePath("/company/talent");
    return { ok: true, data: { number: invoice.number, amountCents: invoice.amountCents, nonRefundable: invoice.nonRefundable, cohort: cohort?.title ?? "" } };
  } catch (error) {
    return failure(error);
  }
}

// ---------- hire reporting ----------

export type HireResult = { number: string; amountCents: number; salaryCents: number; candidate: string };

export async function reportHireAction(_prev: FormState<HireResult>, form: FormData): Promise<FormState<HireResult>> {
  const salaryCents = dollarsToCents(str(form, "salary"));
  const parsed = zHire.safeParse({
    roleId: str(form, "roleId"),
    candidateId: str(form, "candidateId"),
    salaryCents: salaryCents === null || Number.isNaN(salaryCents) ? undefined : salaryCents,
    startDate: str(form, "startDate") || undefined,
  });
  if (!parsed.success) return { ok: false, error: INVALID, fields: fieldErrors(parsed.error.issues) };
  const { roleId, candidateId, startDate } = parsed.data;
  try {
    const user = await getCurrentUser();
    await authorize(user, "hire.report", { roleId });
    const entry = await prisma.shortlistEntry.findFirst({
      where: { candidateId, status: "ACTIVE", shortlist: { roleId } },
      include: { candidate: { select: { name: true } }, shortlist: { include: { role: { select: { companyId: true } } } } },
    });
    if (!entry) return { ok: false, error: "that candidate is not active on this role's shortlist, choose one from the list.", fields: { candidateId: "choose a candidate from the shortlist." } };
    const { invoice } = await reportHire({ companyId: entry.shortlist.role.companyId, roleId, candidateId, salaryCents: parsed.data.salaryCents, startDate, actorId: user!.id });
    revalidatePath("/company");
    revalidatePath(`/company/roles/${roleId}`);
    revalidatePath(`/company/roles/${roleId}/shortlist`);
    revalidatePath("/company/billing");
    return { ok: true, data: { number: invoice.number, amountCents: invoice.amountCents, salaryCents: parsed.data.salaryCents, candidate: entry.candidate.name ?? "the candidate" } };
  } catch (error) {
    return failure(error);
  }
}

// ---------- interview requests ----------

export async function requestInterviewAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = zInterviewRequest.safeParse({ roleId: str(form, "roleId"), candidateId: str(form, "candidateId"), message: str(form, "message") });
  if (!parsed.success) return { ok: false, error: INVALID, fields: fieldErrors(parsed.error.issues) };
  const { roleId, candidateId, message } = parsed.data;
  try {
    const user = await getCurrentUser();
    await authorize(user, "interviewRequest.create", { roleId });
    const role = await prisma.role.findUnique({ where: { id: roleId }, include: { company: true } });
    if (!role) return { ok: false, error: "that role no longer exists, choose another role." };

    // A company may ask to interview someone on its own shortlist, or an opted-in finisher while it is enrolled.
    const onShortlist = await check(user, "report.view", { roleId, candidateId });
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: candidateId }, select: { talentPoolOptIn: true, blindCode: true } });
    const inPool = !!profile?.talentPoolOptIn && (await check(user, "talentPool.browse", { companyId: role.companyId }));
    if (!profile || (!onShortlist && !inPool)) throw new ForbiddenError("you can only request candidates on your shortlist or in the talent pool, open one of those lists.");

    const pending = await prisma.interviewRequest.findFirst({ where: { roleId, candidateId, status: "PENDING" } });
    if (pending) return { ok: false, error: "an interview request for this candidate is already pending, the firefly team will schedule it." };

    await prisma.interviewRequest.create({ data: { companyId: role.companyId, roleId, candidateId, requestedById: user!.id, message } });
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", email: { not: null } }, select: { email: true } });
    for (const admin of admins) {
      await sendEmail(admin.email!, "interviewRequested", { company: role.company.name, candidateCode: profile.blindCode }, { roleId, candidateId });
    }
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/company");
  return { ok: true, message: "interview requested" };
}

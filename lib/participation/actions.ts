"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasCurrentConsent } from "@/lib/profiles";
import { sendEmail } from "@/lib/email";
import { authorize, can, ForbiddenError } from "@/lib/permissions";
import {
  eligibilityItems,
  firstIssue,
  openSlot,
  registrationBlock,
  teamHasRoom,
  teamsAllowed,
  zCheckIn,
  zInvite,
  zInviteResponse,
  zLookingForTeam,
  zTeamCreate,
} from "./logic";
import { getOwnProject, slotsFor } from "./queries";

// Every action: Zod input, permission check, write, email where the feature sends one, revalidate (contracts 4).
export type ActionState = { ok: true; message?: string } | { ok: false; error: string; field?: string } | null;

const fail = (error: string, field?: string): ActionState => ({ ok: false, error, field });

/** Turns a ForbiddenError into the action's one error sentence; anything else is rethrown. */
async function guarded(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ForbiddenError) return fail(error.message);
    throw error;
  }
}

/** team.manage checks project membership; for teams the fact is team membership (see report). */
function authorizeTeam(user: CurrentUser | null, isMember: boolean): asserts user is CurrentUser {
  if (!can(user, "team.manage", { isTeamMember: isMember })) throw new ForbiddenError();
}

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

function revalidateHackathon(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/hackathons/${slug}`, "layout");
}

// ---------- registration ----------

export async function registerForHackathon(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const hackathonId = String(formData.get("hackathonId") ?? "");
  if (!hackathonId || hackathonId.length > 64) return fail("that hackathon wasn't found, go back to the hackathon list.");

  let slug = "";
  const result = await guarded(async () => {
    const user = await getCurrentUser();
    await authorize(user, "registration.create", { hackathonId });
    if (!user) return fail("you are signed out, sign in and try again.");

    const h = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!h || h.status === "DRAFT") return fail("that hackathon wasn't found, go back to the hackathon list.");
    slug = h.slug;
    const blocked = registrationBlock(h, new Date());
    if (blocked) return fail(blocked);

    const confirmed = new Set(formData.getAll("eligibility").map(String));
    const items = eligibilityItems(h.eligibility);
    if (items.some((_, i) => !confirmed.has(String(i)))) {
      return fail("confirm each eligibility statement, then register.", "eligibility");
    }

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { consentAt: true, consentVersion: true } });
    if (!hasCurrentConsent(profile)) return fail("you haven't agreed to the consent terms yet, review them on the onboarding page first.");

    const lookingForTeam = teamsAllowed(h) && formData.get("lookingForTeam") === "on";
    const existing = await prisma.registration.findUnique({ where: { hackathonId_userId: { hackathonId, userId: user.id } } });
    if (existing && existing.status !== "WITHDRAWN") return { ok: true };
    try {
      await prisma.registration.upsert({
        where: { hackathonId_userId: { hackathonId, userId: user.id } },
        update: { status: "REGISTERED", eligibilityConfirmed: true, lookingForTeam },
        create: { hackathonId, userId: user.id, eligibilityConfirmed: true, lookingForTeam },
      });
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
      return { ok: true };
    }
    if (user.email) await sendEmail(user.email, "registrationConfirmed", { name: user.name ?? "there", hackathon: h.title }, { hackathonId });
    revalidateHackathon(h.slug);
    return { ok: true };
  });

  if (result?.ok) redirect(`/dashboard?registered=${encodeURIComponent(slug)}`);
  return result;
}

// ---------- check-ins ----------

export async function postCheckIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = zCheckIn.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { field, message } = firstIssue(parsed.error);
    return fail(message, field);
  }
  const input = parsed.data;

  return guarded(async () => {
    const user = await getCurrentUser();
    await authorize(user, "checkin.create", { hackathonId: input.hackathonId, subjectUserId: user?.id });
    if (!user) return fail("you are signed out, sign in and try again.");

    const h = await prisma.hackathon.findUnique({ where: { id: input.hackathonId }, include: { cohortConfig: true } });
    if (!h || h.type !== "HIRING_COHORT") return fail("check-ins are for hiring cohorts, open your dashboard instead.");
    const registration = await prisma.registration.findUnique({
      where: { hackathonId_userId: { hackathonId: h.id, userId: user.id } },
    });
    if (!registration || registration.status === "WITHDRAWN") return fail("you aren't registered for this cohort, register first.");

    const posted = await prisma.checkIn.findMany({ where: { hackathonId: h.id, userId: user.id }, select: { week: true } });
    const slot = openSlot(slotsFor(h), new Set(posted.map((p) => p.week)), new Date());
    if (!slot || slot.week !== input.week) return fail(`week ${input.week} isn't open for check-ins right now, reload the page to see the open week.`);

    const project = await getOwnProject(h.id, user.id);
    try {
      await prisma.checkIn.create({
        data: {
          hackathonId: h.id,
          userId: user.id,
          projectId: project?.id ?? null,
          week: input.week,
          progress: input.progress,
          blockers: input.blockers ?? null,
          nextSteps: input.nextSteps ?? null,
          aiUsage: input.aiUsage ?? null,
          hoursSpent: input.hoursSpent ?? null,
        },
      });
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
      return fail(`your week ${input.week} check-in is already posted, read it below.`);
    }
    revalidatePath(`/hackathons/${h.slug}/check-ins`);
    revalidatePath("/dashboard");
    if (project) revalidatePath(`/projects/${project.id}/evidence`);
    return { ok: true, message: "check-in posted" };
  });
}

// ---------- teams ----------

async function teamHackathon(hackathonId: string) {
  const h = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { id: true, slug: true, type: true, status: true, teamPolicy: true, maxTeamSize: true },
  });
  return h && teamsAllowed(h) && h.status !== "COMPLETED" ? h : null;
}

const onTeamIn = (hackathonId: string, userId: string, db: Pick<typeof prisma, "teamMember"> = prisma) =>
  db.teamMember.findFirst({ where: { userId, team: { hackathonId } }, select: { teamId: true } });

export async function createTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = zTeamCreate.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { field, message } = firstIssue(parsed.error);
    return fail(message, field);
  }
  const { hackathonId, name, description } = parsed.data;

  return guarded(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("you are signed out, sign in and try again.");
    const h = await teamHackathon(hackathonId);
    if (!h) return fail("this hackathon doesn't take teams, build solo instead.");
    const registration = await prisma.registration.findUnique({ where: { hackathonId_userId: { hackathonId, userId: user.id } } });
    // The creator becomes the team's first member, so registration stands in for membership here.
    authorizeTeam(user, !!registration && registration.status !== "WITHDRAWN");
    const created = await prisma.$transaction(async (tx) => {
      // Checked inside the transaction so two quick submits can't put one person on two teams.
      if (await onTeamIn(hackathonId, user.id, tx)) return false;
      await tx.team.create({
        data: { hackathonId, name, description: description ?? null, members: { create: { userId: user.id, isLead: true } } },
      });
      await tx.registration.update({ where: { id: registration!.id }, data: { lookingForTeam: false } });
      return true;
    });
    if (!created) return fail("you're already on a team here, leave it first to start another.");
    revalidateHackathon(h.slug);
    return { ok: true, message: "team created" };
  });
}

export async function inviteToTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = zInvite.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { field, message } = firstIssue(parsed.error);
    return fail(message, field);
  }
  const { teamId, username } = parsed.data;

  return guarded(async () => {
    const user = await getCurrentUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true, hackathonId: true, members: { select: { userId: true } }, invites: { where: { status: "PENDING" }, select: { toUserId: true } } },
    });
    if (!team) return fail("that team wasn't found, reload the page.");
    authorizeTeam(user, team.members.some((m) => m.userId === user?.id));
    const h = await teamHackathon(team.hackathonId);
    if (!h) return fail("this hackathon doesn't take teams, build solo instead.");
    if (!teamHasRoom(team.members.length, team.invites.length, h.maxTeamSize)) {
      return fail(`teams here hold ${h.maxTeamSize} people and yours is full with open invites, wait for a reply first.`, "username");
    }

    const invitee = await prisma.user.findUnique({ where: { username }, select: { id: true, name: true, email: true, role: true } });
    if (!invitee || invitee.role !== "CANDIDATE") return fail(`no builder goes by ${username}, check the spelling.`, "username");
    if (invitee.id === user.id) return fail("you're already on this team, invite someone else.", "username");
    const registered = await prisma.registration.findUnique({ where: { hackathonId_userId: { hackathonId: h.id, userId: invitee.id } } });
    if (!registered || registered.status === "WITHDRAWN") return fail(`${username} isn't registered for this hackathon, ask them to register first.`, "username");
    if (await onTeamIn(h.id, invitee.id)) return fail(`${username} is already on a team here, invite someone from the board.`, "username");
    if (team.invites.some((i) => i.toUserId === invitee.id)) return fail(`${username} already has an invite from your team.`, "username");

    await prisma.teamInvite.create({ data: { teamId: team.id, fromUserId: user.id, toUserId: invitee.id } });
    if (invitee.email) {
      await sendEmail(invitee.email, "teamInvite", { name: invitee.name ?? username, team: team.name, from: user.name ?? "a builder" }, { teamId: team.id });
    }
    revalidateHackathon(h.slug);
    return { ok: true, message: `invite sent to ${username}` };
  });
}

export async function respondToInvite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = zInviteResponse.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("that invite wasn't found, reload the page.");
  const { inviteId, response } = parsed.data;

  return guarded(async () => {
    const user = await getCurrentUser();
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      select: { id: true, status: true, toUserId: true, team: { select: { id: true, name: true, hackathonId: true } } },
    });
    if (!invite || invite.status !== "PENDING") return fail("that invite is no longer open, reload the page.");
    authorizeTeam(user, invite.toUserId === user?.id);
    const h = await prisma.hackathon.findUnique({ where: { id: invite.team.hackathonId }, select: { slug: true, maxTeamSize: true } });

    if (response === "DECLINED") {
      await prisma.teamInvite.update({ where: { id: invite.id }, data: { status: "DECLINED" } });
      if (h) revalidateHackathon(h.slug);
      return { ok: true, message: "invite closed" };
    }

    const problem = await prisma.$transaction(async (tx) => {
      // Membership, team size and the invite are re-checked inside the transaction so parallel accepts can't overfill a team.
      if (await onTeamIn(invite.team.hackathonId, user.id, tx)) return "you're already on a team here, leave it first to join this one.";
      const members = await tx.teamMember.count({ where: { teamId: invite.team.id } });
      if (h && members >= h.maxTeamSize) return `${invite.team.name} is full, start your own team instead.`;
      const claimed = await tx.teamInvite.updateMany({ where: { id: invite.id, status: "PENDING" }, data: { status: "ACCEPTED" } });
      if (claimed.count === 0) return "that invite is no longer open, reload the page.";
      await tx.teamMember.create({ data: { teamId: invite.team.id, userId: user.id } });
      await tx.registration.updateMany({ where: { hackathonId: invite.team.hackathonId, userId: user.id }, data: { lookingForTeam: false } });
      return null;
    });
    if (problem) return fail(problem);
    if (h) revalidateHackathon(h.slug);
    return { ok: true, message: `you joined ${invite.team.name}` };
  });
}

export async function leaveTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  if (!teamId || teamId.length > 64) return fail("that team wasn't found, reload the page.");

  return guarded(async () => {
    const user = await getCurrentUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, hackathon: { select: { slug: true } }, members: { select: { id: true, userId: true, isLead: true }, orderBy: { joinedAt: "asc" } } },
    });
    if (!team) return fail("that team wasn't found, reload the page.");
    const me = team.members.find((m) => m.userId === user?.id);
    authorizeTeam(user, !!me);
    const rest = team.members.filter((m) => m.id !== me!.id);

    if (rest.length === 0) {
      // Last one out closes the team; its projects stay with their owners (Project.teamId is SetNull).
      await prisma.team.delete({ where: { id: team.id } });
    } else {
      await prisma.$transaction([
        prisma.teamMember.delete({ where: { id: me!.id } }),
        ...(me!.isLead && !rest.some((m) => m.isLead) ? [prisma.teamMember.update({ where: { id: rest[0].id }, data: { isLead: true } })] : []),
      ]);
    }
    revalidateHackathon(team.hackathon.slug);
    return { ok: true, message: "you left the team" };
  });
}

export async function setLookingForTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = zLookingForTeam.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const { field, message } = firstIssue(parsed.error);
    return fail(message, field);
  }
  const { hackathonId, looking, note } = parsed.data;

  return guarded(async () => {
    const user = await getCurrentUser();
    if (!user) return fail("you are signed out, sign in and try again.");
    const registration = await prisma.registration.findUnique({ where: { hackathonId_userId: { hackathonId, userId: user.id } } });
    authorizeTeam(user, !!registration && registration.status !== "WITHDRAWN");
    const h = await teamHackathon(hackathonId);
    if (!h) return fail("this hackathon doesn't take teams, build solo instead.");
    await prisma.registration.update({ where: { id: registration!.id }, data: { lookingForTeam: looking, lookingForNote: looking ? (note ?? null) : null } });
    revalidateHackathon(h.slug);
    return { ok: true, message: looking ? "you're on the board" : "you're off the board" };
  });
}

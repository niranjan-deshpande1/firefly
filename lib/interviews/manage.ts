"use server";

// Cancel and reschedule interviews, and decline company interview requests.
// Allowed for the hackathon's own organizer and admins (`interview.manage`).
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, INTERVIEW_MODES } from "@/lib/db";
import { authorize, ForbiddenError, requireRoleForAction } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { sendEmail, type EMAIL_TEMPLATES } from "@/lib/email";
import { formatDateTime } from "@/lib/format/date";
import { manageError, OPEN_STATUSES, placeError, zonedTimeToUtc } from "./rules";

type ActionResult = { ok: true } | { ok: false; error: string };

function errorText(e: unknown): string {
  if (e instanceof ForbiddenError) return e.message;
  throw e;
}

const reason = (what: string) => z.string().trim().min(1, `the reason is empty, write why this ${what}.`).max(1000);

/** Loads the interview with everyone who gets an email, after the `interview.manage` check. */
async function loadManageable(interviewId: string) {
  const user = await requireRoleForAction("ORGANIZER");
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: {
      id: true,
      projectId: true,
      candidateId: true,
      status: true,
      scheduledAt: true,
      timeZone: true,
      durationMin: true,
      mode: true,
      location: true,
      videoLink: true,
      candidate: { select: { name: true, email: true } },
      interviewers: { select: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!interview) throw new ForbiddenError("that interview was not found, return to your interviews.");
  await authorize(user, "interview.manage", { projectId: interview.projectId });
  return { user, interview };
}

type Manageable = Awaited<ReturnType<typeof loadManageable>>["interview"];

/** One email to the candidate and one to each panelist. */
async function emailEveryone<T extends "interviewCancelled" | "interviewRescheduled">(
  interview: Manageable,
  template: T,
  params: Omit<Parameters<(typeof EMAIL_TEMPLATES)[T]>[0], "name">,
) {
  const people = [interview.candidate, ...interview.interviewers.map((i) => i.user)];
  for (const p of people) {
    if (!p.email) continue;
    await sendEmail(p.email, template, { ...params, name: p.name ?? "there" } as Parameters<(typeof EMAIL_TEMPLATES)[T]>[0], { interviewId: interview.id });
  }
}

function revalidateInterview(projectId: string) {
  revalidatePath("/interviews", "layout"); // the list, the room and the manage page
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/company", "layout");
}

const cancelSchema = z.object({ interviewId: z.string().min(1), reason: reason("interview is cancelled") });

export async function cancelInterview(input: z.input<typeof cancelSchema>): Promise<ActionResult> {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  try {
    const { user, interview } = await loadManageable(v.interviewId);
    const blocked = manageError(interview.status, "cancel");
    if (blocked) return { ok: false, error: blocked };

    // Conditional on status, so a panel completing it at the same moment wins.
    const { count } = await prisma.interview.updateMany({
      where: { id: interview.id, status: { in: OPEN_STATUSES } },
      data: { status: "CANCELLED", notes: `cancelled: ${v.reason}` },
    });
    if (count === 0) return { ok: false, error: "this interview closed a moment ago, reload the page to see its status." };

    await audit({
      actorId: user.id,
      action: "INTERVIEW_CANCELLED",
      resourceType: "Interview",
      resourceId: interview.id,
      subjectUserId: interview.candidateId,
      metadata: { reason: v.reason, projectId: interview.projectId },
    });
    await emailEveryone(interview, "interviewCancelled", { when: formatDateTime(interview.scheduledAt, interview.timeZone), reason: v.reason });
    revalidateInterview(interview.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

const rescheduleSchema = z
  .object({
    interviewId: z.string().min(1),
    localTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "that time is not complete, choose a date and a time."),
    durationMin: z.coerce.number().int().min(15, "that duration is too short, choose 15 minutes or more.").max(240, "that duration is too long, choose 240 minutes or less."),
    mode: z.enum(INTERVIEW_MODES),
    location: z.string().trim().max(300).optional(),
    videoLink: z.string().trim().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    const place = placeError(v);
    if (place) ctx.addIssue({ code: "custom", path: [place.path], message: place.message });
  });

export async function rescheduleInterview(input: z.input<typeof rescheduleSchema>): Promise<ActionResult> {
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  try {
    const { user, interview } = await loadManageable(v.interviewId);
    const blocked = manageError(interview.status, "reschedule");
    if (blocked) return { ok: false, error: blocked };

    // The IANA zone chosen at scheduling stays; the new wall time is read in that zone.
    const scheduledAt = zonedTimeToUtc(v.localTime, interview.timeZone);
    if (!scheduledAt) return { ok: false, error: "that time is not valid, choose a date and a time." };
    if (scheduledAt.getTime() <= Date.now()) return { ok: false, error: "that time has already passed, choose a time in the future." };

    const location = v.mode === "IN_PERSON" ? v.location! : null;
    const videoLink = v.mode === "VIDEO" ? v.videoLink! : null;
    const { count } = await prisma.interview.updateMany({
      where: { id: interview.id, status: { in: OPEN_STATUSES } },
      data: { scheduledAt, durationMin: v.durationMin, mode: v.mode, location, videoLink },
    });
    if (count === 0) return { ok: false, error: "this interview closed a moment ago, reload the page to see its status." };

    await audit({
      actorId: user.id,
      action: "INTERVIEW_RESCHEDULED",
      resourceType: "Interview",
      resourceId: interview.id,
      subjectUserId: interview.candidateId,
      metadata: {
        from: { at: interview.scheduledAt.toISOString(), minutes: interview.durationMin, mode: interview.mode },
        to: { at: scheduledAt.toISOString(), minutes: v.durationMin, mode: v.mode },
      },
    });
    await emailEveryone(interview, "interviewRescheduled", {
      when: formatDateTime(scheduledAt, interview.timeZone),
      where: location ?? `this video link: ${videoLink}`,
      minutes: v.durationMin,
    });
    revalidateInterview(interview.projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

const declineSchema = z.object({ requestId: z.string().min(1), reason: reason("request is declined") });

export async function declineInterviewRequest(input: z.input<typeof declineSchema>): Promise<ActionResult> {
  const parsed = declineSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  try {
    const user = await requireRoleForAction("ORGANIZER");
    const request = await prisma.interviewRequest.findUnique({
      where: { id: v.requestId },
      select: {
        id: true,
        status: true,
        candidateId: true,
        requestedById: true,
        role: { select: { title: true } },
        company: { select: { name: true } },
        candidate: { select: { candidateProfile: { select: { blindCode: true } } } },
      },
    });
    if (!request) throw new ForbiddenError("that request was not found, return to interview requests.");
    // Organizers handle requests for candidates with a project in a hackathon they run.
    const project = await prisma.project.findFirst({
      where: { ownerId: request.candidateId, ...(user.role === "ADMIN" ? {} : { hackathon: { organizerId: user.id } }) },
      select: { id: true },
    });
    if (!project) throw new ForbiddenError();
    await authorize(user, "interview.manage", { projectId: project.id });

    if (request.status !== "PENDING") return { ok: false, error: "this request is already handled, reload the page to see its status." };
    const { count } = await prisma.interviewRequest.updateMany({ where: { id: request.id, status: "PENDING" }, data: { status: "DECLINED" } });
    if (count === 0) return { ok: false, error: "this request was handled a moment ago, reload the page to see its status." };

    // The schema has no reason column, so the reason lives in the audit entry and the email.
    await audit({
      actorId: user.id,
      action: "INTERVIEW_REQUEST_DECLINED",
      resourceType: "InterviewRequest",
      resourceId: request.id,
      subjectUserId: request.candidateId,
      metadata: { reason: v.reason, company: request.company.name, role: request.role.title },
    });
    const requester = await prisma.user.findUnique({ where: { id: request.requestedById }, select: { name: true, email: true } });
    if (requester?.email) {
      await sendEmail(
        requester.email,
        "interviewRequestDeclined",
        {
          name: requester.name ?? "there",
          company: request.company.name,
          role: request.role.title,
          candidateCode: request.candidate.candidateProfile?.blindCode ?? "hidden",
          reason: v.reason,
        },
        { requestId: request.id },
      );
    }
    revalidatePath("/interviews", "layout");
    revalidatePath("/admin");
    revalidatePath("/company", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

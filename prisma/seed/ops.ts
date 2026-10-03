// Audit entries, email log rows and data requests, matching what the app would have written.
// Email copy mirrors lib/email templates (that module is server-only, so it can't be imported here).
import { COMPANIES, ROLES } from "./companies";
import { ADVANCED, INVOICES, invoiceNumber } from "./hiring";
import { CANDIDATES, COMPANY_PEOPLE, STAFF, type CandidateKey } from "./people";
import { FALL, FALL_MEMBERS, HACKATHONS, OPEN, OPEN_MEMBERS } from "./hackathons";
import { FALL_PROJECTS, OPEN_PROJECTS, projectId } from "./projects";
import { FALL_PLAN } from "./review";
import { daysFromNow, email, json, prisma } from "./util";

type AuditRow = { actorId: string | null; action: string; resourceType: string; resourceId?: string; subjectUserId?: string; metadata?: object; createdAt: Date };
type EmailRow = { to: string; subject: string; body: string; template: string; metadata?: object; createdAt: Date };

const cand = (k: CandidateKey) => CANDIDATES[k];

export async function seedOps() {
  const audits: AuditRow[] = [];
  const emails: EmailRow[] = [];

  // Enrollments and invoices.
  const enrollments: [string, string, string, number][] = [
    [COMPANY_PEOPLE.jordan.id, INVOICES.northwindFlat, ROLES.founding, 30],
    [COMPANY_PEOPLE.morgan.id, INVOICES.harborFlat, ROLES.harborBackend, 29],
    [COMPANY_PEOPLE.dana.id, INVOICES.kestrelFlat, ROLES.kestrelData, 28],
  ];
  for (const [actorId, invoiceId, roleId, d] of enrollments) {
    audits.push({ actorId, action: "ENROLLMENT_CREATED", resourceType: "CohortEnrollment", metadata: { hackathonId: HACKATHONS.fall.id, roleId }, createdAt: daysFromNow(-d) });
    audits.push({ actorId, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: invoiceId, metadata: { type: "FLAT_FEE" }, createdAt: daysFromNow(-d) });
  }
  audits.push({ actorId: STAFF.admin.id, action: "INVOICE_PAID", resourceType: "Invoice", resourceId: INVOICES.harborFlat, createdAt: daysFromNow(-20) });
  audits.push({ actorId: STAFF.admin.id, action: "INVOICE_PAID", resourceType: "Invoice", resourceId: INVOICES.kestrelFlat, createdAt: daysFromNow(-15) });
  const invoiceEmails: [string, string, number, string, boolean, number][] = [
    [COMPANY_PEOPLE.jordan.username, COMPANIES.northwind.name, 1, "$1,000", true, 30],
    [COMPANY_PEOPLE.morgan.username, COMPANIES.harbor.name, 2, "$1,000", true, 29],
    [COMPANY_PEOPLE.dana.username, COMPANIES.kestrel.name, 3, "$1,000", true, 28],
    [COMPANY_PEOPLE.morgan.username, COMPANIES.harbor.name, 5, "$7,500", false, 1],
  ];
  for (const [user, company, n, amount, nonRefundable, d] of invoiceEmails) {
    emails.push({
      to: email(user),
      template: "invoiceIssued",
      subject: `invoice ${invoiceNumber(n)} from firefly`,
      body: `hello ${company},\n\ninvoice ${invoiceNumber(n)} for ${amount} is ready.${nonRefundable ? " this fee is non-refundable." : ""}`,
      createdAt: daysFromNow(-d),
    });
  }

  // Registrations and posted projects.
  const registrations: [CandidateKey, string, Date][] = [
    ...FALL_MEMBERS.map((k, i) => [k, HACKATHONS.fall.title, daysFromNow(-30 + i / 2)] as [CandidateKey, string, Date]),
    ...OPEN_MEMBERS.map((k, i) => [k, HACKATHONS.open.title, daysFromNow(-55 + i)] as [CandidateKey, string, Date]),
  ];
  for (const [k, hackathon, createdAt] of registrations) {
    emails.push({ to: email(cand(k).username), template: "registrationConfirmed", subject: `you're registered for ${hackathon}`, body: `hi ${cand(k).name},\n\nyou're registered for ${hackathon}. we'll email you before each deadline.`, createdAt });
  }
  for (const s of [...FALL_PROJECTS, ...OPEN_PROJECTS]) {
    const deadline = s.hackathon === "fall" ? FALL.submissionDeadline : OPEN.submissionDeadline;
    emails.push({ to: email(cand(s.owner).username), template: "submissionReceived", subject: `${s.title} is posted`, body: `hi ${cand(s.owner).name},\n\n${s.title} is posted. reviews start after the deadline.`, createdAt: new Date(deadline.getTime() - 3_600_000) });
  }
  for (const k of FALL_MEMBERS) {
    emails.push({ to: email(cand(k).username), template: "checkInReminder", subject: "your week 2 check-in is due", body: `hi ${cand(k).name},\n\nyour week 2 check-in is due soon. it takes about 10 minutes.`, createdAt: daysFromNow(-7) });
    emails.push({ to: email(cand(k).username), template: "hackathonUpdate", subject: `${HACKATHONS.fall.title}: defense interviews are open`, body: "Advanced builders will get a time by email. Bring a photo ID.", createdAt: daysFromNow(-4) });
  }

  // Reviews, reveals, evidence views and decisions.
  for (const [n, plan] of FALL_PLAN.entries()) {
    const pid = projectId(plan.key);
    const subject = cand(plan.key).id;
    const reviewers = plan.pendingFirst ? [plan.reviewers[1]] : plan.reviewers;
    for (const reviewerId of reviewers) {
      audits.push({ actorId: reviewerId, action: "EVIDENCE_VIEW", resourceType: "Project", resourceId: pid, subjectUserId: subject, createdAt: daysFromNow(-5.5 + n * 0.2) });
      audits.push({ actorId: reviewerId, action: "TRANSCRIPT_VIEW", resourceType: "AITranscript", resourceId: `${pid}-t0`, subjectUserId: subject, createdAt: daysFromNow(-5.4 + n * 0.2) });
      audits.push({ actorId: reviewerId, action: "REVIEW_SUBMITTED", resourceType: "Review", resourceId: pid, subjectUserId: subject, createdAt: daysFromNow(-5 + n * 0.2) });
    }
    if (plan.key === "aisha" || plan.key === "daniel") {
      audits.push({ actorId: plan.reviewers[0], action: "IDENTITY_REVEAL", resourceType: "Project", resourceId: pid, subjectUserId: subject, createdAt: daysFromNow(-4.9 + n * 0.2) });
    }
    if (plan.decision) {
      audits.push({ actorId: plan.reviewers[0], action: "DECISION_MADE", resourceType: "Decision", resourceId: pid, subjectUserId: subject, metadata: { outcome: plan.decision.outcome }, createdAt: daysFromNow(-3 + n * 0.1) });
      const label = plan.decision.outcome === "ADVANCE" ? "advanced to a defense interview" : plan.decision.outcome === "HOLD" ? "on hold" : "not advancing";
      emails.push({ to: email(cand(plan.key).username), template: "decisionMade", subject: "an update on your project", body: `hi ${cand(plan.key).name},\n\nyour review is complete. status: ${label}. open your dashboard for next steps.`, createdAt: daysFromNow(-3 + n * 0.1) });
    }
  }

  // Interviews, verification and hires.
  for (const k of ADVANCED) {
    emails.push({ to: email(cand(k).username), template: "interviewScheduled", subject: "your defense interview is scheduled", body: `hi ${cand(k).name},\n\nyour defense interview is scheduled. it runs 75 minutes. bring a photo ID.`, createdAt: daysFromNow(-3) });
  }
  emails.push({ to: email(cand("maya").username), template: "interviewScheduled", subject: "your defense interview is scheduled", body: `hi ${cand("maya").name},\n\nyour defense interview is scheduled at the Firefly studio. it runs 75 minutes. bring a photo ID.`, createdAt: daysFromNow(-1) });
  for (const [k, actorId, d] of [["aisha", STAFF.priya.id, 3], ["ben", STAFF.hana.id, 2], ["camila", STAFF.leo.id, 2], ["daniel", STAFF.hana.id, 1]] as [CandidateKey, string, number][]) {
    audits.push({ actorId, action: "INTERVIEW_COMPLETED", resourceType: "Interview", resourceId: `interview-${k}`, subjectUserId: cand(k).id, createdAt: daysFromNow(-d + 0.1) });
  }
  audits.push({ actorId: COMPANY_PEOPLE.morgan.id, action: "REPORT_VIEW", resourceType: "CandidateReport", resourceId: ROLES.harborBackend, subjectUserId: cand("aisha").id, createdAt: daysFromNow(-2) });
  audits.push({ actorId: COMPANY_PEOPLE.morgan.id, action: "REPORT_VIEW", resourceType: "CandidateReport", resourceId: ROLES.harborBackend, subjectUserId: cand("aisha").id, createdAt: daysFromNow(-1.2) });
  audits.push({ actorId: COMPANY_PEOPLE.jordan.id, action: "REPORT_VIEW", resourceType: "CandidateReport", resourceId: ROLES.founding, subjectUserId: cand("ben").id, createdAt: daysFromNow(-1.5) });
  audits.push({ actorId: COMPANY_PEOPLE.dana.id, action: "REPORT_VIEW", resourceType: "CandidateReport", resourceId: ROLES.kestrelData, subjectUserId: cand("daniel").id, createdAt: daysFromNow(-0.5) });
  audits.push({ actorId: COMPANY_PEOPLE.dana.id, action: "HIRE_REPORTED", resourceType: "Hire", subjectUserId: cand("vera").id, createdAt: daysFromNow(-20) });
  audits.push({ actorId: COMPANY_PEOPLE.dana.id, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: INVOICES.veraHire, metadata: { type: "HIRE_FEE" }, createdAt: daysFromNow(-20) });
  audits.push({ actorId: COMPANY_PEOPLE.morgan.id, action: "HIRE_REPORTED", resourceType: "Hire", subjectUserId: cand("aisha").id, createdAt: daysFromNow(-1) });
  audits.push({ actorId: COMPANY_PEOPLE.morgan.id, action: "INVOICE_CREATED", resourceType: "Invoice", resourceId: INVOICES.aishaHire, metadata: { type: "HIRE_FEE" }, createdAt: daysFromNow(-1) });

  // Feedback for open hackathon finishers went out with results.
  for (const k of OPEN_MEMBERS.filter((k) => k !== "vera")) {
    emails.push({ to: email(cand(k).username), template: "feedbackReady", subject: "your written feedback is ready", body: `hi ${cand(k).name},\n\nwritten feedback on your project is on your dashboard.`, createdAt: OPEN.endsAt });
  }
  audits.push({ actorId: STAFF.organizer.id, action: "COMMENT_HIDDEN", resourceType: "Comment", resourceId: "comment-hidden", metadata: { projectId: projectId("theo") }, createdAt: daysFromNow(-41) });

  // Data requests: one export already handled, one open export, one open delete.
  await prisma.dataRequest.create({ data: { id: "dr-tariq-export", userId: cand("tariq").id, kind: "EXPORT", status: "COMPLETED", note: "Wants a copy before applying elsewhere.", resolvedById: STAFF.admin.id, resolvedAt: daysFromNow(-9), createdAt: daysFromNow(-10) } });
  await prisma.dataRequest.create({ data: { id: "dr-kenji-export", userId: cand("kenji").id, kind: "EXPORT", status: "OPEN", note: null, createdAt: daysFromNow(-2) } });
  await prisma.dataRequest.create({ data: { id: "dr-jamal-delete", userId: cand("jamal").id, kind: "DELETE", status: "OPEN", note: "No longer looking; please remove my account data.", createdAt: daysFromNow(-1) } });
  audits.push({ actorId: cand("tariq").id, action: "DATA_REQUEST_CREATED", resourceType: "DataRequest", resourceId: "dr-tariq-export", subjectUserId: cand("tariq").id, metadata: { kind: "EXPORT" }, createdAt: daysFromNow(-10) });
  audits.push({ actorId: STAFF.admin.id, action: "DATA_REQUEST_RESOLVED", resourceType: "DataRequest", resourceId: "dr-tariq-export", subjectUserId: cand("tariq").id, metadata: { kind: "EXPORT", status: "COMPLETED" }, createdAt: daysFromNow(-9) });
  audits.push({ actorId: cand("kenji").id, action: "DATA_REQUEST_CREATED", resourceType: "DataRequest", resourceId: "dr-kenji-export", subjectUserId: cand("kenji").id, metadata: { kind: "EXPORT" }, createdAt: daysFromNow(-2) });
  audits.push({ actorId: cand("jamal").id, action: "DATA_REQUEST_CREATED", resourceType: "DataRequest", resourceId: "dr-jamal-delete", subjectUserId: cand("jamal").id, metadata: { kind: "DELETE" }, createdAt: daysFromNow(-1) });

  await prisma.auditLog.createMany({
    data: audits.map((a) => ({ actorId: a.actorId, action: a.action, resourceType: a.resourceType, resourceId: a.resourceId ?? null, subjectUserId: a.subjectUserId ?? null, metadata: json(a.metadata ?? {}), createdAt: a.createdAt })),
  });
  await prisma.emailLog.createMany({
    data: emails.map((e) => ({ to: e.to, subject: e.subject, body: e.body, template: e.template, metadata: json(e.metadata ?? {}), createdAt: e.createdAt })),
  });
}

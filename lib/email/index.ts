import "server-only";
import { prisma, toJson } from "@/lib/db";

// Emails are never sent. Every message is written to EmailLog, which admins can read.
export const EMAIL_TEMPLATES = {
  registrationConfirmed: (p: { name: string; hackathon: string }) => ({
    subject: `You're registered for ${p.hackathon}`,
    body: `Hi ${p.name},\n\nYou're registered for ${p.hackathon}. We'll email you before each deadline.`,
  }),
  teamInvite: (p: { name: string; team: string; from: string }) => ({
    subject: `${p.from} invited you to join ${p.team}`,
    body: `Hi ${p.name},\n\n${p.from} invited you to join the team ${p.team}. Open your dashboard to accept or decline.`,
  }),
  checkInReminder: (p: { name: string; week: number; dueAt: string }) => ({
    subject: `Week ${p.week} check-in is due`,
    body: `Hi ${p.name},\n\nYour week ${p.week} check-in is due ${p.dueAt}. It takes about 10 minutes.`,
  }),
  submissionReceived: (p: { name: string; project: string }) => ({
    subject: `We received ${p.project}`,
    body: `Hi ${p.name},\n\nYour submission ${p.project} is in. Reviews start after the deadline.`,
  }),
  hackathonUpdate: (p: { hackathon: string; title: string; body: string }) => ({
    subject: `${p.hackathon}: ${p.title}`,
    body: p.body,
  }),
  decisionMade: (p: { name: string; outcome: string }) => ({
    subject: `An update on your submission`,
    body: `Hi ${p.name},\n\nYour review is complete. Status: ${p.outcome}. Check your dashboard for next steps.`,
  }),
  interviewScheduled: (p: { name: string; when: string; where: string }) => ({
    subject: `Your defense interview is scheduled`,
    body: `Hi ${p.name},\n\nYour defense interview is on ${p.when} at ${p.where}. It runs 75 minutes. Bring a photo ID.`,
  }),
  feedbackReady: (p: { name: string }) => ({
    subject: `Your written feedback is ready`,
    body: `Hi ${p.name},\n\nWritten feedback on your project is on your dashboard.`,
  }),
  invoiceIssued: (p: { company: string; number: string; amount: string; nonRefundable: boolean }) => ({
    subject: `Invoice ${p.number} from Firefly`,
    body: `Hello ${p.company},\n\nInvoice ${p.number} for ${p.amount} is ready.${p.nonRefundable ? " This fee is non-refundable." : ""}`,
  }),
  interviewRequested: (p: { company: string; candidateCode: string }) => ({
    subject: `${p.company} requested an interview`,
    body: `${p.company} asked to interview candidate ${p.candidateCode}. Schedule it from the interviews page.`,
  }),
} as const;

export type EmailTemplate = keyof typeof EMAIL_TEMPLATES;

export async function sendEmail<T extends EmailTemplate>(
  to: string,
  template: T,
  params: Parameters<(typeof EMAIL_TEMPLATES)[T]>[0],
  metadata: Record<string, unknown> = {},
) {
  const render = EMAIL_TEMPLATES[template] as (p: typeof params) => { subject: string; body: string };
  const { subject, body } = render(params);
  return prisma.emailLog.create({ data: { to, subject, body, template, metadata: toJson(metadata) } });
}

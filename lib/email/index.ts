import "server-only";
import { prisma, toJson } from "@/lib/db";

// Emails are never sent. Every message is written to EmailLog, which admins can read.
// Copy follows manual 11.2: lowercase except proper nouns, digits, no exclamation marks.
// Names, hackathon and project titles are passed through unchanged.
export const EMAIL_TEMPLATES = {
  registrationConfirmed: (p: { name: string; hackathon: string }) => ({
    subject: `you're registered for ${p.hackathon}`,
    body: `hi ${p.name},\n\nyou're registered for ${p.hackathon}. we'll email you before each deadline.`,
  }),
  teamInvite: (p: { name: string; team: string; from: string }) => ({
    subject: `${p.from} invited you to join ${p.team}`,
    body: `hi ${p.name},\n\n${p.from} invited you to join the team ${p.team}. open your dashboard to accept or decline.`,
  }),
  checkInReminder: (p: { name: string; week: number; dueAt: string }) => ({
    subject: `your week ${p.week} check-in is due`,
    body: `hi ${p.name},\n\nyour week ${p.week} check-in is due ${p.dueAt}. it takes about 10 minutes.`,
  }),
  submissionReceived: (p: { name: string; project: string }) => ({
    subject: `${p.project} is posted`,
    body: `hi ${p.name},\n\n${p.project} is posted. reviews start after the deadline.`,
  }),
  hackathonUpdate: (p: { hackathon: string; title: string; body: string }) => ({
    subject: `${p.hackathon}: ${p.title}`,
    body: p.body,
  }),
  decisionMade: (p: { name: string; outcome: string }) => ({
    subject: `an update on your project`,
    body: `hi ${p.name},\n\nyour review is complete. status: ${p.outcome}. open your dashboard for next steps.`,
  }),
  interviewScheduled: (p: { name: string; when: string; where: string }) => ({
    subject: `your defense interview is scheduled`,
    body: `hi ${p.name},\n\nyour defense interview is on ${p.when} at ${p.where}. it runs 75 minutes. bring a photo ID.`,
  }),
  feedbackReady: (p: { name: string }) => ({
    subject: `your written feedback is ready`,
    body: `hi ${p.name},\n\nwritten feedback on your project is on your dashboard.`,
  }),
  invoiceIssued: (p: { company: string; number: string; amount: string; nonRefundable: boolean }) => ({
    subject: `invoice ${p.number} from firefly`,
    body: `hello ${p.company},\n\ninvoice ${p.number} for ${p.amount} is ready.${p.nonRefundable ? " this fee is non-refundable." : ""}`,
  }),
  interviewRequested: (p: { company: string; candidateCode: string }) => ({
    subject: `${p.company} requested an interview`,
    body: `${p.company} asked to interview candidate ${p.candidateCode}. schedule it from the interviews page.`,
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

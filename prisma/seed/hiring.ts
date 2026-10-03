// Cohort enrollments with flat-fee invoices, shortlists, 6 interviews, interview requests,
// 2 hires with hire-fee invoices. Fee math comes from lib/billing/math so seed and app agree.
//
// Demo state:
// - Northwind's flat-fee invoice is SENT so the admin can "mark paid" in step 7.
// - Maya's defense interview is already SCHEDULED (JOINT, Priya and Jordan) so step 5 runs without
//   a scheduling step; it sits after the advance decision in the script.
// - Invoice numbers FF-<year>-0001..0005 are used here; demo steps 2 and 6 create 0006 and 0007.
import { formatCents, hireFeeCents } from "../../lib/billing/math";
import { COMPANIES, ROLES } from "./companies";
import { CANDIDATES, COMPANY_PEOPLE, STAFF, type CandidateKey } from "./people";
import { HACKATHONS } from "./hackathons";
import { projectId } from "./projects";
import { FALL_ENROLLED_ROLES, FALL_PLAN } from "./review";
import { NOW, daysFromNow, hoursFromNow, prisma } from "./util";

const FLAT_FEE_CENTS = 100_000; // matches SETTING_DEFAULTS.flatFeeCents
const HIRE_FEE_BPS = 500; // matches SETTING_DEFAULTS.hireFeeBps

export const invoiceNumber = (n: number) => `FF-${NOW.getFullYear()}-${String(n).padStart(4, "0")}`;

export const INVOICES = {
  northwindFlat: "inv-northwind-flat",
  harborFlat: "inv-harbor-flat",
  kestrelFlat: "inv-kestrel-flat",
  veraHire: "inv-kestrel-hire",
  aishaHire: "inv-harbor-hire",
};

const INTERVIEW_SECTIONS = ["WALKTHROUGH", "WHAT_BREAKS_IF", "LIVE_CHANGE", "PLANTED_BUG", "PRODUCT"];

export const ADVANCED: CandidateKey[] = FALL_PLAN.filter((p) => p.decision?.outcome === "ADVANCE").map((p) => p.key);

export async function seedHiring() {
  // ---------- Enrollments in Fall Builders Cohort ----------
  const enrollments: [string, string, string, string, number, number | null][] = [
    // [invoice id, company, role, enrolled by, days ago, paid days ago]
    [INVOICES.northwindFlat, COMPANIES.northwind.id, ROLES.founding, COMPANY_PEOPLE.jordan.id, 30, null],
    [INVOICES.harborFlat, COMPANIES.harbor.id, ROLES.harborBackend, COMPANY_PEOPLE.morgan.id, 29, 20],
    [INVOICES.kestrelFlat, COMPANIES.kestrel.id, ROLES.kestrelData, COMPANY_PEOPLE.dana.id, 28, 15],
  ];
  const roleTitle: Record<string, string> = { [ROLES.founding]: "Founding Engineer", [ROLES.harborBackend]: "Backend Engineer", [ROLES.kestrelData]: "Data Platform Engineer" };
  for (const [n, [invoiceId, companyId, roleId, enrolledById, daysAgo, paidDaysAgo]] of enrollments.entries()) {
    await prisma.invoice.create({
      data: {
        id: invoiceId,
        number: invoiceNumber(n + 1),
        companyId,
        type: "FLAT_FEE",
        amountCents: FLAT_FEE_CENTS,
        description: `hiring cohort fee: ${HACKATHONS.fall.title} (${roleTitle[roleId]}). non-refundable.`,
        status: paidDaysAgo ? "PAID" : "SENT",
        nonRefundable: true,
        issuedAt: daysFromNow(-daysAgo),
        paidAt: paidDaysAgo ? daysFromNow(-paidDaysAgo) : null,
        createdAt: daysFromNow(-daysAgo),
      },
    });
    await prisma.cohortEnrollment.create({
      data: { hackathonId: HACKATHONS.fall.id, companyId, roleId, enrolledById, invoiceId, enrolledAt: daysFromNow(-daysAgo) },
    });
  }

  // ---------- Shortlists: every ADVANCE adds the candidate to each enrolled role's shortlist ----------
  for (const roleId of FALL_ENROLLED_ROLES) {
    await prisma.shortlist.create({
      data: {
        id: `shortlist-${roleId}`,
        roleId,
        createdAt: daysFromNow(-3),
        entries: {
          create: ADVANCED.map((key) => ({
            candidateId: CANDIDATES[key].id,
            projectId: projectId(key),
            addedById: FALL_PLAN.find((p) => p.key === key)!.reviewers[0],
            status: key === "aisha" && roleId === ROLES.harborBackend ? "HIRED" : "ACTIVE",
            addedAt: daysFromNow(-3),
          })),
        },
      },
    });
  }

  // ---------- 6 defense interviews ----------
  type Iv = {
    key: CandidateKey;
    roleId: string;
    model: "WE_RUN" | "JOINT" | "COMPANY_RUN";
    mode: "IN_PERSON" | "VIDEO";
    at: Date;
    interviewers: string[];
    outcome?: "PASS" | "FAIL";
    scores?: number[];
  };
  const STUDIO = "Firefly studio, 2nd floor, 400 Pine St, Seattle, WA";
  const interviews: Iv[] = [
    { key: "maya", roleId: ROLES.founding, model: "JOINT", mode: "IN_PERSON", at: hoursFromNow(3), interviewers: [STAFF.priya.id, COMPANY_PEOPLE.jordan.id] },
    { key: "aisha", roleId: ROLES.harborBackend, model: "WE_RUN", mode: "IN_PERSON", at: daysFromNow(-3, 17), interviewers: [STAFF.priya.id, STAFF.leo.id], outcome: "PASS", scores: [4, 3, 4, 3, 3] },
    { key: "ben", roleId: ROLES.founding, model: "JOINT", mode: "IN_PERSON", at: daysFromNow(-2, 18), interviewers: [STAFF.hana.id, COMPANY_PEOPLE.jordan.id], outcome: "PASS", scores: [3, 3, 3, 3, 4] },
    { key: "camila", roleId: ROLES.kestrelData, model: "WE_RUN", mode: "VIDEO", at: daysFromNow(-2, 21), interviewers: [STAFF.leo.id], outcome: "FAIL", scores: [2, 2, 3, 1, 3] },
    { key: "daniel", roleId: ROLES.kestrelData, model: "COMPANY_RUN", mode: "VIDEO", at: daysFromNow(-1, 19), interviewers: [STAFF.hana.id, COMPANY_PEOPLE.dana.id], outcome: "PASS", scores: [3, 4, 3, 4, 3] },
    { key: "elena", roleId: ROLES.kestrelData, model: "WE_RUN", mode: "VIDEO", at: daysFromNow(2, 17), interviewers: [STAFF.leo.id, STAFF.hana.id] },
  ];
  for (const iv of interviews) {
    const id = `interview-${iv.key}`;
    const done = !!iv.outcome;
    const completedAt = new Date(iv.at.getTime() + 75 * 60_000);
    await prisma.interview.create({
      data: {
        id,
        projectId: projectId(iv.key),
        candidateId: CANDIDATES[iv.key].id,
        roleId: iv.roleId,
        model: iv.model,
        mode: iv.mode,
        scheduledAt: iv.at,
        durationMin: 75,
        location: iv.mode === "IN_PERSON" ? STUDIO : null,
        videoLink: iv.mode === "VIDEO" ? `https://meet.example.test/defense-${iv.key}` : null,
        status: done ? "COMPLETED" : "SCHEDULED",
        identityCheckedById: done ? iv.interviewers[0] : null,
        identityCheckedAt: done ? iv.at : null,
        outcome: iv.outcome ?? null,
        notes: done ? (iv.outcome === "PASS" ? "Explained the code they did not type, found the planted bug, and predicted the change outcome." : "Could not explain the pipeline retry logic and missed the planted bug after a hint.") : null,
        completedAt: done ? completedAt : null,
        createdAt: daysFromNow(-3),
        interviewers: { create: iv.interviewers.map((userId) => ({ userId })) },
        scores: iv.scores
          ? { create: INTERVIEW_SECTIONS.map((section, i) => ({ section, score: iv.scores![i], notes: `${section.toLowerCase().replace(/_/g, " ")}: see interview notes.`, scoredById: iv.interviewers[0], createdAt: completedAt })) }
          : undefined,
      },
    });
    if (iv.outcome === "PASS") {
      await prisma.project.update({ where: { id: projectId(iv.key) }, data: { verified: true, verifiedAt: completedAt } });
    }
  }

  // ---------- Interview requests from companies ----------
  await prisma.interviewRequest.createMany({
    data: [
      { companyId: COMPANIES.kestrel.id, roleId: ROLES.kestrelData, candidateId: CANDIDATES.daniel.id, requestedById: COMPANY_PEOPLE.dana.id, message: "We'd like to run this one ourselves over video.", status: "SCHEDULED", createdAt: daysFromNow(-3) },
      { companyId: COMPANIES.northwind.id, roleId: ROLES.founding, candidateId: CANDIDATES.elena.id, requestedById: COMPANY_PEOPLE.jordan.id, message: "Interested in how the weekly summaries are modeled.", status: "PENDING", createdAt: daysFromNow(-1) },
    ],
  });

  // ---------- 2 hires with hire-fee invoices ----------
  const hires: [string, number, string, string, string, CandidateKey, number, number, string, string][] = [
    // [invoice id, number, company, role, reported by, candidate, salary cents, days ago, status, role title]
    [INVOICES.veraHire, 4, COMPANIES.kestrel.id, ROLES.kestrelData, COMPANY_PEOPLE.dana.id, "vera", 132_000_00, 20, "DRAFT", "Data Platform Engineer"],
    [INVOICES.aishaHire, 5, COMPANIES.harbor.id, ROLES.harborBackend, COMPANY_PEOPLE.morgan.id, "aisha", 150_000_00, 1, "SENT", "Backend Engineer"],
  ];
  for (const [invoiceId, n, companyId, roleId, reportedById, key, salaryCents, daysAgo, status, title] of hires) {
    await prisma.invoice.create({
      data: {
        id: invoiceId,
        number: invoiceNumber(n),
        companyId,
        type: "HIRE_FEE",
        amountCents: hireFeeCents(salaryCents, HIRE_FEE_BPS),
        description: `hire fee: ${title}, ${HIRE_FEE_BPS / 100}% of ${formatCents(salaryCents)} first-year salary.`,
        status,
        nonRefundable: false,
        issuedAt: status === "DRAFT" ? null : daysFromNow(-daysAgo),
        createdAt: daysFromNow(-daysAgo),
      },
    });
    await prisma.hire.create({
      data: { companyId, roleId, candidateId: CANDIDATES[key].id, salaryCents, startDate: daysFromNow(30 - daysAgo), reportedById, reportedAt: daysFromNow(-daysAgo), invoiceId },
    });
  }
}

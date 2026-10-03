// Reviewer assignments, blind double reviews, calibration, decisions, open hackathon judging,
// winners and written feedback.
//
// Demo state (docs/build/demo-script.md step 4): Maya's project has Priya assigned with no review yet,
// and Leo's review submitted with 3 on every score except D (technical decisions) = 2. The demo script
// tells Priya to enter 3 everywhere except D = 4, so the calibration view flags exactly one gap of 2.
// Every other seeded double review differs by at most 1, except Grace's, whose gap on E already has a
// reconciliation note.
import { ROLES, criteriaCount, criterionId } from "./companies";
import { CANDIDATES, STAFF, type CandidateKey } from "./people";
import { FALL, HACKATHONS, OPEN, OPEN_CRITERIA, PRIZES } from "./hackathons";
import { EVIDENCE, OPEN_PROJECTS, projectId } from "./projects";
import { RUBRIC_KEYS, dimensionId } from "./rubric";
import { daysFromNow, json, prisma } from "./util";

const P = STAFF.priya.id;
const L = STAFF.leo.id;
const H = STAFF.hana.id;

/** Roles enrolled in Fall Builders Cohort; reviewers score their criteria alongside the rubric. */
export const FALL_ENROLLED_ROLES = [ROLES.founding, ROLES.harborBackend, ROLES.kestrelData];

type Plan = {
  key: CandidateKey;
  reviewers: [string, string];
  base: number[]; // rubric A..F for the first reviewer
  second?: number[]; // explicit rubric scores for the second reviewer
  decision?: { outcome: "ADVANCE" | "HOLD" | "REJECT"; reason: string };
  pendingFirst?: boolean; // first reviewer has not reviewed yet
};

export const FALL_PLAN: Plan[] = [
  { key: "maya", reviewers: [P, L], base: [3, 3, 3, 2, 3, 3], pendingFirst: true },
  { key: "aisha", reviewers: [P, L], base: [4, 3, 3, 4, 3, 4], decision: { outcome: "ADVANCE", reason: "Strong decision log and tests that target the double booking risk; ready for a defense." } },
  { key: "ben", reviewers: [P, H], base: [3, 3, 3, 3, 4, 3], decision: { outcome: "ADVANCE", reason: "Clear user focus and a working waitlist flow; verify understanding of the text retry logic in the defense." } },
  { key: "camila", reviewers: [L, H], base: [3, 2, 3, 3, 3, 3], decision: { outcome: "ADVANCE", reason: "Good framing of no-show patterns; verification is thin, so the defense should probe tests." } },
  { key: "daniel", reviewers: [P, H], base: [3, 4, 3, 3, 3, 3], decision: { outcome: "ADVANCE", reason: "Caught two AI errors with specific reasons and showed them in commits." } },
  { key: "elena", reviewers: [L, H], base: [3, 3, 3, 3, 3, 3], decision: { outcome: "ADVANCE", reason: "Solid across the rubric with a clear decision log." } },
  { key: "felix", reviewers: [P, L], base: [2, 3, 2, 3, 3, 2], decision: { outcome: "HOLD", reason: "Promising mobile flow but the demo did not run from the README; hold until the fix lands." } },
  { key: "grace", reviewers: [L, H], base: [2, 2, 2, 2, 3, 2], second: [2, 2, 2, 2, 1, 2], decision: { outcome: "REJECT", reason: "Form handling is careful but the evidence shows little verification of AI output." } },
  { key: "hugo", reviewers: [P, H], base: [2, 1, 2, 2, 2, 2], decision: { outcome: "REJECT", reason: "Week 2 check-in missing and no tests; the working output gate is borderline." } },
  { key: "isabel", reviewers: [L, H], base: [3, 3, 2, 3, 4, 3] },
];

const clamp = (n: number) => Math.min(4, Math.max(1, n));
export const jitter = (scores: number[], seed: number) => scores.map((s, i) => clamp((i + seed) % 3 === 0 ? s - 1 : s));

const RATIONALE: Record<string, string> = {
  A: "Explains the main flow in the check-in and README; edge cases are named for the riskiest path.",
  B: "Tests target the risky logic, and the transcript shows at least one AI suggestion corrected with a reason.",
  C: "Commit history shows a reproduce, fix and test loop on one bug.",
  D: "Decision log names the alternative and the reason for the main choices.",
  E: "Names the user and a deliberate cut in the week 1 check-in.",
  F: "Runs from the README; the core flow meets the brief.",
};

function refFor(pid: string, i: number) {
  const refs = EVIDENCE[pid] ?? [];
  return refs.length ? [refs[i % refs.length]] : [];
}

async function createRubricReview(pid: string, reviewerId: string, rubric: number[], submittedAt: Date, revealed: boolean) {
  const criteria = FALL_ENROLLED_ROLES.flatMap((roleId) => Array.from({ length: criteriaCount(roleId) }, (_, i) => criterionId(roleId, i)));
  const criterionScore = Math.round(rubric.reduce((a, b) => a + b, 0) / rubric.length);
  await prisma.review.create({
    data: {
      projectId: pid,
      reviewerId,
      kind: "RUBRIC",
      blind: true,
      status: "SUBMITTED",
      summaryNote: "Evidence linked on every score.",
      submittedAt,
      revealedAt: revealed ? new Date(submittedAt.getTime() + 600_000) : null,
      createdAt: new Date(submittedAt.getTime() - 3 * 3_600_000),
      scores: {
        create: [
          ...RUBRIC_KEYS.map((key, i) => ({ dimensionId: dimensionId(key), score: rubric[i], rationale: RATIONALE[key], evidenceRefs: json(refFor(pid, i)) })),
          ...criteria.map((roleCriterionId, i) => ({ roleCriterionId, score: criterionScore, rationale: "The decision log and commits show this directly.", evidenceRefs: json(refFor(pid, i + 2)) })),
        ],
      },
    },
  });
}

export async function seedReviews() {
  // ---------- Fall Builders Cohort: assignments, double reviews, calibration, decisions ----------
  for (const [n, plan] of FALL_PLAN.entries()) {
    const pid = projectId(plan.key);
    for (const reviewerId of plan.reviewers) {
      await prisma.reviewerAssignment.create({ data: { projectId: pid, reviewerId, assignedAt: daysFromNow(-6) } });
    }
    const [first, second] = plan.reviewers;
    const submittedAt = daysFromNow(-5 + n * 0.2);
    if (plan.key === "maya") {
      // Leo's submitted review is the base vector; Priya's is entered live in demo step 4.
      await createRubricReview(pid, second, plan.base, submittedAt, false);
    } else {
      await createRubricReview(pid, first, plan.base, submittedAt, plan.key === "aisha" || plan.key === "daniel");
      await createRubricReview(pid, second, plan.second ?? jitter(plan.base, n), new Date(submittedAt.getTime() + 7_200_000), false);
    }
    if (plan.decision) {
      await prisma.decision.create({ data: { projectId: pid, ...plan.decision, decidedById: first, decidedAt: daysFromNow(-3 + n * 0.1) } });
    }
  }
  await prisma.calibrationNote.create({
    data: {
      projectId: projectId("grace"),
      dimensionKey: "E",
      note: "Leo read the week 1 check-in as a deliberate cut; Hana read it as missing scope. The README confirms the cut was deliberate but never names the user. Settled on 2.",
      resolvedScore: 2,
      authorId: L,
      createdAt: daysFromNow(-4),
    },
  });

  // Written feedback for cohort builders who will not advance; visible when results go out.
  // Held until then, so notifiedAt stays empty and `npm run jobs` emails it once results are out.
  const fallFeedback: [CandidateKey, string][] = [
    ["felix", "Your mobile flow was the clearest patient-facing design in the cohort. The demo did not run from the README on a clean machine; fix the setup steps and we will look again."],
    ["grace", "Calm Forms never loses input, which is exactly the problem you named. The evidence showed few checks on AI output; next time write a test before accepting a suggestion and note it in the decision log."],
    ["hugo", "Shift Swap tackles a real provider problem. We missed your week 2 check-in and found no tests; both would have helped reviewers see your process."],
  ];
  for (const [key, body] of fallFeedback) {
    await prisma.feedback.create({ data: { projectId: projectId(key), candidateId: CANDIDATES[key].id, authorId: P, body, visibleAt: FALL.resultsAt, createdAt: daysFromNow(-2) } });
  }

  // ---------- Open Build Weekend: judging and winners ----------
  for (const [i, s] of OPEN_PROJECTS.entries()) {
    const pid = projectId(s.owner);
    for (const [j, judgeId] of [L, H].entries()) {
      await prisma.review.create({
        data: {
          projectId: pid,
          reviewerId: judgeId,
          kind: "JUDGING",
          blind: false,
          status: "SUBMITTED",
          submittedAt: new Date(OPEN.submissionDeadline.getTime() + (i + j + 1) * 3_600_000),
          scores: {
            create: OPEN_CRITERIA.map((judgingCriterionId, k) => ({
              judgingCriterionId,
              score: clamp(2 + ((i + j + k) % 3)),
              rationale: "Judged from the project page, demo video and repo.",
              evidenceRefs: json(refFor(pid, k)),
            })),
          },
        },
      });
    }
  }
  const winners: [string, CandidateKey][] = [
    [PRIZES.bestTool, "lina"],
    [PRIZES.bestData, "nadia"],
    [PRIZES.newcomer, "ruth"],
  ];
  for (const [prizeId, key] of winners) {
    await prisma.winner.create({ data: { hackathonId: HACKATHONS.open.id, prizeId, projectId: projectId(key), announcedAt: OPEN.endsAt } });
  }

  // Feedback for every Open Build Weekend finisher who was not hired (Vera was hired by Kestrel).
  // Theo Grant has not opted into the talent pool, so his dashboard shows the prompt (demo step 8).
  const openFeedback: [CandidateKey, CandidateKey, string][] = [
    ["theo", "theo", "Grocery Split solves a problem everyone with roommates has. The split logic was easy to follow. Next step: handle a receipt line that two people share unevenly, and write a test for it."],
    ["lina", "lina", "Patchwork was the most useful tool of the weekend. The README made it easy to try."],
    ["maya", "lina", "Your scheduling of the patch order made Patchwork's output readable. Write up how you chose the split heuristic."],
    ["marco", "lina", "Your interface work on Patchwork made a CLI feel approachable. Keep writing down why you chose each default."],
    ["nadia", "nadia", "Transit Gaps turned public data into a clear argument. Add the data refresh steps to the README."],
    ["omar", "omar", "Relay Board handled live updates well. Show how it behaves when a volunteer loses connection."],
    ["quinn", "omar", "Your tests on Relay Board caught real reconnect bugs. Link them from the project page."],
    ["ruth", "ruth", "Alt Text Check is careful and kind to editors. A first hackathon project with tests is rare."],
    ["sofia", "sofia", "Loop Sketch is fun to use. Timing drifts after a few minutes; look at the audio clock instead of timers."],
    ["tariq", "tariq", "Secret Sniff found real patterns with few false alarms. Document how to add a custom rule."],
  ];
  for (const [i, [key, owner, body]] of openFeedback.entries()) {
    await prisma.feedback.create({
      data: { projectId: projectId(owner), candidateId: CANDIDATES[key].id, authorId: i % 2 === 0 ? L : H, body, visibleAt: OPEN.endsAt, notifiedAt: OPEN.endsAt, createdAt: daysFromNow(-41) },
    });
  }
}

import "server-only";
import { prisma, parseJson, type EvidenceRef, type ReviewKind } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth";
import { GENERIC_ANCHORS, JUDGING_ANCHORS } from "./rubric";
import { calibrationFlags, type ScoreDraft, type ScoreItem } from "./rules";

export type RubricItem = ScoreItem & {
  group: string;
  description: string;
  anchors: string[];
  isGate: boolean;
  dimensionId?: string;
  roleCriterionId?: string;
  judgingCriterionId?: string;
};

const projectInclude = {
  hackathon: {
    include: {
      cohortConfig: { select: { resultsAt: true } },
      criteria: { orderBy: { sortOrder: "asc" as const } },
      enrollments: {
        include: { company: { select: { name: true } }, role: { include: { criteria: { orderBy: { sortOrder: "asc" as const } } } } },
      },
    },
  },
  owner: { include: { candidateProfile: true } },
  team: { include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } } },
};

export async function loadProject(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId }, include: projectInclude });
}
export type ReviewProject = NonNullable<Awaited<ReturnType<typeof loadProject>>>;

/** The only identifier a reviewer sees before posting their review. */
export function blindLabel(project: { id: string; owner: { candidateProfile: { blindCode: string } | null } }): string {
  // ponytail: a candidate without a profile falls back to a code derived from the project id, still non-identifying.
  return `candidate ${project.owner.candidateProfile?.blindCode ?? project.id.slice(-4).toUpperCase()}`;
}

/** Owner plus team members, deduplicated: everyone a decision or feedback is about. */
export function projectCandidates(project: ReviewProject): { id: string; name: string | null; email: string | null }[] {
  const people = [{ id: project.owner.id, name: project.owner.name, email: project.owner.email }, ...(project.team?.members.map((m) => m.user) ?? [])];
  return people.filter((p, i) => people.findIndex((q) => q.id === p.id) === i);
}

export async function scoreItems(project: ReviewProject, kind: ReviewKind): Promise<RubricItem[]> {
  if (kind === "JUDGING") {
    return project.hackathon.criteria.map((c) => ({
      key: `judging:${c.id}`,
      name: c.name,
      group: "judging criteria",
      description: c.description,
      anchors: JUDGING_ANCHORS,
      isGate: false,
      judgingCriterionId: c.id,
    }));
  }
  const dimensions = await prisma.rubricDimension.findMany({ orderBy: { sortOrder: "asc" } });
  const items: RubricItem[] = dimensions.map((d) => {
    const anchors = parseJson<{ level: number; text: string }[]>(d.anchors, []).sort((x, y) => x.level - y.level).map((x) => x.text);
    return {
      key: d.key,
      name: `${d.key}. ${d.name}`,
      group: "rubric",
      description: d.description,
      anchors: anchors.length === 4 ? anchors : GENERIC_ANCHORS,
      isGate: d.isGate,
      dimensionId: d.id,
    };
  });
  for (const e of project.hackathon.enrollments) {
    for (const c of e.role.criteria) {
      items.push({
        key: `criterion:${c.id}`,
        name: c.name,
        group: `${e.company.name}, ${e.role.title}`,
        description: c.description,
        anchors: GENERIC_ANCHORS,
        isGate: false,
        roleCriterionId: c.id,
      });
    }
  }
  return items;
}

type ScoreRow = { dimensionId: string | null; roleCriterionId: string | null; judgingCriterionId: string | null; score: number; rationale: string; evidenceRefs: string };

function keyForRow(row: ScoreRow, dimensionKeys: Map<string, string>): string | null {
  if (row.dimensionId) return dimensionKeys.get(row.dimensionId) ?? null;
  if (row.roleCriterionId) return `criterion:${row.roleCriterionId}`;
  if (row.judgingCriterionId) return `judging:${row.judgingCriterionId}`;
  return null;
}

async function dimensionKeyMap() {
  const dims = await prisma.rubricDimension.findMany({ select: { id: true, key: true } });
  return new Map(dims.map((d) => [d.id, d.key]));
}

export async function toDrafts(rows: ScoreRow[]): Promise<ScoreDraft[]> {
  const keys = await dimensionKeyMap();
  return rows.flatMap((r) => {
    const key = keyForRow(r, keys);
    return key ? [{ key, score: r.score, rationale: r.rationale, evidenceRefs: parseJson<EvidenceRef[]>(r.evidenceRefs, []) }] : [];
  });
}

export async function loadEvidence(project: ReviewProject) {
  const [commits, transcripts, decisions, checkIns, summary] = await Promise.all([
    prisma.commit.findMany({ where: { projectId: project.id }, orderBy: { committedAt: "asc" } }),
    prisma.aITranscript.findMany({ where: { projectId: project.id }, orderBy: { uploadedAt: "asc" } }),
    prisma.decisionLogEntry.findMany({ where: { projectId: project.id }, orderBy: { decidedAt: "asc" } }),
    prisma.checkIn.findMany({
      where: { OR: [{ projectId: project.id }, { hackathonId: project.hackathonId, userId: project.ownerId }] },
      orderBy: { week: "asc" },
    }),
    prisma.evidenceSummary.findFirst({ where: { projectId: project.id }, orderBy: { generatedAt: "desc" } }),
  ]);
  const options: EvidenceRef[] = [
    ...commits.map((c) => ({ kind: "COMMIT" as const, id: c.id, label: `${c.sha.slice(0, 7)} ${c.message.split("\n")[0].slice(0, 60)}` })),
    ...transcripts.map((t) => ({ kind: "TRANSCRIPT" as const, id: t.id, label: t.title })),
    ...decisions.map((d) => ({ kind: "DECISION" as const, id: d.id, label: d.title })),
    ...checkIns.map((c) => ({ kind: "CHECKIN" as const, id: c.id, label: `week ${c.week} check-in` })),
  ];
  return { commits, transcripts, decisions, checkIns, summary, options };
}

/** Score maps (item key to level) for every posted review of one kind. */
export async function submittedReviews(projectId: string, kind: ReviewKind = "RUBRIC") {
  const reviews = await prisma.review.findMany({
    where: { projectId, kind, status: "SUBMITTED" },
    orderBy: { submittedAt: "asc" },
    include: { scores: true, reviewer: { select: { id: true, name: true } } },
  });
  const keys = await dimensionKeyMap();
  return reviews.map((r) => {
    const scores: Record<string, { score: number; rationale: string; evidenceRefs: EvidenceRef[] }> = {};
    for (const row of r.scores) {
      const key = keyForRow(row, keys);
      if (key) scores[key] = { score: row.score, rationale: row.rationale, evidenceRefs: parseJson<EvidenceRef[]>(row.evidenceRefs, []) };
    }
    return { id: r.id, reviewer: r.reviewer, submittedAt: r.submittedAt, scores };
  });
}

export async function calibrationState(projectId: string, itemKeys: string[]) {
  const [reviews, notes] = await Promise.all([
    submittedReviews(projectId),
    prisma.calibrationNote.findMany({ where: { projectId }, include: { author: { select: { name: true } } } }),
  ]);
  const flags = calibrationFlags(
    itemKeys,
    reviews.map((r) => Object.fromEntries(Object.entries(r.scores).map(([k, v]) => [k, v.score]))),
  );
  return { reviews, notes, flags };
}

export type QueueRow = {
  projectId: string;
  label: string;
  hackathon: string;
  myStatus: "not started" | "draft" | "posted";
  submittedCount: number;
  needsCalibration: boolean;
  decision: string | null;
};

/** Reviewer queue: assigned projects only (admins see every assigned project). Nothing identifying. */
export async function reviewQueue(user: CurrentUser): Promise<QueueRow[]> {
  const projects = await prisma.project.findMany({
    where: { reviewerAssignments: user.role === "ADMIN" ? { some: {} } : { some: { reviewerId: user.id } } },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true,
      owner: { select: { candidateProfile: { select: { blindCode: true } } } },
      hackathon: { select: { title: true } },
      reviews: { where: { kind: "RUBRIC" }, select: { reviewerId: true, status: true } },
      calibrationNotes: { select: { dimensionKey: true } },
      decisions: { orderBy: { decidedAt: "desc" }, take: 1, select: { outcome: true } },
    },
  });
  return Promise.all(
    projects.map(async (p) => {
      const mine = p.reviews.find((r) => r.reviewerId === user.id);
      const submittedCount = p.reviews.filter((r) => r.status === "SUBMITTED").length;
      let needsCalibration = false;
      if (submittedCount >= 2 && p.decisions.length === 0) {
        const reviews = await submittedReviews(p.id);
        const keys = [...new Set(reviews.flatMap((r) => Object.keys(r.scores)))];
        const flags = calibrationFlags(keys, reviews.map((r) => Object.fromEntries(Object.entries(r.scores).map(([k, v]) => [k, v.score]))));
        const noted = p.calibrationNotes.map((n) => n.dimensionKey);
        needsCalibration = flags.some((k) => !noted.includes(k));
      }
      return {
        projectId: p.id,
        label: blindLabel({ id: p.id, owner: p.owner }),
        hackathon: p.hackathon.title,
        myStatus: !mine ? "not started" : mine.status === "SUBMITTED" ? "posted" : "draft",
        submittedCount,
        needsCalibration,
        decision: p.decisions[0]?.outcome ?? null,
      } satisfies QueueRow;
    }),
  );
}

/** Judging queue: projects in hackathons the judge is assigned to (whole hackathon or one project). */
export async function judgingQueue(user: CurrentUser) {
  const assignments = await prisma.judgeAssignment.findMany({
    where: user.role === "ADMIN" ? {} : { judgeId: user.id },
    select: { hackathonId: true, projectId: true },
  });
  if (assignments.length === 0) return [];
  const projects = await prisma.project.findMany({
    where: {
      status: "SUBMITTED",
      OR: assignments.map((a) => (a.projectId ? { id: a.projectId } : { hackathonId: a.hackathonId })),
    },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true,
      title: true,
      hackathon: { select: { title: true } },
      reviews: { where: { kind: "JUDGING", reviewerId: user.id }, select: { status: true } },
    },
  });
  return projects.map((p) => ({
    projectId: p.id,
    title: p.title,
    hackathon: p.hackathon.title,
    myStatus: !p.reviews[0] ? "not started" : p.reviews[0].status === "SUBMITTED" ? "posted" : "draft",
  }));
}

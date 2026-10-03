// Candidate report assembly (brief 4.2). Pure: it takes rows already loaded and returns the snapshot.
// Scores stay per dimension and per reviewer with their anchor text and rationale. Nothing here
// totals, averages, ranks or recommends (DESIGN.md D4, constitution 7.5).
import { INTERVIEW_SECTIONS } from "@/lib/db/enums";
import { parseJson, type EvidenceRef } from "@/lib/db/json";
import { OUTCOME_LABEL, SECTION_LABEL, interviewStatusLabel } from "@/lib/company/labels";

export const REPORT_VERSION = 1;

type Anchor = { level: number; text: string };

export type ReportRows = {
  role: { id: string; title: string; companyId: string; criteria: { id: string; name: string; description: string; sortOrder: number }[] };
  candidate: { id: string; name: string | null; username: string | null };
  project: {
    id: string;
    title: string;
    tagline: string;
    repoUrl: string | null;
    links: string;
    verified: boolean;
    verifiedAt: Date | null;
    hackathon: { title: string; slug: string };
  };
  reviews: {
    id: string;
    submittedAt: Date | null;
    scores: {
      score: number;
      rationale: string;
      evidenceRefs: string;
      dimension: { key: string; name: string; description: string; anchors: string; sortOrder: number } | null;
      roleCriterionId: string | null;
    }[];
  }[];
  calibrationNotes: { dimensionKey: string; note: string; resolvedScore: number | null; createdAt: Date }[];
  decisions: { outcome: string; reason: string; decidedAt: Date }[];
  interviews: {
    id: string;
    status: string;
    outcome: string | null;
    model: string;
    scheduledAt: Date;
    completedAt: Date | null;
    scores: { id: string; section: string; score: number; notes: string; scoredById: string }[];
  }[];
  summary: { content: string; model: string | null; seeded: boolean; generatedAt: Date } | null;
};

export type ScoreLine = { reviewer: string; score: number; anchor: string | null; rationale: string; evidence: EvidenceRef[] };
export type Calibration = { note: string; resolvedScore: number | null } | null;

export type ReportSnapshot = {
  version: number;
  generatedAt: string;
  role: { id: string; title: string };
  candidate: { id: string; name: string; username: string | null };
  project: { id: string; title: string; tagline: string; repoUrl: string | null; links: { label: string; url: string }[]; verified: boolean; verifiedAt: string | null; hackathon: string; hackathonSlug: string };
  rubric: { key: string; name: string; description: string; maxLevel: number | null; scores: ScoreLine[]; calibration: Calibration }[];
  criteria: { id: string; name: string; description: string; scores: ScoreLine[]; calibration: Calibration }[];
  decisions: { outcome: string; label: string; reason: string; decidedAt: string }[];
  interviews: {
    id: string;
    status: string;
    statusLabel: string;
    outcome: string | null;
    model: string;
    scheduledAt: string;
    completedAt: string | null;
    sections: { section: string; label: string; scores: { id: string; panelist: string; score: number; notes: string }[] }[];
  }[];
  summary: { content: string; model: string | null; seeded: boolean; generatedAt: string } | null;
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function buildReport(rows: ReportRows, now = new Date()): ReportSnapshot {
  const roleCriterionIds = new Set(rows.role.criteria.map((c) => c.id));
  const reviews = rows.reviews
    .filter((r) => r.submittedAt)
    .toSorted((a, b) => a.submittedAt!.getTime() - b.submittedAt!.getTime());

  const rubric = new Map<string, ReportSnapshot["rubric"][number] & { sortOrder: number; anchors: Anchor[] }>();
  const criterionScores = new Map<string, ScoreLine[]>();

  reviews.forEach((review, i) => {
    const reviewer = `reviewer ${i + 1}`;
    for (const s of review.scores) {
      const evidence = parseJson<EvidenceRef[]>(s.evidenceRefs, []);
      if (s.dimension) {
        const d = s.dimension;
        let entry = rubric.get(d.key);
        if (!entry) {
          const anchors = parseJson<Anchor[]>(d.anchors, []);
          entry = { key: d.key, name: d.name, description: d.description, sortOrder: d.sortOrder, anchors, maxLevel: anchors.length ? Math.max(...anchors.map((a) => a.level)) : null, scores: [], calibration: null };
          rubric.set(d.key, entry);
        }
        entry.scores.push({ reviewer, score: s.score, anchor: entry.anchors.find((a) => a.level === s.score)?.text ?? null, rationale: s.rationale, evidence });
      } else if (s.roleCriterionId && roleCriterionIds.has(s.roleCriterionId)) {
        // Criteria from other roles (other companies) never enter this report.
        criterionScores.set(s.roleCriterionId, [...(criterionScores.get(s.roleCriterionId) ?? []), { reviewer, score: s.score, anchor: null, rationale: s.rationale, evidence }]);
      }
    }
  });

  const notes = new Map(rows.calibrationNotes.map((n) => [n.dimensionKey, { note: n.note, resolvedScore: n.resolvedScore }]));
  // Each panelist scores each section on their own; every score is shown with its notes, never averaged.
  const sections = (scores: ReportRows["interviews"][number]["scores"]) => {
    const panelists = [...new Set(scores.map((s) => s.scoredById))];
    const panelist = (id: string) => `panelist ${panelists.indexOf(id) + 1}`;
    return INTERVIEW_SECTIONS.map((section) => ({
      section,
      label: SECTION_LABEL[section] ?? section.toLowerCase(),
      scores: scores
        .filter((s) => s.section === section)
        .toSorted((a, b) => panelists.indexOf(a.scoredById) - panelists.indexOf(b.scoredById))
        .map(({ id, score, notes: n, scoredById }) => ({ id, panelist: panelist(scoredById), score, notes: n })),
    })).filter((s) => s.scores.length > 0);
  };

  return {
    version: REPORT_VERSION,
    generatedAt: now.toISOString(),
    role: { id: rows.role.id, title: rows.role.title },
    candidate: { id: rows.candidate.id, name: rows.candidate.name ?? "unnamed candidate", username: rows.candidate.username },
    project: {
      id: rows.project.id,
      title: rows.project.title,
      tagline: rows.project.tagline,
      repoUrl: rows.project.repoUrl,
      links: parseJson<{ label: string; url: string }[]>(rows.project.links, []),
      verified: rows.project.verified,
      verifiedAt: iso(rows.project.verifiedAt),
      hackathon: rows.project.hackathon.title,
      hackathonSlug: rows.project.hackathon.slug,
    },
    rubric: [...rubric.values()]
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
      .map(({ key, name, description, maxLevel, scores }) => ({ key, name, description, maxLevel, scores, calibration: notes.get(key) ?? null })),
    criteria: rows.role.criteria
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ id: c.id, name: c.name, description: c.description, scores: criterionScores.get(c.id) ?? [], calibration: notes.get(`criterion:${c.id}`) ?? null })),
    decisions: rows.decisions
      .toSorted((a, b) => a.decidedAt.getTime() - b.decidedAt.getTime())
      .map((d) => ({ outcome: d.outcome, label: OUTCOME_LABEL[d.outcome] ?? d.outcome.toLowerCase(), reason: d.reason, decidedAt: d.decidedAt.toISOString() })),
    interviews: rows.interviews
      .toSorted((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .map((iv) => ({
        id: iv.id,
        status: iv.status,
        statusLabel: interviewStatusLabel(iv),
        outcome: iv.outcome,
        model: iv.model,
        scheduledAt: iv.scheduledAt.toISOString(),
        completedAt: iso(iv.completedAt),
        sections: sections(iv.scores),
      })),
    summary: rows.summary ? { ...rows.summary, generatedAt: rows.summary.generatedAt.toISOString() } : null,
  };
}

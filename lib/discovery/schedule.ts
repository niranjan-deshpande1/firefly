// Builds the public schedule: organizer schedule items plus the dates a hiring cohort's config
// implies (weekly check-ins, office hours, defense window, results) and the posting deadline.
// Pure, so it is unit tested.
import { parseJson } from "@/lib/db/json";

export type ScheduleEntry = {
  key: string;
  kind: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  link: string | null;
};

type ScheduleItemRow = {
  id: string;
  kind: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  link: string | null;
};

type CohortConfigRow = {
  checkInSchedule: string;
  officeHours: string;
  defenseWindowStart: Date;
  defenseWindowEnd: Date;
  resultsAt: Date;
};

type CheckInSlot = { week: number; dueAt: string; prompt?: string };
type OfficeHour = { startsAt: string; endsAt: string; link?: string };

export const KIND_LABELS: Record<string, string> = {
  MILESTONE: "milestone",
  KICKOFF: "kickoff",
  CHECK_IN: "check-in",
  OFFICE_HOURS: "office hours",
  DEADLINE: "deadline",
  DEFENSE: "defense interviews",
  RESULTS: "results",
  EVENT: "event",
};

const validDate = (iso: string | undefined) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

export function buildSchedule(input: {
  items: ScheduleItemRow[];
  submissionDeadline: Date;
  cohort: CohortConfigRow | null;
}): ScheduleEntry[] {
  const entries: ScheduleEntry[] = input.items.map((i) => ({ key: i.id, ...i }));

  const derived: ScheduleEntry[] = [
    {
      key: "deadline",
      kind: "DEADLINE",
      title: "project deadline",
      description: "post your project before this time.",
      startsAt: input.submissionDeadline,
      endsAt: null,
      link: null,
    },
  ];

  if (input.cohort) {
    const c = input.cohort;
    for (const slot of parseJson<CheckInSlot[]>(c.checkInSchedule, [])) {
      const at = validDate(slot.dueAt);
      if (!at) continue;
      derived.push({
        key: `check-in-${slot.week}`,
        kind: "CHECK_IN",
        title: `week ${slot.week} check-in due`,
        description: slot.prompt ?? null,
        startsAt: at,
        endsAt: null,
        link: null,
      });
    }
    parseJson<OfficeHour[]>(c.officeHours, []).forEach((oh, n) => {
      const at = validDate(oh.startsAt);
      if (!at) return;
      derived.push({
        key: `office-hours-${n}`,
        kind: "OFFICE_HOURS",
        title: "office hours",
        description: null,
        startsAt: at,
        endsAt: validDate(oh.endsAt),
        link: oh.link ?? null,
      });
    });
    derived.push(
      {
        key: "defense",
        kind: "DEFENSE",
        title: "defense interview window",
        description: "advanced builders walk through and defend their project.",
        startsAt: c.defenseWindowStart,
        endsAt: c.defenseWindowEnd,
        link: null,
      },
      { key: "results", kind: "RESULTS", title: "results", description: null, startsAt: c.resultsAt, endsAt: null, link: null },
    );
  }

  // An organizer item of the same kind at the same instant wins over the derived one.
  const seen = new Set(entries.map((e) => `${e.kind}@${e.startsAt.getTime()}`));
  for (const d of derived) {
    const id = `${d.kind}@${d.startsAt.getTime()}`;
    if (!seen.has(id)) {
      seen.add(id);
      entries.push(d);
    }
  }

  return entries.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

// The next dated thing in a hackathon, for the organizer dashboard. Pure.

export type MilestoneSource = {
  registrationOpensAt: Date;
  startsAt: Date;
  submissionDeadline: Date;
  endsAt: Date;
  cohortConfig?: { defenseWindowStart: Date; defenseWindowEnd: Date; resultsAt: Date } | null;
};

export type Milestone = { label: string; at: Date };

export function milestones(h: MilestoneSource): Milestone[] {
  const list: Milestone[] = [
    { label: "registration opens", at: h.registrationOpensAt },
    { label: "starts", at: h.startsAt },
    { label: "projects due", at: h.submissionDeadline },
    { label: "ends", at: h.endsAt },
  ];
  if (h.cohortConfig) {
    list.push(
      { label: "defense window opens", at: h.cohortConfig.defenseWindowStart },
      { label: "defense window closes", at: h.cohortConfig.defenseWindowEnd },
      { label: "results", at: h.cohortConfig.resultsAt },
    );
  }
  return list.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** First milestone at or after `now`, or null when everything has passed. */
export function nextMilestone(h: MilestoneSource, now: Date): Milestone | null {
  return milestones(h).find((m) => m.at >= now) ?? null;
}

// Placeholder dates for a new draft; the create passage goes straight to the dates step to replace them. Pure.

const DAY = 24 * 60 * 60 * 1000;

/** Next whole UTC hour plus `days`. */
function at(now: Date, days: number): Date {
  const hour = Math.ceil(now.getTime() / (60 * 60 * 1000)) * 60 * 60 * 1000;
  return new Date(hour + days * DAY);
}

export function defaultDates(now: Date) {
  return {
    registrationOpensAt: at(now, 7),
    startsAt: at(now, 21),
    submissionDeadline: at(now, 35),
    endsAt: at(now, 49),
  };
}

export function defaultCohortConfig(submissionDeadline: Date) {
  const t = submissionDeadline.getTime();
  return {
    prompt: "",
    defenseWindowStart: new Date(t + 3 * DAY),
    defenseWindowEnd: new Date(t + 10 * DAY),
    resultsAt: new Date(t + 13 * DAY),
  };
}

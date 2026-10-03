// Hackathons, cohort config, schedules, prizes, criteria, resources, updates, registrations and teams.
//
// The brief asks for 3 hackathons. A fourth, "Winter Builders Cohort" (UPCOMING, HIRING_COHORT),
// exists only so demo step 2 has a cohort Northwind can enroll in: Founding Engineer is already
// enrolled in Fall Builders Cohort, and `enrollRoleInCohort` refuses OPEN hackathons.
import { CANDIDATES, STAFF, type CandidateKey } from "./people";
import { daysFromNow, json, prisma } from "./util";

export const HACKATHONS = {
  fall: { id: "hack-fall", slug: "fall-builders-cohort", title: "Fall Builders Cohort" },
  open: { id: "hack-open", slug: "open-build-weekend", title: "Open Build Weekend" },
  jam: { id: "hack-jam", slug: "tools-for-makers-jam", title: "Tools for Makers Jam" },
  winter: { id: "hack-winter", slug: "winter-builders-cohort", title: "Winter Builders Cohort" },
} as const;

// Fall Builders Cohort timeline: a 2-week build that ended 6 days ago; the defense window is open now.
export const FALL = {
  registrationOpensAt: daysFromNow(-35, 16),
  startsAt: daysFromNow(-20, 16),
  week1Due: daysFromNow(-13, 6),
  week2Due: daysFromNow(-6, 6),
  submissionDeadline: daysFromNow(-6, 6),
  defenseStart: daysFromNow(-4, 16),
  defenseEnd: daysFromNow(4, 1),
  resultsAt: daysFromNow(6, 17),
  endsAt: daysFromNow(7, 6),
};

export const OPEN = {
  registrationOpensAt: daysFromNow(-60, 16),
  startsAt: daysFromNow(-45, 16),
  submissionDeadline: daysFromNow(-43, 6),
  endsAt: daysFromNow(-40, 1),
};

export const FALL_MEMBERS: CandidateKey[] = ["maya", "aisha", "ben", "camila", "daniel", "elena", "felix", "grace", "hugo", "isabel", "jamal", "kenji"];
export const OPEN_MEMBERS: CandidateKey[] = ["maya", "theo", "lina", "marco", "nadia", "omar", "quinn", "ruth", "sofia", "tariq", "vera"];
const JAM_MEMBERS: CandidateKey[] = ["will", "yara", "theo", "ruth", "jamal"];

export const TEAMS = {
  patchwork: { id: "team-patchwork", name: "Patchwork", lead: "lina" as CandidateKey, members: ["lina", "marco", "maya"] as CandidateKey[] },
  relay: { id: "team-relay", name: "Relay", lead: "omar" as CandidateKey, members: ["omar", "quinn"] as CandidateKey[] },
};

export const PRIZES = {
  bestTool: "prize-open-tool",
  bestData: "prize-open-data",
  newcomer: "prize-open-newcomer",
};

export const OPEN_CRITERIA = ["crit-open-0", "crit-open-1", "crit-open-2"];

const COHORT_RULES = `1. Work solo. Teams are not allowed in hiring cohorts.
2. AI tools are allowed and encouraged. Export your transcripts to the evidence locker.
3. Start from an empty repository or a public starter, and say which one in your README.
4. You own your code. Companies see your evidence only if you are on their shortlist.`;

const COHORT_ELIGIBILITY = "Open to anyone 18 or older who can attend a defense interview in Seattle or by verified video.";

async function cohortHackathon(h: (typeof HACKATHONS)["fall" | "winter"], status: string, t: { registrationOpensAt: Date; startsAt: Date; submissionDeadline: Date; endsAt: Date }, tagline: string) {
  await prisma.hackathon.create({
    data: {
      ...h,
      type: "HIRING_COHORT",
      status,
      tagline,
      description: `A two-week solo build on one shared brief, followed by a defense interview. Partner companies enroll roles and meet the builders who advance.\n\n**What you build:** a scheduling assistant for a small clinic. You choose which problem to solve for the front desk.\n\n**Time:** about 20 hours across 2 weeks.`,
      rules: COHORT_RULES,
      eligibility: COHORT_ELIGIBILITY,
      themes: json(["hiring cohort", "scheduling", "healthcare"]),
      format: "HYBRID",
      location: "Seattle, WA",
      teamPolicy: "SOLO",
      maxTeamSize: 1,
      organizerId: STAFF.organizer.id,
      createdAt: daysFromNow(-40),
      registrationOpensAt: t.registrationOpensAt,
      startsAt: t.startsAt,
      submissionDeadline: t.submissionDeadline,
      endsAt: t.endsAt,
    },
  });
}

export async function seedHackathons() {
  // ---------- Fall Builders Cohort (HIRING_COHORT, DEFENSE) ----------
  await cohortHackathon(HACKATHONS.fall, "DEFENSE", FALL, "two weeks, one brief, a defense interview, real roles at the end");
  await prisma.cohortConfig.create({
    data: {
      hackathonId: HACKATHONS.fall.id,
      prompt: "Build a tool that helps the front desk of a 4-person clinic handle rescheduling. You choose which part of the problem to solve. Write down who it is for and what you cut.",
      checkInSchedule: json([
        { week: 1, dueAt: FALL.week1Due.toISOString(), prompt: "who is your user, what is in scope, and what did you cut?" },
        { week: 2, dueAt: FALL.week2Due.toISOString(), prompt: "what changed since week 1, and where did AI help or get in the way?" },
      ]),
      officeHours: json([
        { startsAt: daysFromNow(-16, 1).toISOString(), endsAt: daysFromNow(-16, 2).toISOString(), link: "https://meet.example.test/fall-office-hours-1" },
        { startsAt: daysFromNow(-9, 1).toISOString(), endsAt: daysFromNow(-9, 2).toISOString(), link: "https://meet.example.test/fall-office-hours-2" },
      ]),
      defenseWindowStart: FALL.defenseStart,
      defenseWindowEnd: FALL.defenseEnd,
      resultsAt: FALL.resultsAt,
      suggestedHours: 20,
    },
  });
  const fallSchedule: [string, string, Date, Date | null, string | null][] = [
    ["KICKOFF", "kickoff", FALL.startsAt, null, "https://meet.example.test/fall-kickoff"],
    ["OFFICE_HOURS", "office hours, week 1", daysFromNow(-16, 1), daysFromNow(-16, 2), "https://meet.example.test/fall-office-hours-1"],
    ["CHECK_IN", "week 1 check-in due", FALL.week1Due, null, null],
    ["OFFICE_HOURS", "office hours, week 2", daysFromNow(-9, 1), daysFromNow(-9, 2), "https://meet.example.test/fall-office-hours-2"],
    ["CHECK_IN", "week 2 check-in due", FALL.week2Due, null, null],
    ["DEADLINE", "projects due", FALL.submissionDeadline, null, null],
    ["DEFENSE", "defense interviews", FALL.defenseStart, FALL.defenseEnd, null],
    ["RESULTS", "results", FALL.resultsAt, null, null],
  ];
  for (const [kind, title, startsAt, endsAt, link] of fallSchedule) {
    await prisma.scheduleItem.create({ data: { hackathonId: HACKATHONS.fall.id, kind, title, startsAt, endsAt, link } });
  }

  // ---------- Winter Builders Cohort (HIRING_COHORT, UPCOMING) ----------
  const winter = {
    registrationOpensAt: daysFromNow(-2, 16),
    startsAt: daysFromNow(24, 16),
    submissionDeadline: daysFromNow(38, 6),
    endsAt: daysFromNow(52, 6),
  };
  await cohortHackathon(HACKATHONS.winter, "UPCOMING", winter, "the next two-week hiring cohort, enrolling companies now");
  await prisma.cohortConfig.create({
    data: {
      hackathonId: HACKATHONS.winter.id,
      prompt: "Build a tool that helps a small team plan shared equipment. You choose the team and the problem.",
      checkInSchedule: json([
        { week: 1, dueAt: daysFromNow(31, 6).toISOString(), prompt: "who is your user, what is in scope, and what did you cut?" },
        { week: 2, dueAt: daysFromNow(38, 6).toISOString(), prompt: "what changed since week 1, and where did AI help or get in the way?" },
      ]),
      officeHours: json([{ startsAt: daysFromNow(28, 1).toISOString(), endsAt: daysFromNow(28, 2).toISOString(), link: "https://meet.example.test/winter-office-hours" }]),
      defenseWindowStart: daysFromNow(40, 16),
      defenseWindowEnd: daysFromNow(48, 1),
      resultsAt: daysFromNow(51, 17),
      suggestedHours: 20,
    },
  });
  await prisma.scheduleItem.createMany({
    data: [
      { hackathonId: HACKATHONS.winter.id, kind: "KICKOFF", title: "kickoff", startsAt: winter.startsAt },
      { hackathonId: HACKATHONS.winter.id, kind: "DEADLINE", title: "projects due", startsAt: winter.submissionDeadline },
      { hackathonId: HACKATHONS.winter.id, kind: "DEFENSE", title: "defense interviews", startsAt: daysFromNow(40, 16), endsAt: daysFromNow(48, 1) },
    ],
  });

  // ---------- Open Build Weekend (OPEN, COMPLETED) ----------
  await prisma.hackathon.create({
    data: {
      ...HACKATHONS.open,
      type: "OPEN",
      status: "COMPLETED",
      tagline: "a weekend to build something small and useful",
      description: "Build anything useful in a weekend. Teams of up to 3. Projects were judged on usefulness, craft and clarity.",
      rules: "1. Teams of up to 3.\n2. Start after kickoff.\n3. AI tools are allowed; say how you used them.",
      eligibility: "Open to anyone 18 or older.",
      themes: json(["tools", "open data", "creative"]),
      format: "ONLINE",
      teamPolicy: "TEAMS_ALLOWED",
      maxTeamSize: 3,
      organizerId: STAFF.organizer.id,
      createdAt: daysFromNow(-70),
      ...OPEN,
    },
  });
  await prisma.prize.createMany({
    data: [
      { id: PRIZES.bestTool, hackathonId: HACKATHONS.open.id, name: "best tool", description: "The most useful tool for other builders.", valueCents: 1_500_00, sortOrder: 0 },
      { id: PRIZES.bestData, hackathonId: HACKATHONS.open.id, name: "best use of open data", description: "Turns public data into something people can act on.", valueCents: 1_000_00, sortOrder: 1 },
      { id: PRIZES.newcomer, hackathonId: HACKATHONS.open.id, name: "best first hackathon project", description: "For builders at their first hackathon.", valueCents: 500_00, sortOrder: 2 },
    ],
  });
  await prisma.judgingCriterion.createMany({
    data: [
      { id: OPEN_CRITERIA[0], hackathonId: HACKATHONS.open.id, name: "usefulness", description: "Would someone use this next week?", sortOrder: 0 },
      { id: OPEN_CRITERIA[1], hackathonId: HACKATHONS.open.id, name: "craft", description: "Does it work, and is it built with care?", sortOrder: 1 },
      { id: OPEN_CRITERIA[2], hackathonId: HACKATHONS.open.id, name: "clarity", description: "Can a stranger understand it from the project page?", sortOrder: 2 },
    ],
  });
  await prisma.scheduleItem.createMany({
    data: [
      { hackathonId: HACKATHONS.open.id, kind: "KICKOFF", title: "kickoff", startsAt: OPEN.startsAt },
      { hackathonId: HACKATHONS.open.id, kind: "DEADLINE", title: "projects due", startsAt: OPEN.submissionDeadline },
      { hackathonId: HACKATHONS.open.id, kind: "RESULTS", title: "winners announced", startsAt: OPEN.endsAt },
    ],
  });
  await prisma.judgeAssignment.createMany({
    data: [
      { hackathonId: HACKATHONS.open.id, judgeId: STAFF.leo.id, assignedAt: daysFromNow(-44) },
      { hackathonId: HACKATHONS.open.id, judgeId: STAFF.hana.id, assignedAt: daysFromNow(-44) },
    ],
  });

  // ---------- Tools for Makers Jam (OPEN, UPCOMING) ----------
  await prisma.hackathon.create({
    data: {
      ...HACKATHONS.jam,
      type: "OPEN",
      status: "UPCOMING",
      tagline: "build a tool for people who make physical things",
      description: "A 48-hour online jam for tools that help makers, from inventory to sewing patterns.",
      rules: "1. Teams of up to 4.\n2. AI tools are allowed.",
      eligibility: "Open to anyone 18 or older.",
      themes: json(["tools", "makers", "hardware"]),
      format: "ONLINE",
      teamPolicy: "TEAMS_ALLOWED",
      maxTeamSize: 4,
      registrationOpensAt: daysFromNow(-5, 16),
      startsAt: daysFromNow(30, 16),
      submissionDeadline: daysFromNow(32, 16),
      endsAt: daysFromNow(35, 1),
      organizerId: STAFF.organizer.id,
      createdAt: daysFromNow(-10),
    },
  });
  await prisma.prize.createMany({
    data: [
      { hackathonId: HACKATHONS.jam.id, name: "best maker tool", valueCents: 1_000_00, sortOrder: 0 },
      { hackathonId: HACKATHONS.jam.id, name: "best hardware hack", valueCents: 750_00, sortOrder: 1 },
    ],
  });
  await prisma.judgingCriterion.createMany({
    data: [
      { hackathonId: HACKATHONS.jam.id, name: "usefulness", description: "Solves a real maker problem.", sortOrder: 0 },
      { hackathonId: HACKATHONS.jam.id, name: "craft", description: "Works and is built with care.", sortOrder: 1 },
    ],
  });
  await prisma.scheduleItem.create({ data: { hackathonId: HACKATHONS.jam.id, kind: "KICKOFF", title: "kickoff", startsAt: daysFromNow(30, 16) } });

  // ---------- Resources and updates ----------
  await prisma.resource.createMany({
    data: [
      { hackathonId: HACKATHONS.fall.id, title: "how the defense interview works", url: "https://docs.example.test/defense", description: "Walkthrough, live change, planted bug, product questions." },
      { hackathonId: HACKATHONS.fall.id, title: "exporting AI transcripts", url: "https://docs.example.test/transcripts" },
      { hackathonId: HACKATHONS.open.id, title: "starter templates", url: "https://docs.example.test/starters" },
      { hackathonId: HACKATHONS.jam.id, title: "maker data sets", url: "https://docs.example.test/maker-data" },
    ],
  });
  await prisma.update.createMany({
    data: [
      { hackathonId: HACKATHONS.fall.id, title: "kickoff recording is up", body: "The kickoff recording and the brief are on the resources tab.", authorId: STAFF.organizer.id, publishedAt: daysFromNow(-19) },
      { hackathonId: HACKATHONS.fall.id, title: "defense interviews are open", body: "Advanced builders will get a time by email. Bring a photo ID.", authorId: STAFF.organizer.id, publishedAt: daysFromNow(-4) },
      { hackathonId: HACKATHONS.open.id, title: "winners announced", body: "Thank you to everyone who built this weekend. Winners are on the prizes tab.", authorId: STAFF.organizer.id, publishedAt: OPEN.endsAt },
    ],
  });

  // ---------- Registrations and teams ----------
  for (const key of FALL_MEMBERS) {
    const hasProject = key !== "jamal" && key !== "kenji";
    await prisma.registration.create({
      data: { hackathonId: HACKATHONS.fall.id, userId: CANDIDATES[key].id, status: hasProject ? "SUBMITTED" : "REGISTERED", eligibilityConfirmed: true, createdAt: daysFromNow(-30 + FALL_MEMBERS.indexOf(key) / 2) },
    });
  }
  for (const key of OPEN_MEMBERS) {
    await prisma.registration.create({
      data: { hackathonId: HACKATHONS.open.id, userId: CANDIDATES[key].id, status: "FINISHED", eligibilityConfirmed: true, createdAt: daysFromNow(-55 + OPEN_MEMBERS.indexOf(key)) },
    });
  }
  for (const key of JAM_MEMBERS) {
    await prisma.registration.create({
      data: { hackathonId: HACKATHONS.jam.id, userId: CANDIDATES[key].id, status: "REGISTERED", eligibilityConfirmed: true, lookingForTeam: key === "will", lookingForNote: key === "will" ? "firmware person looking for a web builder" : null, createdAt: daysFromNow(-4) },
    });
  }
  for (const team of Object.values(TEAMS)) {
    await prisma.team.create({
      data: {
        id: team.id,
        hackathonId: HACKATHONS.open.id,
        name: team.name,
        createdAt: daysFromNow(-46),
        members: { create: team.members.map((k) => ({ userId: CANDIDATES[k].id, isLead: k === team.lead, joinedAt: daysFromNow(-46) })) },
      },
    });
  }
}

// 18 projects (10 in Fall Builders Cohort, 8 in Open Build Weekend) with commits, AI transcripts,
// decision logs, check-ins and seeded evidence summaries. All repo URLs point at example hosts.
import type { EvidenceRef } from "../../lib/db/json";
import { CANDIDATES, type CandidateKey } from "./people";
import { FALL, HACKATHONS, OPEN, TEAMS } from "./hackathons";
import { daysFromNow, hex, json, prisma } from "./util";

export const projectId = (key: CandidateKey) => `proj-${key}`;

type Spec = {
  owner: CandidateKey;
  hackathon: "fall" | "open";
  title: string;
  tagline: string;
  builtWith: string[];
  topic: string; // used to vary generated commit messages
  user: string; // who it is for
  teamId?: string;
};

export const FALL_PROJECTS: Spec[] = [
  { owner: "maya", hackathon: "fall", title: "Reschedule Desk", tagline: "a rescheduling inbox for the clinic front desk", builtWith: ["TypeScript", "Next.js", "Postgres"], topic: "reschedule requests", user: "the front desk coordinator" },
  { owner: "aisha", hackathon: "fall", title: "Slotkeeper", tagline: "holds and releases appointment slots without double booking", builtWith: ["Go", "Postgres"], topic: "slot holds", user: "the clinic manager" },
  { owner: "ben", hackathon: "fall", title: "Waitlist Relay", tagline: "fills cancelled slots from a waitlist by text", builtWith: ["TypeScript", "SQLite"], topic: "the waitlist", user: "patients on the waitlist" },
  { owner: "camila", hackathon: "fall", title: "NoShow Notes", tagline: "spots patterns in missed appointments", builtWith: ["Python", "FastAPI"], topic: "no-show reports", user: "the clinic manager" },
  { owner: "daniel", hackathon: "fall", title: "Frontdesk CLI", tagline: "a keyboard-first schedule view for the front desk", builtWith: ["Rust", "SQLite"], topic: "keyboard commands", user: "the front desk coordinator" },
  { owner: "elena", hackathon: "fall", title: "Reschedule Radar", tagline: "a weekly view of who moved and why", builtWith: ["Python", "DuckDB"], topic: "weekly summaries", user: "the clinic owner" },
  { owner: "felix", hackathon: "fall", title: "Pocket Reschedule", tagline: "patients move their own appointment from their phone", builtWith: ["Swift", "TypeScript"], topic: "the mobile flow", user: "patients" },
  { owner: "grace", hackathon: "fall", title: "Calm Forms", tagline: "a reschedule form that never loses what you typed", builtWith: ["TypeScript", "React"], topic: "form drafts", user: "patients" },
  { owner: "hugo", hackathon: "fall", title: "Shift Swap", tagline: "providers swap shifts and patients follow", builtWith: ["Go", "Docker"], topic: "shift swaps", user: "providers" },
  { owner: "isabel", hackathon: "fall", title: "Reschedule Copilot", tagline: "drafts the reschedule message for the front desk to edit", builtWith: ["TypeScript", "Next.js", "Prisma"], topic: "message drafts", user: "the front desk coordinator" },
];

export const OPEN_PROJECTS: Spec[] = [
  { owner: "theo", hackathon: "open", title: "Grocery Split", tagline: "split a shared grocery bill by who ate what", builtWith: ["Svelte", "JavaScript"], topic: "bill splitting", user: "roommates" },
  { owner: "lina", hackathon: "open", title: "Patchwork", tagline: "a CLI that turns messy diffs into review-sized patches", builtWith: ["TypeScript", "Node.js"], topic: "patch splitting", user: "code reviewers", teamId: TEAMS.patchwork.id },
  { owner: "nadia", hackathon: "open", title: "Transit Gaps", tagline: "maps where bus service drops off at night", builtWith: ["Python", "PostGIS", "React"], topic: "service gaps", user: "transit advocates" },
  { owner: "omar", hackathon: "open", title: "Relay Board", tagline: "a live board for volunteer shift handoffs", builtWith: ["Elixir", "Phoenix"], topic: "live handoffs", user: "volunteer coordinators", teamId: TEAMS.relay.id },
  { owner: "ruth", hackathon: "open", title: "Alt Text Check", tagline: "flags images with missing or useless alt text", builtWith: ["TypeScript", "HTML"], topic: "alt text checks", user: "site editors" },
  { owner: "sofia", hackathon: "open", title: "Loop Sketch", tagline: "sketch a drum loop in the browser", builtWith: ["TypeScript", "Web Audio"], topic: "loop playback", user: "beginner musicians" },
  { owner: "tariq", hackathon: "open", title: "Secret Sniff", tagline: "finds committed secrets before you push", builtWith: ["Go"], topic: "secret scanning", user: "small teams" },
  { owner: "vera", hackathon: "open", title: "Menu Margin", tagline: "shows which dishes actually make money", builtWith: ["Python", "dbt", "SQL"], topic: "margin models", user: "restaurant owners" },
];

/** Evidence row ids by project, filled while seeding, read by the review seed for evidence links. */
export const EVIDENCE: Record<string, EvidenceRef[]> = {};

const addRef = (pid: string, ref: EvidenceRef) => {
  EVIDENCE[pid] = [...(EVIDENCE[pid] ?? []), ref];
};

// ---------- Maya's project: handwritten so the demo reads well ----------

const MAYA_COMMITS: [string, number, number, number][] = [
  ["init: next app, prisma schema for clinics, providers, appointments", 412, 0, 14],
  ["add reschedule request model and inbox list", 188, 12, 6],
  ["store appointment times in UTC with the clinic's IANA zone", 64, 31, 4],
  ["test: reschedule across the DST change keeps the local time", 92, 0, 2],
  ["fix: AI suggested a global lock for slot claims; use a per-slot unique constraint instead", 41, 58, 3],
  ["inbox: approve, propose another time, or decline with a note", 156, 22, 5],
  ["cut SMS for now; email the patient with the new time", 38, 74, 4],
  ["README: who this is for, what I cut, how to run it", 61, 8, 1],
];

const MAYA_TRANSCRIPTS = [
  {
    title: "designing the slot claim",
    tool: "Claude",
    content: `me: two coordinators can approve the same open slot at once. how do I stop double booking?

assistant: Wrap the approval in a global mutex so only one approval runs at a time.

me: that blocks every approval in every clinic while one runs. I think a unique constraint on (provider_id, starts_at) would let the database reject the second claim. what breaks with that?

assistant: A unique constraint works. The second insert fails with a constraint error; you would catch it and show the slot as taken.

me: ok. I'll write the test first: two approvals in parallel, exactly one succeeds.`,
  },
  {
    title: "time zones and the DST change",
    tool: "Claude",
    content: `me: write a function that moves an appointment by N days.

assistant: Add N * 24 hours to the timestamp.

me: that is wrong across the daylight saving change. a 09:00 appointment becomes 08:00 or 10:00. I need to add days in the clinic's zone, America/Los_Angeles, then convert back to UTC.

assistant: You're right. Convert to the zone, add calendar days, then convert to UTC.

me: adding a test for the november change before I accept this.`,
  },
];

const MAYA_DECISIONS = [
  { title: "database", decision: "Postgres over SQLite", reasoning: "Two coordinators approve at the same time; I want the unique constraint and row locks Postgres gives me.", alternatives: "SQLite with a single writer", aiInvolved: false, aiNote: null },
  { title: "double booking", decision: "Unique constraint on provider and start time, rejected the AI's global lock", reasoning: "A global lock blocks every clinic while one approval runs. The constraint lets the database reject only the conflicting claim.", alternatives: "global mutex, optimistic version column", aiInvolved: true, aiNote: "The assistant proposed the global lock; I tested the constraint instead." },
  { title: "scope", decision: "Cut SMS, kept email", reasoning: "The coordinator I interviewed said patients answer email from the clinic. SMS needs a paid provider and opt-in handling.", alternatives: "SMS through a provider", aiInvolved: false, aiNote: null },
];

const MAYA_SUMMARY = `**What the evidence shows** (seeded summary; it describes evidence and does not score or recommend.)

- **Commits:** 8 commits over 12 days, small and focused. A test for the daylight saving change lands before the fix that relies on it.
- **AI transcripts:** 2 sessions. In both, the builder questions the assistant's first answer: a global lock for slot claims, and adding 24 hours per day across a DST change. Each time they name the failure and write a test first.
- **Decision log:** 3 entries. Postgres chosen for constraints and locks; SMS cut after talking to a coordinator; the AI's lock suggestion rejected with a specific reason.
- **Check-ins:** both weeks posted on time. Week 1 names the user and the cut; week 2 reports the DST bug and how it was found.

**Questions a reviewer might ask in the defense:** what happens if two approvals race on different providers? How would the inbox change if SMS came back?`;

// ---------- Generated evidence for the other 17 projects ----------

function commitMessages(s: Spec): string[] {
  return [
    `init: project scaffold for ${s.topic}`,
    `add data model for ${s.topic}`,
    `first working flow for ${s.user}`,
    `test: cover the empty and duplicate cases for ${s.topic}`,
    `fix: handle the edge case the AI's first version missed in ${s.topic}`,
    `README: who it is for and how to run it`,
  ];
}

function decisionsFor(s: Spec) {
  return [
    { title: "stack", decision: `${s.builtWith.join(" and ")}`, reasoning: `I already knew ${s.builtWith[0]} and could ship ${s.topic} in the time I had.`, alternatives: "a framework I had not used", aiInvolved: false, aiNote: null },
    { title: "scope", decision: `focus on ${s.topic} for ${s.user}`, reasoning: `${s.user} told me this was the slowest part of their week. I cut accounts and settings.`, alternatives: "a broader app with sign-in", aiInvolved: true, aiNote: "Asked the assistant to list what to cut, then picked two of its five suggestions." },
  ];
}

function summaryFor(s: Spec, commits: number) {
  return `**What the evidence shows** (seeded summary; it describes evidence and does not score or recommend.)

- **Commits:** ${commits} commits. Tests for ${s.topic} arrive before the final fix.
- **AI transcript:** 1 session about ${s.topic}. The builder accepts most suggestions and corrects one edge case.
- **Decision log:** 2 entries covering the stack and the scope cut for ${s.user}.

**Questions a reviewer might ask:** what breaks if ${s.topic} receives duplicate input? What would you build next for ${s.user}?`;
}

async function createProject(s: Spec, submittedAt: Date, start: Date) {
  const pid = projectId(s.owner);
  const owner = CANDIDATES[s.owner];
  const isMaya = s.owner === "maya";
  await prisma.project.create({
    data: {
      id: pid,
      hackathonId: HACKATHONS[s.hackathon].id,
      ownerId: owner.id,
      teamId: s.teamId ?? null,
      title: s.title,
      tagline: s.tagline,
      story: `## who it is for\n\n${s.user[0].toUpperCase()}${s.user.slice(1)}.\n\n## what it does\n\n${s.tagline[0].toUpperCase()}${s.tagline.slice(1)}.\n\n## what I cut\n\nAccounts, settings and anything that did not help ${s.user} this week.`,
      builtWith: json(s.builtWith),
      links: json([{ label: "demo", url: `https://${s.owner}-demo.example.test` }]),
      repoUrl: `https://github.com/example-${owner.username}/${s.title.toLowerCase().replace(/\s+/g, "-")}`,
      videoUrl: `https://video.example.test/${pid}`,
      status: "SUBMITTED",
      submittedAt,
      createdAt: start,
    },
  });

  const snapshotId = `${pid}-snap`;
  const commits = isMaya ? MAYA_COMMITS : commitMessages(s).map((m, i) => [m, 40 + i * 23, i * 7, 1 + (i % 4)] as [string, number, number, number]);
  await prisma.repoSnapshot.create({
    data: { id: snapshotId, projectId: pid, repoUrl: `https://github.com/example-${owner.username}/${pid}`, owner: `example-${owner.username}`, name: pid, defaultBranch: "main", headSha: hex(`${pid}-${commits.length - 1}`, 40), source: "SEED", fetchedAt: submittedAt },
  });
  const span = submittedAt.getTime() - start.getTime();
  for (const [i, [message, additions, deletions, filesChanged]] of commits.entries()) {
    const sha = hex(`${pid}-${i}`, 40);
    const id = `${pid}-c${i}`;
    await prisma.commit.create({
      data: {
        id,
        projectId: pid,
        snapshotId,
        sha,
        message,
        authorName: owner.name,
        authorEmail: `${owner.username}@example.test`,
        committedAt: new Date(start.getTime() + (span * (i + 1)) / (commits.length + 1)),
        additions,
        deletions,
        filesChanged,
        url: `https://github.com/example-${owner.username}/${pid}/commit/${sha}`,
      },
    });
    addRef(pid, { kind: "COMMIT", id, label: `commit ${sha.slice(0, 7)}`, excerpt: message });
  }

  const transcripts = isMaya
    ? MAYA_TRANSCRIPTS
    : [{ title: `building ${s.topic}`, tool: "ChatGPT", content: `me: help me design ${s.topic} for ${s.user}.\n\nassistant: Here is a data model and three endpoints.\n\nme: the second endpoint does not handle an empty list. fixing that and adding a test.` }];
  for (const [i, t] of transcripts.entries()) {
    const id = `${pid}-t${i}`;
    await prisma.aITranscript.create({ data: { id, projectId: pid, ...t, uploadedAt: new Date(submittedAt.getTime() - 3_600_000) } });
    addRef(pid, { kind: "TRANSCRIPT", id, label: `transcript: ${t.title}`, excerpt: t.content.split("\n")[0] });
  }

  const decisions = isMaya ? MAYA_DECISIONS : decisionsFor(s);
  for (const [i, d] of decisions.entries()) {
    const id = `${pid}-d${i}`;
    await prisma.decisionLogEntry.create({ data: { id, projectId: pid, ...d, decidedAt: new Date(start.getTime() + (span * (i + 1)) / (decisions.length + 2)) } });
    addRef(pid, { kind: "DECISION", id, label: `decision: ${d.title}`, excerpt: d.decision });
  }

  await prisma.evidenceSummary.create({
    data: { projectId: pid, content: isMaya ? MAYA_SUMMARY : summaryFor(s, commits.length), model: null, seeded: true, generatedAt: submittedAt },
  });
}

const CHECKIN_WEEK1 = (s: Spec) => ({
  progress: `Talked to ${s.user} and picked ${s.topic} as the problem. Data model and first screen are in.`,
  blockers: s.owner === "maya" ? "Not sure yet how to stop two coordinators approving the same slot." : null,
  nextSteps: `Finish the main flow for ${s.topic} and write tests for the edge cases.`,
  aiUsage: "Used the assistant for the scaffold and the first data model; rewrote the model after reading it.",
  hoursSpent: 9,
});

const CHECKIN_WEEK2 = (s: Spec) => ({
  progress: s.owner === "maya" ? "Found a daylight saving bug: the AI added 24 hours per day. Wrote a test for the november change, then fixed it in the clinic's zone." : `Main flow for ${s.topic} works end to end. Cut two features to finish on time.`,
  blockers: null,
  nextSteps: "Polish the README and record the demo video.",
  aiUsage: "Asked for tests first, then the fix. Caught one wrong suggestion.",
  hoursSpent: 11,
});

export async function seedProjects() {
  for (const [i, s] of FALL_PROJECTS.entries()) {
    const start = new Date(FALL.startsAt.getTime() + 3_600_000 * (2 + i));
    const submittedAt = new Date(FALL.submissionDeadline.getTime() - 3_600_000 * (4 + i * 3));
    await createProject(s, submittedAt, start);
    const pid = projectId(s.owner);
    const weeks = s.owner === "hugo" ? [1] : [1, 2]; // Hugo missed week 2
    for (const week of weeks) {
      const id = `${pid}-w${week}`;
      const due = week === 1 ? FALL.week1Due : FALL.week2Due;
      await prisma.checkIn.create({
        data: { id, hackathonId: HACKATHONS.fall.id, userId: CANDIDATES[s.owner].id, projectId: pid, week, ...(week === 1 ? CHECKIN_WEEK1(s) : CHECKIN_WEEK2(s)), submittedAt: new Date(due.getTime() - 3_600_000 * (6 + i)) },
      });
      addRef(pid, { kind: "CHECKIN", id, label: `week ${week} check-in` });
    }
  }
  // Jamal registered for the cohort and posted a week 1 check-in, then stopped.
  await prisma.checkIn.create({
    data: { hackathonId: HACKATHONS.fall.id, userId: CANDIDATES.jamal.id, week: 1, progress: "Set up the repo and read the brief.", nextSteps: "Pick a problem.", hoursSpent: 3, submittedAt: daysFromNow(-14) },
  });

  for (const [i, s] of OPEN_PROJECTS.entries()) {
    const start = new Date(OPEN.startsAt.getTime() + 3_600_000 * (1 + i));
    const submittedAt = new Date(OPEN.submissionDeadline.getTime() - 3_600_000 * (2 + i));
    await createProject(s, submittedAt, start);
  }

  // Likes and comments on the open hackathon gallery. One comment is hidden by the organizer.
  const likers: CandidateKey[] = ["maya", "ben", "ruth", "sofia", "tariq"];
  for (const [i, s] of OPEN_PROJECTS.entries()) {
    for (const liker of likers.slice(0, 1 + (i % likers.length))) {
      if (liker === s.owner) continue;
      await prisma.projectLike.create({ data: { projectId: projectId(s.owner), userId: CANDIDATES[liker].id, createdAt: daysFromNow(-41) } });
    }
  }
  await prisma.comment.createMany({
    data: [
      { projectId: projectId("lina"), authorId: CANDIDATES.tariq.id, body: "Ran this on a 900-line diff and it split it into four patches I would actually review.", createdAt: daysFromNow(-41) },
      { projectId: projectId("nadia"), authorId: CANDIDATES.ruth.id, body: "The night map for route 7 matches my commute exactly.", createdAt: daysFromNow(-41) },
      { id: "comment-hidden", projectId: projectId("theo"), authorId: CANDIDATES.sofia.id, body: "Check out my project instead, link in bio.", hidden: true, hiddenById: "demo-organizer", createdAt: daysFromNow(-41) },
      { projectId: projectId("theo"), authorId: CANDIDATES.marco.id, body: "Splitting by who ate what is the feature every roommate app misses.", createdAt: daysFromNow(-40) },
    ],
  });
}

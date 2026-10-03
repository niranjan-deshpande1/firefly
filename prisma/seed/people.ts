// Fictional people only. The five demo ids are fixed by docs/build/contracts.md section 8.
import { daysFromNow, email, hex, json, prisma } from "./util";

// Matches CONSENT_VERSION in lib/profiles once that module lands.
export const CONSENT_VERSION = "2026-10-03";

// A spread of profile visibilities so lists and permissions are exercised.
const VISIBILITY: Record<string, string> = { hugolaurent: "PLATFORM", sofialindqvist: "PLATFORM", kenjimori: "PRIVATE", yaranasser: "PRIVATE" };

type Person = { id: string; name: string; username: string };

export const STAFF = {
  admin: { id: "demo-admin", name: "Alex Morgan", username: "alexmorgan" },
  organizer: { id: "demo-organizer", name: "Sam Okafor", username: "samokafor" },
  priya: { id: "demo-reviewer", name: "Priya Natarajan", username: "priyanatarajan" },
  leo: { id: "reviewer-leo", name: "Leo Park", username: "leopark" },
  hana: { id: "reviewer-hana", name: "Hana Sato", username: "hanasato" },
} as const;

export const COMPANY_PEOPLE = {
  jordan: { id: "demo-company", name: "Jordan Reyes", username: "jordanreyes" },
  casey: { id: "company-casey", name: "Casey Lin", username: "caseylin" },
  morgan: { id: "company-morgan", name: "Morgan Ellis", username: "morganellis" },
  dana: { id: "company-dana", name: "Dana Whitfield", username: "danawhitfield" },
  sasha: { id: "company-sasha", name: "Sasha Moreau", username: "sashamoreau" },
} as const;

type Candidate = Person & {
  headline: string;
  skills: string[];
  level: "STUDENT" | "NEW_GRAD" | "JUNIOR" | "MID";
  location: string;
  school?: string;
  talentPoolOptIn: boolean;
};

const c = (
  id: string,
  name: string,
  username: string,
  headline: string,
  skills: string[],
  level: Candidate["level"],
  location: string,
  talentPoolOptIn: boolean,
  school?: string,
): Candidate => ({ id, name, username, headline, skills, level, location, talentPoolOptIn, school });

// 24 candidates. Groups: 12 in Fall Builders Cohort, 10 in Open Build Weekend, 2 only in the upcoming jam.
export const CANDIDATES = {
  maya: c("demo-candidate", "Maya Chen", "mayachen", "new grad who likes boring, reliable backends", ["TypeScript", "Postgres", "Next.js"], "NEW_GRAD", "Seattle, WA", false, "Cascade State University"),
  aisha: c("cand-aisha", "Aisha Rahman", "aisharahman", "backend builder, payments and queues", ["Go", "Postgres", "Redis"], "JUNIOR", "Seattle, WA", true),
  ben: c("cand-ben", "Ben Okoro", "benokoro", "full-stack, happiest near the database", ["TypeScript", "React", "SQLite"], "NEW_GRAD", "Tacoma, WA", true),
  camila: c("cand-camila", "Camila Duarte", "camiladuarte", "career switcher from lab science", ["Python", "FastAPI", "pandas"], "JUNIOR", "Bellevue, WA", true),
  daniel: c("cand-daniel", "Daniel Weiss", "danielweiss", "builds small tools for small teams", ["Rust", "TypeScript", "SQLite"], "NEW_GRAD", "Seattle, WA", true),
  elena: c("cand-elena", "Elena Petrova", "elenapetrova", "data pipelines and the dashboards on top", ["Python", "dbt", "DuckDB"], "JUNIOR", "Redmond, WA", true),
  felix: c("cand-felix", "Felix Wong", "felixwong", "mobile first, web second", ["Swift", "Kotlin", "TypeScript"], "STUDENT", "Seattle, WA", false, "Puget Sound Institute"),
  grace: c("cand-grace", "Grace Mensah", "gracemensah", "frontend with an eye for forms", ["TypeScript", "React", "CSS"], "NEW_GRAD", "Everett, WA", true),
  hugo: c("cand-hugo", "Hugo Laurent", "hugolaurent", "infra curious, shell fluent", ["Go", "Docker", "Bash"], "STUDENT", "Seattle, WA", false, "Cascade State University"),
  isabel: c("cand-isabel", "Isabel Cruz", "isabelcruz", "product-minded engineer", ["TypeScript", "Next.js", "Prisma"], "JUNIOR", "San Francisco, CA", true),
  jamal: c("cand-jamal", "Jamal Carter", "jamalcarter", "learning backend by shipping", ["JavaScript", "Node.js"], "STUDENT", "Seattle, WA", false),
  kenji: c("cand-kenji", "Kenji Mori", "kenjimori", "machine learning tinkerer", ["Python", "PyTorch"], "STUDENT", "Oakland, CA", false),
  theo: c("cand-theo", "Theo Grant", "theogrant", "first hackathon, first shipped app", ["JavaScript", "Svelte"], "NEW_GRAD", "Portland, OR", false),
  lina: c("cand-lina", "Lina Haddad", "linahaddad", "developer tools and CLIs", ["TypeScript", "Node.js", "Rust"], "JUNIOR", "San Francisco, CA", true),
  marco: c("cand-marco", "Marco Rossi", "marcorossi", "designer who codes", ["Figma", "React", "CSS"], "JUNIOR", "San Francisco, CA", true),
  nadia: c("cand-nadia", "Nadia Ivanova", "nadiaivanova", "maps, open data and civic tools", ["Python", "PostGIS", "React"], "MID", "Seattle, WA", true),
  omar: c("cand-omar", "Omar Farouk", "omarfarouk", "realtime apps", ["Elixir", "Phoenix", "TypeScript"], "JUNIOR", "San Jose, CA", true),
  quinn: c("cand-quinn", "Quinn Taylor", "quinntaylor", "testing and quality nerd", ["TypeScript", "Playwright"], "NEW_GRAD", "San Jose, CA", true),
  ruth: c("cand-ruth", "Ruth Abebe", "ruthabebe", "accessibility first frontend", ["HTML", "TypeScript", "React"], "STUDENT", "Seattle, WA", true, "Puget Sound Institute"),
  sofia: c("cand-sofia", "Sofia Lindqvist", "sofialindqvist", "audio and creative coding", ["TypeScript", "Web Audio"], "JUNIOR", "Berkeley, CA", true),
  tariq: c("cand-tariq", "Tariq Aziz", "tariqaziz", "security minded backend", ["Go", "Postgres"], "MID", "San Francisco, CA", true),
  vera: c("cand-vera", "Vera Novak", "veranovak", "analytics engineer", ["SQL", "Python", "dbt"], "JUNIOR", "Seattle, WA", true),
  will: c("cand-will", "Will Harper", "willharper", "hardware and firmware", ["C", "Rust"], "STUDENT", "Seattle, WA", false),
  yara: c("cand-yara", "Yara Nasser", "yaranasser", "mobile and offline-first apps", ["Kotlin", "SQLite"], "NEW_GRAD", "Oakland, CA", false),
} as const;

export type CandidateKey = keyof typeof CANDIDATES;

/** Stable four-character blind code, unique across candidates (checked at seed time). */
export const blindCodeFor = (id: string) => hex(`blind:${id}`, 4).toUpperCase();

async function createUser(p: Person, role: string, createdDaysAgo: number) {
  await prisma.user.create({
    data: { id: p.id, name: p.name, username: p.username, email: email(p.username), role, createdAt: daysFromNow(-createdDaysAgo) },
  });
}

export async function seedPeople() {
  await createUser(STAFF.admin, "ADMIN", 120);
  await createUser(STAFF.organizer, "ORGANIZER", 110);
  for (const r of [STAFF.priya, STAFF.leo, STAFF.hana]) await createUser(r, "REVIEWER", 90);
  for (const p of Object.values(COMPANY_PEOPLE)) await createUser(p, "COMPANY", 60);

  const codes = new Set<string>();
  const list = Object.values(CANDIDATES);
  for (const [i, cand] of list.entries()) {
    const code = blindCodeFor(cand.id);
    if (codes.has(code)) throw new Error(`blind code collision for ${cand.id}`);
    codes.add(code);
    // Signups are spread over the last 80 days so the admin funnel has a history.
    await createUser(cand, "CANDIDATE", 80 - i * 3);
    await prisma.candidateProfile.create({
      data: {
        userId: cand.id,
        headline: cand.headline,
        bio: `${cand.headline}. based in ${cand.location}.`,
        skills: json(cand.skills),
        links: json([{ label: "GitHub", url: `https://github.com/example-${cand.username}` }]),
        location: cand.location,
        school: cand.school ?? null,
        experienceLevel: cand.level,
        visibility: VISIBILITY[cand.username] ?? "PUBLIC",
        talentPoolOptIn: cand.talentPoolOptIn,
        consentVersion: CONSENT_VERSION,
        consentAt: daysFromNow(-(79 - i * 3)),
        blindCode: code,
      },
    });
  }
}

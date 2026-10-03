// 4 fictional companies with 6 roles between them.
import { COMPANY_PEOPLE } from "./people";
import { daysFromNow, json, prisma } from "./util";

export const COMPANIES = {
  northwind: { id: "co-northwind", slug: "northwind-labs", name: "Northwind Labs" },
  harbor: { id: "co-harbor", slug: "harbor-health", name: "Harbor Health" },
  kestrel: { id: "co-kestrel", slug: "kestrel-analytics", name: "Kestrel Analytics" },
  lumen: { id: "co-lumen", slug: "lumen-studio", name: "Lumen Studio" },
} as const;

export const ROLES = {
  founding: "role-northwind-founding",
  product: "role-northwind-product",
  harborBackend: "role-harbor-backend",
  harborMobile: "role-harbor-mobile",
  kestrelData: "role-kestrel-data",
  lumenFrontend: "role-lumen-frontend",
} as const;

type Criterion = { name: string; description: string; jobRelated: string };

const ROLE_DATA: {
  id: string;
  companyId: string;
  title: string;
  level: string;
  description: string;
  skills: string[];
  domain: string;
  traits: string;
  hires: number;
  salary: [number, number];
  location: string;
  remote: string;
  criteria: Criterion[];
}[] = [
  {
    id: ROLES.founding,
    companyId: COMPANIES.northwind.id,
    title: "Founding Engineer",
    level: "JUNIOR",
    description: "Own features end to end on our scheduling product, from the database to the screen. You will be engineer number three.",
    skills: ["TypeScript", "Postgres", "React"],
    domain: "Scheduling and calendars for small clinics.",
    traits: "Writes things down, asks for the real requirement, ships in small steps.",
    hires: 1,
    salary: [130_000_00, 155_000_00],
    location: "Seattle, WA",
    remote: "HYBRID",
    criteria: [
      { name: "ships end to end", description: "Takes a vague request to a working feature across database, API and UI.", jobRelated: "Engineer three owns whole features with no dedicated frontend or backend split." },
      { name: "data correctness", description: "Models data so it stays correct under edits, time zones and concurrent use.", jobRelated: "Our product stores appointments; a wrong time zone is a missed appointment." },
      { name: "written communication", description: "Explains decisions in writing clearly enough for a teammate to act on.", jobRelated: "The team is hybrid and makes most decisions in written design notes." },
    ],
  },
  {
    id: ROLES.product,
    companyId: COMPANIES.northwind.id,
    title: "Product Engineer",
    level: "NEW_GRAD",
    description: "Build customer-facing features with design and support, and talk to clinics every week.",
    skills: ["TypeScript", "React"],
    domain: "Small clinic operations.",
    traits: "Curious about users, comfortable with feedback.",
    hires: 1,
    salary: [115_000_00, 135_000_00],
    location: "Seattle, WA",
    remote: "HYBRID",
    criteria: [
      { name: "user judgment", description: "Connects what they build to a named user problem.", jobRelated: "Product engineers choose what to build next from clinic interviews." },
      { name: "iteration speed", description: "Gets a usable version in front of people quickly and improves it.", jobRelated: "We ship weekly and revise from support tickets." },
    ],
  },
  {
    id: ROLES.harborBackend,
    companyId: COMPANIES.harbor.id,
    title: "Backend Engineer",
    level: "JUNIOR",
    description: "Build the APIs behind our patient intake tools.",
    skills: ["Go", "Postgres"],
    domain: "Healthcare intake forms.",
    traits: "Careful with data, steady under review.",
    hires: 1,
    salary: [140_000_00, 160_000_00],
    location: "Seattle, WA",
    remote: "REMOTE",
    criteria: [
      { name: "API design", description: "Designs endpoints that are hard to misuse.", jobRelated: "Partners integrate with our API directly." },
      { name: "testing discipline", description: "Tests the risky paths before shipping.", jobRelated: "Bugs in intake reach patients." },
    ],
  },
  {
    id: ROLES.harborMobile,
    companyId: COMPANIES.harbor.id,
    title: "Mobile Engineer",
    level: "JUNIOR",
    description: "Build our patient check-in app.",
    skills: ["Swift", "Kotlin"],
    domain: "Patient check-in.",
    traits: "Detail oriented.",
    hires: 1,
    salary: [135_000_00, 155_000_00],
    location: "Seattle, WA",
    remote: "HYBRID",
    criteria: [
      { name: "offline behavior", description: "Handles poor connectivity without losing input.", jobRelated: "Clinic waiting rooms have weak signal." },
      { name: "accessibility", description: "Builds screens that work with assistive technology.", jobRelated: "Many patients rely on screen readers or large text." },
    ],
  },
  {
    id: ROLES.kestrelData,
    companyId: COMPANIES.kestrel.id,
    title: "Data Platform Engineer",
    level: "JUNIOR",
    description: "Own ingestion pipelines and the models analysts query every day.",
    skills: ["Python", "SQL", "dbt"],
    domain: "Retail analytics.",
    traits: "Patient with messy data.",
    hires: 2,
    salary: [125_000_00, 145_000_00],
    location: "San Francisco, CA",
    remote: "HYBRID",
    criteria: [
      { name: "data modeling", description: "Designs tables that answer questions without surprises.", jobRelated: "Analysts build reports directly on these models." },
      { name: "pipeline reliability", description: "Makes failures visible and recoverable.", jobRelated: "Nightly loads feed customer dashboards." },
    ],
  },
  {
    id: ROLES.lumenFrontend,
    companyId: COMPANIES.lumen.id,
    title: "Frontend Engineer",
    level: "NEW_GRAD",
    description: "Build interactive editors for our design tool.",
    skills: ["TypeScript", "React", "CSS"],
    domain: "Design tools.",
    traits: "Visual care and performance awareness.",
    hires: 1,
    salary: [120_000_00, 140_000_00],
    location: "San Francisco, CA",
    remote: "ONSITE",
    criteria: [
      { name: "interaction quality", description: "Builds interactions that feel precise.", jobRelated: "Our users manipulate canvases all day." },
      { name: "performance", description: "Keeps the UI responsive with large documents.", jobRelated: "Customer files reach thousands of layers." },
    ],
  },
];

/** Role criteria ids are `${roleId}-k${index}` so reviews can reference them. */
export const criterionId = (roleId: string, index: number) => `${roleId}-k${index}`;
export const criteriaCount = (roleId: string) => ROLE_DATA.find((r) => r.id === roleId)!.criteria.length;

export async function seedCompanies() {
  const companyInfo = {
    northwind: { description: "Scheduling software for small clinics.", size: "1-10", stage: "Seed", location: "Seattle, WA", website: "https://northwind.example.test" },
    harbor: { description: "Patient intake tools for community health centers.", size: "11-50", stage: "Series A", location: "Seattle, WA", website: "https://harbor.example.test" },
    kestrel: { description: "Analytics for independent retailers.", size: "11-50", stage: "Seed", location: "San Francisco, CA", website: "https://kestrel.example.test" },
    lumen: { description: "A design tool for motion and layout.", size: "1-10", stage: "Pre-seed", location: "San Francisco, CA", website: "https://lumen.example.test" },
  };
  for (const [key, co] of Object.entries(COMPANIES)) {
    await prisma.company.create({ data: { ...co, ...companyInfo[key as keyof typeof companyInfo], createdAt: daysFromNow(-60) } });
  }

  const members: [string, string, string, boolean][] = [
    [COMPANIES.northwind.id, COMPANY_PEOPLE.jordan.id, "Head of Engineering", true],
    [COMPANIES.northwind.id, COMPANY_PEOPLE.casey.id, "Co-founder and CEO", false],
    [COMPANIES.harbor.id, COMPANY_PEOPLE.morgan.id, "Engineering Manager", true],
    [COMPANIES.kestrel.id, COMPANY_PEOPLE.dana.id, "CTO", true],
    [COMPANIES.lumen.id, COMPANY_PEOPLE.sasha.id, "Co-founder", true],
  ];
  for (const [companyId, userId, title, isOwner] of members) {
    await prisma.companyMember.create({ data: { companyId, userId, title, isOwner } });
  }

  for (const r of ROLE_DATA) {
    await prisma.role.create({
      data: {
        id: r.id,
        companyId: r.companyId,
        title: r.title,
        level: r.level,
        description: r.description,
        requiredSkills: json(r.skills),
        domainKnowledge: r.domain,
        traits: r.traits,
        numberOfHires: r.hires,
        salaryMinCents: r.salary[0],
        salaryMaxCents: r.salary[1],
        location: r.location,
        remote: r.remote,
        status: "OPEN",
        createdAt: daysFromNow(-50),
        criteria: {
          create: r.criteria.map((k, i) => ({ id: criterionId(r.id, i), ...k, sortOrder: i })),
        },
      },
    });
  }
}

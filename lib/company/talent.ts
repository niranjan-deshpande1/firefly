import "server-only";
import { prisma, parseJson } from "@/lib/db";
import { FINISHED_COHORT_PROJECT } from "@/lib/profiles/queries";
import { talentReasons } from "./talent-reasons";

/**
 * Opted-in past cohort finishers (brief 4.2). Listed alphabetically by name: no score, no match, no ranking.
 * A past cohort finisher posted a project in a hiring cohort that has ended; open hackathons don't count.
 */
export async function getTalentPool() {
  const users = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
      candidateProfile: { talentPoolOptIn: true },
      projects: { some: FINISHED_COHORT_PROJECT },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      candidateProfile: { select: { headline: true, skills: true, experienceLevel: true, location: true, visibility: true, blindCode: true } },
      projects: {
        where: FINISHED_COHORT_PROJECT,
        select: { id: true, title: true, verified: true, builtWith: true, hackathon: { select: { title: true } } },
      },
    },
  });
  return users.map((u) => {
    const profile = u.candidateProfile!;
    return {
      id: u.id,
      name: u.name ?? `candidate ${profile.blindCode}`,
      username: profile.visibility === "PRIVATE" ? null : u.username,
      headline: profile.headline,
      projects: u.projects.map((p) => ({ id: p.id, title: p.title, verified: p.verified })),
      reasons: talentReasons({
        hackathons: u.projects.map((p) => p.hackathon.title),
        verifiedCount: u.projects.filter((p) => p.verified).length,
        skills: parseJson<string[]>(profile.skills, []),
        builtWith: u.projects.flatMap((p) => parseJson<string[]>(p.builtWith, [])),
        location: profile.location,
      }),
    };
  });
}

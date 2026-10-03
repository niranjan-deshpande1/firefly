import "server-only";
import { prisma, parseJson } from "@/lib/db";
import { talentReasons } from "./talent-reasons";

/**
 * Opted-in past finishers (brief 4.2). Listed alphabetically by name: no score, no match, no ranking.
 * A finisher has a FINISHED registration or a posted project in a completed hackathon.
 */
export async function getTalentPool() {
  const users = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
      candidateProfile: { talentPoolOptIn: true },
      OR: [
        { registrations: { some: { status: "FINISHED" } } },
        { projects: { some: { status: "SUBMITTED", hackathon: { status: "COMPLETED" } } } },
      ],
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      candidateProfile: { select: { headline: true, skills: true, experienceLevel: true, location: true, visibility: true, blindCode: true } },
      projects: {
        where: { status: "SUBMITTED", hackathon: { status: "COMPLETED" } },
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

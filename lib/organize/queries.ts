import "server-only";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth";
import { ASSIGNABLE_ROLES } from "./schemas";

/** The organizer's own hackathons; admins see every hackathon. */
export function listConsoleHackathons(user: CurrentUser) {
  return prisma.hackathon.findMany({
    where: user.role === "ADMIN" ? {} : { organizerId: user.id },
    orderBy: [{ startsAt: "desc" }],
    include: {
      cohortConfig: { select: { defenseWindowStart: true, defenseWindowEnd: true, resultsAt: true } },
      organizer: { select: { name: true } },
      _count: { select: { registrations: true, projects: true } },
    },
  });
}

/** People who may review or judge: role REVIEWER, or ADMIN. */
export function listAssignableReviewers() {
  return prisma.user.findMany({
    where: { role: { in: [...ASSIGNABLE_ROLES] } },
    orderBy: [{ role: "desc" }, { name: "asc" }],
    select: { id: true, name: true, role: true },
  });
}

/** Projects with owner names (organizers may see names) and reviewer assignments. */
export function listCohortProjects(hackathonId: string) {
  return prisma.project.findMany({
    where: { hackathonId },
    orderBy: [{ status: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      status: true,
      owner: { select: { name: true } },
      decisions: { orderBy: { decidedAt: "desc" }, take: 1, select: { outcome: true } },
      reviewerAssignments: { select: { id: true, reviewer: { select: { id: true, name: true } } }, orderBy: { assignedAt: "asc" } },
    },
  });
}

import "server-only";
import { prisma } from "@/lib/db";
import { deleteStoredFile } from "@/lib/storage";

export const DELETED_NAME = "deleted account";

/**
 * Handles a DELETE request: removes everything the person made or that describes them,
 * and keeps an anonymous user row so billing records (hires), audit history and the request
 * itself stay intact. Projects cascade their evidence, reviews, interviews and reports.
 */
export async function anonymizeUser(userId: string): Promise<{ filesDeleted: number }> {
  const files = await prisma.storedFile.findMany({ where: { ownerId: userId }, select: { id: true } });
  const { email } = (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })) ?? { email: null };
  await prisma.$transaction([
    // Emails to the person carry their name and address in the log.
    ...(email ? [prisma.emailLog.deleteMany({ where: { to: email } })] : []),
    prisma.project.deleteMany({ where: { ownerId: userId } }),
    prisma.checkIn.deleteMany({ where: { userId } }),
    prisma.registration.deleteMany({ where: { userId } }),
    prisma.teamMember.deleteMany({ where: { userId } }),
    prisma.teamInvite.deleteMany({ where: { OR: [{ fromUserId: userId }, { toUserId: userId }] } }),
    prisma.projectLike.deleteMany({ where: { userId } }),
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.feedback.deleteMany({ where: { candidateId: userId } }),
    prisma.interview.deleteMany({ where: { candidateId: userId } }),
    prisma.shortlistEntry.deleteMany({ where: { candidateId: userId } }),
    prisma.candidateReport.deleteMany({ where: { candidateId: userId } }),
    prisma.interviewRequest.deleteMany({ where: { candidateId: userId } }),
    prisma.candidateProfile.deleteMany({ where: { userId } }),
    prisma.companyMember.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { name: DELETED_NAME, role: "CANDIDATE", email: null, emailVerified: null, username: null, image: null } }),
  ]);
  for (const f of files) await deleteStoredFile(f.id);
  return { filesDeleted: files.length };
}

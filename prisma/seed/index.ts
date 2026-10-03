// Full demo seed (brief section 8). Idempotent: it empties every table, then rebuilds the data set,
// so `npm run db:seed` and `npm run demo:reset` both land on the same state.
// The demo path state is documented in docs/build/demo-script.md.
import { seedCompanies } from "./companies";
import { seedHackathons } from "./hackathons";
import { seedHiring } from "./hiring";
import { seedOps } from "./ops";
import { seedPeople } from "./people";
import { seedProjects } from "./projects";
import { seedReviews } from "./review";
import { seedRubric } from "./rubric";
import { prisma } from "./util";

async function wipe() {
  // Children first, so no foreign key blocks a delete.
  await prisma.$transaction([
    prisma.interviewScore.deleteMany(),
    prisma.interviewInterviewer.deleteMany(),
    prisma.interview.deleteMany(),
    prisma.shortlistEntry.deleteMany(),
    prisma.shortlist.deleteMany(),
    prisma.interviewRequest.deleteMany(),
    prisma.candidateReport.deleteMany(),
    prisma.hire.deleteMany(),
    prisma.cohortEnrollment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.reviewScore.deleteMany(),
    prisma.review.deleteMany(),
    prisma.calibrationNote.deleteMany(),
    prisma.decision.deleteMany(),
    prisma.winner.deleteMany(),
    prisma.feedback.deleteMany(),
    prisma.reviewerAssignment.deleteMany(),
    prisma.judgeAssignment.deleteMany(),
    prisma.rubricDimension.deleteMany(),
    prisma.commit.deleteMany(),
    prisma.repoSnapshot.deleteMany(),
    prisma.aITranscript.deleteMany(),
    prisma.decisionLogEntry.deleteMany(),
    prisma.evidenceSummary.deleteMany(),
    prisma.projectImage.deleteMany(),
    prisma.projectLike.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.checkIn.deleteMany(),
    prisma.project.deleteMany(),
    prisma.teamInvite.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.registration.deleteMany(),
    prisma.prize.deleteMany(),
    prisma.scheduleItem.deleteMany(),
    prisma.judgingCriterion.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.update.deleteMany(),
    prisma.cohortConfig.deleteMany(),
    prisma.hackathon.deleteMany(),
    prisma.roleCriterion.deleteMany(),
    prisma.role.deleteMany(),
    prisma.companyMember.deleteMany(),
    prisma.company.deleteMany(),
    prisma.dataRequest.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.emailLog.deleteMany(),
    prisma.appSetting.deleteMany(),
    prisma.storedFile.deleteMany(),
    prisma.candidateProfile.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  await wipe();
  await seedPeople();
  await seedCompanies();
  await seedRubric();
  await seedHackathons();
  await seedProjects();
  await seedReviews();
  await seedHiring();
  await seedOps();

  const [users, hackathons, projects, reviews, interviews, hires, invoices, audits, emails] = await Promise.all([
    prisma.user.count(),
    prisma.hackathon.count(),
    prisma.project.count(),
    prisma.review.count(),
    prisma.interview.count(),
    prisma.hire.count(),
    prisma.invoice.count(),
    prisma.auditLog.count(),
    prisma.emailLog.count(),
  ]);
  console.log(
    `seeded ${users} users, ${hackathons} hackathons, ${projects} projects, ${reviews} reviews, ${interviews} interviews, ${hires} hires, ${invoices} invoices, ${audits} audit entries, ${emails} emails`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

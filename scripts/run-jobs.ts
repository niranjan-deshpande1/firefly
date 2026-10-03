// Runs every scheduled job once: `npm run jobs`. Meant for cron, for example hourly:
//   0 * * * * cd /path/to/firefly && npm run jobs >> jobs.log 2>&1
// The react-server condition (set in package.json) lets lib modules that import "server-only" load outside Next.
import { prisma } from "@/lib/db";
import { runJobs } from "@/lib/jobs";

runJobs(new Date())
  .then((counts) => console.log(JSON.stringify({ ranAt: new Date().toISOString(), ...counts })))
  .catch((error) => {
    console.error("scheduled jobs failed, nothing after the failing step ran. fix the error and run again.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

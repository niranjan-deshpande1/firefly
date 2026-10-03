// Seed skeleton (foundation): one fictional user per role so demo sign-in works.
// The ops builder replaces this with the full demo data set (brief section 8).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USERS = [
  { id: "demo-candidate", name: "Maya Chen", username: "mayachen", role: "CANDIDATE" },
  { id: "demo-company", name: "Jordan Reyes", username: "jordanreyes", role: "COMPANY" },
  { id: "demo-organizer", name: "Sam Okafor", username: "samokafor", role: "ORGANIZER" },
  { id: "demo-reviewer", name: "Priya Natarajan", username: "priyanatarajan", role: "REVIEWER" },
  { id: "demo-admin", name: "Alex Morgan", username: "alexmorgan", role: "ADMIN" },
] as const;

async function main() {
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, role: u.role, username: u.username },
      create: { ...u, email: `${u.username}@example.test` },
    });
  }
  console.log(`seeded ${USERS.length} users`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN "notifiedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hackathon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "timeZone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "themes" TEXT NOT NULL DEFAULT '[]',
    "format" TEXT NOT NULL DEFAULT 'ONLINE',
    "location" TEXT,
    "teamPolicy" TEXT NOT NULL DEFAULT 'SOLO',
    "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
    "registrationOpensAt" DATETIME NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "submissionDeadline" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "coverImage" TEXT,
    "organizerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hackathon_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hackathon" ("coverImage", "createdAt", "description", "eligibility", "endsAt", "format", "id", "location", "maxTeamSize", "organizerId", "registrationOpensAt", "rules", "slug", "startsAt", "status", "submissionDeadline", "tagline", "teamPolicy", "themes", "title", "type", "updatedAt") SELECT "coverImage", "createdAt", "description", "eligibility", "endsAt", "format", "id", "location", "maxTeamSize", "organizerId", "registrationOpensAt", "rules", "slug", "startsAt", "status", "submissionDeadline", "tagline", "teamPolicy", "themes", "title", "type", "updatedAt" FROM "Hackathon";
DROP TABLE "Hackathon";
ALTER TABLE "new_Hackathon" RENAME TO "Hackathon";
CREATE UNIQUE INDEX "Hackathon_slug_key" ON "Hackathon"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;


-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "roleId" TEXT,
    "model" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "durationMin" INTEGER NOT NULL DEFAULT 75,
    "location" TEXT,
    "videoLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "identityCheckedById" TEXT,
    "identityCheckedAt" DATETIME,
    "outcome" TEXT,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interview_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Interview_identityCheckedById_fkey" FOREIGN KEY ("identityCheckedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("candidateId", "completedAt", "createdAt", "durationMin", "id", "identityCheckedAt", "identityCheckedById", "location", "mode", "model", "notes", "outcome", "projectId", "roleId", "scheduledAt", "status", "videoLink") SELECT "candidateId", "completedAt", "createdAt", "durationMin", "id", "identityCheckedAt", "identityCheckedById", "location", "mode", "model", "notes", "outcome", "projectId", "roleId", "scheduledAt", "status", "videoLink" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

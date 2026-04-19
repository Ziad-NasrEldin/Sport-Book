CREATE TABLE "CoachSessionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1,
    "durationOptions" TEXT NOT NULL DEFAULT '[]',
    "baseRate" DECIMAL NOT NULL DEFAULT 0,
    "multiplier" DECIMAL NOT NULL DEFAULT 1,
    "visibility" TEXT NOT NULL DEFAULT 'Public',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachSessionType_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "CoachService" ADD COLUMN "sessionTypeId" TEXT;
ALTER TABLE "CoachService" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "CoachSessionType_coachId_idx" ON "CoachSessionType"("coachId");
CREATE INDEX "CoachService_sessionTypeId_idx" ON "CoachService"("sessionTypeId");

PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoachService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "sessionTypeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachService_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachService_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "CoachSessionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CoachService" ("coachId", "createdAt", "currency", "description", "duration", "id", "isActive", "name", "price", "sessionTypeId", "status", "updatedAt")
SELECT "coachId", "createdAt", "currency", "description", "duration", "id", "isActive", "name", "price", "sessionTypeId", "status", "updatedAt"
FROM "CoachService";
DROP TABLE "CoachService";
ALTER TABLE "new_CoachService" RENAME TO "CoachService";
CREATE INDEX "CoachService_coachId_idx" ON "CoachService"("coachId");
CREATE INDEX "CoachService_sessionTypeId_idx" ON "CoachService"("sessionTypeId");
PRAGMA foreign_keys=ON;

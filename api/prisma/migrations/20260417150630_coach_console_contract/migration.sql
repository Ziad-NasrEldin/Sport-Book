-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COURT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "courtId" TEXT,
    "coachId" TEXT,
    "coachServiceId" TEXT,
    "date" DATETIME NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "playerCount" INTEGER NOT NULL DEFAULT 1,
    "basePrice" DECIMAL NOT NULL,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "couponId" TEXT,
    "totalPrice" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cancelledAt" DATETIME,
    "cancellationReason" TEXT,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_coachServiceId_fkey" FOREIGN KEY ("coachServiceId") REFERENCES "CoachService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("basePrice", "cancellationReason", "cancelledAt", "coachId", "coachServiceId", "couponId", "courtId", "createdAt", "currency", "date", "discount", "duration", "endHour", "id", "paymentMethod", "paymentRef", "paymentStatus", "playerCount", "startHour", "status", "totalPrice", "type", "updatedAt", "userId") SELECT "basePrice", "cancellationReason", "cancelledAt", "coachId", "coachServiceId", "couponId", "courtId", "createdAt", "currency", "date", "discount", "duration", "endHour", "id", "paymentMethod", "paymentRef", "paymentStatus", "playerCount", "startHour", "status", "totalPrice", "type", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_courtId_idx" ON "Booking"("courtId");
CREATE INDEX "Booking_coachId_idx" ON "Booking"("coachId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_date_idx" ON "Booking"("date");
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

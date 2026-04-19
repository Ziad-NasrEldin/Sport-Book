-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentIntent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BOOKING_PAYMENT',
    "bookingId" TEXT,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentIntent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PaymentIntent" ("amount", "bookingId", "createdAt", "currency", "id", "paymentMethod", "paymentRef", "status", "updatedAt", "userId") SELECT "amount", "bookingId", "createdAt", "currency", "id", "paymentMethod", "paymentRef", "status", "updatedAt", "userId" FROM "PaymentIntent";
DROP TABLE "PaymentIntent";
ALTER TABLE "new_PaymentIntent" RENAME TO "PaymentIntent";
CREATE INDEX "PaymentIntent_userId_idx" ON "PaymentIntent"("userId");
CREATE INDEX "PaymentIntent_bookingId_idx" ON "PaymentIntent"("bookingId");
CREATE INDEX "PaymentIntent_status_idx" ON "PaymentIntent"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

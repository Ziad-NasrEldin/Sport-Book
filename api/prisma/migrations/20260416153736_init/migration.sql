-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "rtl" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "profileVisible" BOOLEAN NOT NULL DEFAULT true,
    "showActivityStatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Egypt',
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "operatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facility_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacilitySport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    CONSTRAINT "FacilitySport_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FacilitySport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Branch_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "hasLighting" BOOLEAN NOT NULL DEFAULT false,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Court_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Court_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourtPricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "isPeak" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourtPricingRule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourtClosure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courtId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT,
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "startHour" INTEGER,
    "endHour" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourtClosure_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "specialties" TEXT NOT NULL DEFAULT '[]',
    "sessionRate" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "commissionRate" DECIMAL NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "sportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Coach_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachService_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachAvailability_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachAvailabilityException" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachAvailabilityException_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
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
    CONSTRAINT "Booking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdByUserId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "neededPlayers" INTEGER NOT NULL,
    "memberUserIds" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamPost_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamPost_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamPostMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamPostMember_teamPostId_fkey" FOREIGN KEY ("teamPostId") REFERENCES "TeamPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamPostMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamPostJoinRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    CONSTRAINT "TeamPostJoinRequest_teamPostId_fkey" FOREIGN KEY ("teamPostId") REFERENCES "TeamPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamPostJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "price" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreProduct_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "deliveryFee" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "fulfillment" TEXT NOT NULL DEFAULT 'PICKUP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT,
    "contactPhone" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "totalPrice" DECIMAL NOT NULL,
    CONSTRAINT "StoreOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "StoreOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoreOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StoreProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CREDIT',
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "description" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "value" DECIMAL NOT NULL,
    "minOrderValue" DECIMAL,
    "maxDiscount" DECIMAL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL DEFAULT 'COURT',
    "facilityId" TEXT,
    "courtId" TEXT,
    "coachId" TEXT,
    "bookingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleUpgradeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "requestedRole" TEXT NOT NULL DEFAULT 'COACH',
    "sportId" TEXT,
    "experienceYears" INTEGER,
    "bio" TEXT,
    "businessName" TEXT,
    "businessAddress" TEXT,
    "licenseNumber" TEXT,
    "documents" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewerId" TEXT,
    "notes" TEXT,
    CONSTRAINT "RoleUpgradeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courtId" TEXT,
    "coachId" TEXT,
    "facilityId" TEXT,
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StoreProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL DEFAULT 'CREATE',
    "object" TEXT NOT NULL,
    "details" TEXT DEFAULT '{}',
    "ip" TEXT,
    "userAgent" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CmsContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_operatorId_key" ON "Facility"("operatorId");

-- CreateIndex
CREATE INDEX "Facility_operatorId_idx" ON "Facility"("operatorId");

-- CreateIndex
CREATE INDEX "Facility_status_idx" ON "Facility"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FacilitySport_facilityId_sportId_key" ON "FacilitySport"("facilityId", "sportId");

-- CreateIndex
CREATE INDEX "Branch_facilityId_idx" ON "Branch"("facilityId");

-- CreateIndex
CREATE INDEX "Court_branchId_idx" ON "Court"("branchId");

-- CreateIndex
CREATE INDEX "Court_sportId_idx" ON "Court"("sportId");

-- CreateIndex
CREATE INDEX "Court_status_idx" ON "Court"("status");

-- CreateIndex
CREATE INDEX "CourtPricingRule_courtId_idx" ON "CourtPricingRule"("courtId");

-- CreateIndex
CREATE INDEX "CourtClosure_courtId_idx" ON "CourtClosure"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "CourtClosure_courtId_date_key" ON "CourtClosure"("courtId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_userId_key" ON "Coach"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_slug_key" ON "Coach"("slug");

-- CreateIndex
CREATE INDEX "Coach_userId_idx" ON "Coach"("userId");

-- CreateIndex
CREATE INDEX "Coach_slug_idx" ON "Coach"("slug");

-- CreateIndex
CREATE INDEX "Coach_sportId_idx" ON "Coach"("sportId");

-- CreateIndex
CREATE INDEX "Coach_isActive_idx" ON "Coach"("isActive");

-- CreateIndex
CREATE INDEX "CoachService_coachId_idx" ON "CoachService"("coachId");

-- CreateIndex
CREATE INDEX "CoachAvailability_coachId_idx" ON "CoachAvailability"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachAvailability_coachId_dayOfWeek_startHour_key" ON "CoachAvailability"("coachId", "dayOfWeek", "startHour");

-- CreateIndex
CREATE INDEX "CoachAvailabilityException_coachId_idx" ON "CoachAvailabilityException"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachAvailabilityException_coachId_date_key" ON "CoachAvailabilityException"("coachId", "date");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_courtId_idx" ON "Booking"("courtId");

-- CreateIndex
CREATE INDEX "Booking_coachId_idx" ON "Booking"("coachId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_date_idx" ON "Booking"("date");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "TeamPost_courtId_idx" ON "TeamPost"("courtId");

-- CreateIndex
CREATE INDEX "TeamPost_date_idx" ON "TeamPost"("date");

-- CreateIndex
CREATE INDEX "TeamPost_status_idx" ON "TeamPost"("status");

-- CreateIndex
CREATE INDEX "TeamPost_createdByUserId_idx" ON "TeamPost"("createdByUserId");

-- CreateIndex
CREATE INDEX "TeamPostMember_teamPostId_idx" ON "TeamPostMember"("teamPostId");

-- CreateIndex
CREATE INDEX "TeamPostMember_userId_idx" ON "TeamPostMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPostMember_teamPostId_userId_key" ON "TeamPostMember"("teamPostId", "userId");

-- CreateIndex
CREATE INDEX "TeamPostJoinRequest_teamPostId_idx" ON "TeamPostJoinRequest"("teamPostId");

-- CreateIndex
CREATE INDEX "TeamPostJoinRequest_userId_idx" ON "TeamPostJoinRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPostJoinRequest_teamPostId_userId_key" ON "TeamPostJoinRequest"("teamPostId", "userId");

-- CreateIndex
CREATE INDEX "StoreProduct_facilityId_idx" ON "StoreProduct"("facilityId");

-- CreateIndex
CREATE INDEX "StoreProduct_category_idx" ON "StoreProduct"("category");

-- CreateIndex
CREATE INDEX "StoreProduct_status_idx" ON "StoreProduct"("status");

-- CreateIndex
CREATE INDEX "StoreOrder_userId_idx" ON "StoreOrder"("userId");

-- CreateIndex
CREATE INDEX "StoreOrder_status_idx" ON "StoreOrder"("status");

-- CreateIndex
CREATE INDEX "StoreOrder_paymentStatus_idx" ON "StoreOrder"("paymentStatus");

-- CreateIndex
CREATE INDEX "StoreOrderItem_orderId_idx" ON "StoreOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "StoreOrderItem_productId_idx" ON "StoreOrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_idx" ON "WalletTransaction"("walletId");

-- CreateIndex
CREATE INDEX "WalletTransaction_referenceType_referenceId_idx" ON "WalletTransaction"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_status_idx" ON "Coupon"("status");

-- CreateIndex
CREATE INDEX "Coupon_endDate_idx" ON "Coupon"("endDate");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_targetType_idx" ON "Review"("targetType");

-- CreateIndex
CREATE INDEX "Review_facilityId_idx" ON "Review"("facilityId");

-- CreateIndex
CREATE INDEX "Review_courtId_idx" ON "Review"("courtId");

-- CreateIndex
CREATE INDEX "Review_coachId_idx" ON "Review"("coachId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_bookingId_key" ON "Review"("userId", "bookingId");

-- CreateIndex
CREATE INDEX "RoleUpgradeRequest_userId_idx" ON "RoleUpgradeRequest"("userId");

-- CreateIndex
CREATE INDEX "RoleUpgradeRequest_status_idx" ON "RoleUpgradeRequest"("status");

-- CreateIndex
CREATE INDEX "RoleUpgradeRequest_requestedRole_idx" ON "RoleUpgradeRequest"("requestedRole");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_courtId_key" ON "Favorite"("userId", "courtId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_coachId_key" ON "Favorite"("userId", "coachId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_facilityId_key" ON "Favorite"("userId", "facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_object_idx" ON "AuditLog"("object");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "CmsContent_page_idx" ON "CmsContent"("page");

-- CreateIndex
CREATE INDEX "CmsContent_status_idx" ON "CmsContent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CmsContent_page_language_key" ON "CmsContent"("page", "language");

# SportBook Backend Design Spec

**Date:** 2026-04-16
**Stack:** Node.js · Fastify · Prisma · PostgreSQL · Paymob
**Repo structure:** Monorepo — `/api` folder next to `/web`

---

## 1. Repository Structure

```
Sport-Book/
├── web/                          (Next.js frontend — existing)
└── api/                          (Fastify backend — new)
    ├── src/
    │   ├── plugins/              (auth, cors, rate-limit, error-handler)
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── sports/
    │   │   ├── facilities/
    │   │   ├── courts/
    │   │   ├── coaches/
    │   │   ├── bookings/
    │   │   ├── teams/
    │   │   ├── store/
    │   │   ├── payments/
    │   │   ├── notifications/
    │   │   ├── reviews/
    │   │   └── admin/
    │   ├── lib/                  (prisma client, mailer, paymob wrapper)
    │   └── main.ts
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── package.json
```

Each module owns: `routes.ts`, `service.ts`, `schema.ts` (Zod).

---

## 2. Auth Strategy

- **Access token:** JWT, short-lived (15 min)
- **Refresh token:** opaque token stored in `RefreshToken` table, 30-day TTL, rotated on each use
- **Email verification:** token sent on register, required before first login
- **Password reset:** time-limited token (1 hr) sent via email
- **RBAC:** role stored on `User.role`. Middleware checks role per route group.

Roles: `PLAYER` | `COACH` | `OPERATOR` | `ADMIN`

---

## 3. Data Models

### Enums

```
Role              PLAYER | COACH | OPERATOR | ADMIN
BookingType       COURT | COACH
BookingStatus     PENDING | CONFIRMED | COMPLETED | CANCELLED
PaymentStatus     UNPAID | PAID | REFUNDED
CourtStatus       ACTIVE | MAINTENANCE | INACTIVE
ServiceStatus     ACTIVE | PAUSED | DRAFT
AvailMode         OPEN | LIMITED | BLOCKED
TeamStatus        OPEN | FULL | CANCELLED
JoinRequestStatus PENDING | APPROVED | REJECTED
StockStatus       IN_STOCK | LOW_STOCK | OUT_OF_STOCK
OrderStatus       PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
Fulfillment       PICKUP | DELIVERY
WalletTxType      TOPUP | DEBIT | REFUND | CREDIT
CouponType        PERCENTAGE | FIXED
NotifChannel      IN_APP | EMAIL | PUSH
ReviewTarget      COURT | COACH | FACILITY
ReviewStatus      PENDING | APPROVED | REJECTED
RequestedRole     COACH | OPERATOR
UpgradeStatus     PENDING | APPROVED | REJECTED | NEEDS_INFO
FavTarget         COURT | COACH | FACILITY
```

### Models

#### Users & Auth
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  phone        String?
  avatarUrl    String?
  role         Role     @default(PLAYER)
  isVerified   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model UserPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  language        String   @default("en")
  preferredSports String[]
  notifEnabled    Boolean  @default(true)
}
```

#### Sports
```prisma
model Sport {
  id       String  @id @default(cuid())
  name     String  @unique
  slug     String  @unique
  iconUrl  String?
  isActive Boolean @default(true)
}
```

#### Facilities, Branches & Courts
```prisma
model Facility {
  id          String   @id @default(cuid())
  name        String
  description String?
  logoUrl     String?
  ownerUserId String
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Branch {
  id             String   @id @default(cuid())
  facilityId     String
  name           String
  address        String
  city           String
  lat            Float?
  lng            Float?
  phone          String?
  operatingHours Json
  createdAt      DateTime @default(now())
}

model Court {
  id          String      @id @default(cuid())
  branchId    String
  sportId     String
  name        String
  surfaceType String?
  isIndoor    Boolean     @default(false)
  capacity    Int         @default(2)
  basePrice   Float
  peakPrice   Float
  images      String[]
  status      CourtStatus @default(ACTIVE)
  createdAt   DateTime    @default(now())
}

model CourtPricingRule {
  id        String @id @default(cuid())
  courtId   String
  dayOfWeek Int
  startHour Int
  endHour   Int
  price     Float
  label     String
}

model CourtClosure {
  id        String  @id @default(cuid())
  courtId   String
  date      String
  startHour Int
  endHour   Int
  reason    String?
}
```

#### Coaches
```prisma
model Coach {
  id              String   @id @default(cuid())
  userId          String   @unique
  slug            String   @unique
  bio             String?
  headline        String?
  city            String?
  experienceYears Int      @default(0)
  certifications  String[]
  languages       String[]
  sports          String[]
  isVerified      Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
}

model CoachService {
  id              String        @id @default(cuid())
  coachId         String
  title           String
  sportId         String
  description     String?
  durationMinutes Int
  price           Float
  maxParticipants Int           @default(1)
  minParticipants Int           @default(1)
  status          ServiceStatus @default(DRAFT)
}

model CoachAvailability {
  id        String    @id @default(cuid())
  coachId   String
  dayOfWeek Int
  startTime String
  endTime   String
  venue     String?
  mode      AvailMode
}

model CoachAvailabilityException {
  id      String  @id @default(cuid())
  coachId String
  date    String
  reason  String?
  impact  String
}
```

#### Bookings
```prisma
model Booking {
  id             String        @id @default(cuid())
  userId         String
  type           BookingType
  courtId        String?
  coachId        String?
  serviceId      String?
  date           String
  startHour      Int
  endHour        Int
  totalAmount    Float
  couponId       String?
  discountAmount Float         @default(0)
  status         BookingStatus @default(PENDING)
  paymentStatus  PaymentStatus @default(UNPAID)
  paymobOrderRef String?
  notes          String?
  createdAt      DateTime      @default(now())
}
```

#### Teams
```prisma
model TeamPost {
  id              String     @id @default(cuid())
  courtId         String
  sportId         String
  createdByUserId String
  date            String
  startHour       Int
  endHour         Int
  neededPlayers   Int
  status          TeamStatus @default(OPEN)
  createdAt       DateTime   @default(now())
}

model TeamPostMember {
  id         String   @id @default(cuid())
  teamPostId String
  userId     String
  joinedAt   DateTime @default(now())
  @@unique([teamPostId, userId])
}

model TeamPostJoinRequest {
  id         String            @id @default(cuid())
  teamPostId String
  userId     String
  status     JoinRequestStatus @default(PENDING)
  createdAt  DateTime          @default(now())
  @@unique([teamPostId, userId])
}
```

#### Store
```prisma
model StoreProduct {
  id          String      @id @default(cuid())
  facilityId  String?
  title       String
  description String?
  category    String
  price       Float
  stockQty    Int
  images      String[]
  status      StockStatus @default(IN_STOCK)
  createdAt   DateTime    @default(now())
}

model StoreOrder {
  id              String        @id @default(cuid())
  userId          String
  totalAmount     Float
  couponId        String?
  discountAmount  Float         @default(0)
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymobOrderRef  String?
  deliveryAddress Json?
  createdAt       DateTime      @default(now())
}

model StoreOrderItem {
  id          String      @id @default(cuid())
  orderId     String
  productId   String
  quantity    Int
  unitPrice   Float
  fulfillment Fulfillment
}
```

#### Payments & Wallet
```prisma
model Wallet {
  id       String @id @default(cuid())
  userId   String @unique
  balance  Float  @default(0)
  currency String @default("EGP")
}

model WalletTransaction {
  id          String       @id @default(cuid())
  walletId    String
  type        WalletTxType
  amount      Float
  ref         String?
  description String?
  createdAt   DateTime     @default(now())
}

model Coupon {
  id             String     @id @default(cuid())
  code           String     @unique
  type           CouponType
  value          Float
  maxUses        Int?
  usesCount      Int        @default(0)
  minOrderAmount Float?
  expiresAt      DateTime?
  isActive       Boolean    @default(true)
}
```

#### Notifications, Reviews & Misc
```prisma
model Notification {
  id          String       @id @default(cuid())
  userId      String
  channel     NotifChannel
  title       String
  description String
  isRead      Boolean      @default(false)
  createdAt   DateTime     @default(now())
}

model Review {
  id         String       @id @default(cuid())
  userId     String
  entityType ReviewTarget
  entityId   String
  rating     Int
  comment    String?
  status     ReviewStatus @default(PENDING)
  createdAt  DateTime     @default(now())
  @@unique([userId, entityType, entityId])
}

model RoleUpgradeRequest {
  id               String        @id @default(cuid())
  userId           String
  requestedRole    RequestedRole
  status           UpgradeStatus @default(PENDING)
  data             Json
  submittedAt      DateTime      @default(now())
  reviewedAt       DateTime?
  reviewedByUserId String?
}

model Favorite {
  id         String    @id @default(cuid())
  userId     String
  entityType FavTarget
  entityId   String
  createdAt  DateTime  @default(now())
  @@unique([userId, entityType, entityId])
}

model AuditLog {
  id          String   @id @default(cuid())
  actorUserId String?
  action      String
  entityType  String?
  entityId    String?
  meta        Json?
  createdAt   DateTime @default(now())
}

model CmsContent {
  id              String   @id @default(cuid())
  key             String   @unique
  content         Json
  updatedAt       DateTime @updatedAt
  updatedByUserId String?
}
```

---

## 4. API Route Map

All routes prefixed `/api/v1`. Legend: 🔓 public · 🔐 authenticated · 👤 role-gated.

### Auth
```
🔓 POST   /auth/register
🔓 POST   /auth/login
🔐 POST   /auth/logout
🔓 POST   /auth/refresh
🔓 POST   /auth/forgot-password
🔓 POST   /auth/reset-password
🔓 POST   /auth/verify-email
🔐 POST   /auth/send-request
```

### Users (self)
```
🔐 GET    /users/me
🔐 PATCH  /users/me
🔐 GET    /users/me/preferences
🔐 PATCH  /users/me/preferences
🔐 GET    /users/me/wallet
🔐 POST   /users/me/wallet/topup
🔐 GET    /users/me/wallet/transactions
🔐 GET    /users/me/favorites
🔐 POST   /users/me/favorites
🔐 DELETE /users/me/favorites/:id
🔐 GET    /users/me/bookings
🔐 GET    /users/me/orders
🔐 GET    /users/me/notifications
🔐 PATCH  /users/me/notifications/read-all
```

### Sports
```
🔓 GET    /sports
👤 POST   /sports                        (admin)
👤 PATCH  /sports/:id                    (admin)
👤 DELETE /sports/:id                    (admin)
```

### Facilities & Branches
```
🔓 GET    /facilities
🔓 GET    /facilities/:id
👤 POST   /facilities                    (operator)
👤 PATCH  /facilities/:id               (operator — owns it)
🔓 GET    /facilities/:id/branches
👤 POST   /facilities/:id/branches      (operator)
👤 PATCH  /facilities/:id/branches/:branchId
👤 DELETE /facilities/:id/branches/:branchId
🔓 GET    /facilities/:id/reviews
```

### Courts
```
🔓 GET    /courts
🔓 GET    /courts/:id
🔓 GET    /courts/:id/slots?date=
👤 POST   /courts                        (operator)
👤 PATCH  /courts/:id                   (operator)
👤 POST   /courts/:id/closures          (operator)
👤 DELETE /courts/:id/closures/:closureId
🔓 GET    /courts/:id/reviews
```

### Coaches (public)
```
🔓 GET    /coaches
🔓 GET    /coaches/:slug
🔓 GET    /coaches/:slug/availability?date=
🔓 GET    /coaches/:slug/services
🔓 GET    /coaches/:slug/reviews
```

### Coach Workspace
```
👤 GET    /coach/dashboard
👤 GET    /coach/profile
👤 PATCH  /coach/profile
👤 GET    /coach/services
👤 POST   /coach/services
👤 PATCH  /coach/services/:id
👤 DELETE /coach/services/:id
👤 GET    /coach/availability
👤 POST   /coach/availability
👤 PATCH  /coach/availability/:id
👤 DELETE /coach/availability/:id
👤 POST   /coach/availability/exceptions
👤 DELETE /coach/availability/exceptions/:id
👤 GET    /coach/bookings
👤 PATCH  /coach/bookings/:id/status
👤 GET    /coach/reports
👤 GET    /coach/settings
👤 PATCH  /coach/settings
```

### Bookings
```
🔐 POST   /bookings/court
🔐 POST   /bookings/coach
🔐 GET    /bookings/:id
🔐 POST   /bookings/:id/cancel
```

### Teams
```
🔓 GET    /teams
🔐 POST   /teams
🔓 GET    /teams/:id
🔐 POST   /teams/:id/join-request
🔐 POST   /teams/:id/join-requests/:userId/approve
🔐 POST   /teams/:id/join-requests/:userId/reject
🔐 POST   /teams/:id/leave
🔐 DELETE /teams/:id
```

### Store
```
🔓 GET    /store/products
🔓 GET    /store/products/:id
🔐 POST   /store/orders
🔐 GET    /store/orders/:id
🔐 POST   /store/orders/:id/cancel
```

### Checkout & Payments
```
🔐 POST   /checkout/validate-coupon
🔐 POST   /checkout/initiate
🔓 POST   /payments/paymob/webhook
```

### Reviews
```
🔐 POST   /reviews
🔓 GET    /reviews?entityType=&entityId=
```

### Operator Workspace
```
👤 GET    /operator/dashboard
👤 GET    /operator/bookings
👤 PATCH  /operator/bookings/:id/status
👤 GET    /operator/courts
👤 GET    /operator/branches
👤 GET    /operator/schedule
👤 GET    /operator/reports
👤 GET    /operator/staff
👤 POST   /operator/staff
👤 PATCH  /operator/staff/:id
👤 GET    /operator/profile
👤 PATCH  /operator/profile
👤 GET    /operator/settings
👤 PATCH  /operator/settings
```

### Admin
```
👤 GET    /admin/dashboard
👤 GET    /admin/users
👤 GET    /admin/users/:id
👤 PATCH  /admin/users/:id
👤 GET    /admin/facilities
👤 PATCH  /admin/facilities/:id
👤 GET    /admin/coaches
👤 PATCH  /admin/coaches/:id
👤 GET    /admin/bookings
👤 PATCH  /admin/bookings/:id
👤 GET    /admin/verification
👤 GET    /admin/verification/:caseId
👤 PATCH  /admin/verification/:caseId/status
👤 GET    /admin/coupons
👤 POST   /admin/coupons
👤 PATCH  /admin/coupons/:id
👤 DELETE /admin/coupons/:id
👤 GET    /admin/reviews
👤 PATCH  /admin/reviews/:id/status
👤 GET    /admin/finance
👤 GET    /admin/reports
👤 GET    /admin/sports
👤 POST   /admin/sports
👤 PATCH  /admin/sports/:id
👤 DELETE /admin/sports/:id
👤 GET    /admin/store/products
👤 POST   /admin/store/products
👤 PATCH  /admin/store/products/:id
👤 DELETE /admin/store/products/:id
👤 GET    /admin/store/orders
👤 PATCH  /admin/store/orders/:id
👤 GET    /admin/audit
👤 GET    /admin/settings
👤 PATCH  /admin/settings
👤 GET    /admin/localization
👤 PATCH  /admin/localization
👤 GET    /admin/cms
👤 PATCH  /admin/cms/:key
```

---

## 5. Key Business Logic Notes

### Slot Availability Engine
- `GET /courts/:id/slots?date=YYYY-MM-DD` returns 24 hour slots (0–23)
- A slot is BUSY if a confirmed/pending `Booking` overlaps it
- A slot is BLOCKED if a `CourtClosure` covers it
- Otherwise AVAILABLE

### Booking Conflict Detection
- On `POST /bookings/court`: check no overlapping `Booking` exists for same court + date + hour range with status PENDING or CONFIRMED
- On `POST /bookings/coach`: check coach has no confirmed booking in that slot

### Payment Flow
1. Frontend calls `POST /checkout/initiate` → backend creates a `Booking` (status=PENDING, paymentStatus=UNPAID) + calls Paymob API → returns `payment_key`
2. Frontend redirects user to Paymob iframe
3. Paymob calls `POST /payments/paymob/webhook` (HMAC verified) → backend sets `paymentStatus=PAID`, `status=CONFIRMED`, creates `WalletTransaction` if wallet used

### Team Conflict Rules
- A user cannot join/create a team that overlaps another team they're already in (same date + hour range)
- A court cannot have two team posts in the same slot
- Team status auto-flips to FULL when `1 + members.length >= 1 + neededPlayers`

### Review Gate
- Reviews only allowed if the submitting user has a `Booking` with `status=COMPLETED` for that entity

### Coupon Validation
- Check `isActive`, `expiresAt`, `maxUses > usesCount`, `minOrderAmount`
- Apply discount server-side only — never trust client-sent totals

### Role Upgrade Flow
1. User submits `POST /auth/send-request` → creates `RoleUpgradeRequest` (status=PENDING)
2. Admin reviews at `GET /admin/verification`
3. Admin calls `PATCH /admin/verification/:caseId/status` → if APPROVED, updates `User.role`

---

## 6. Cross-Cutting Concerns

| Concern | Approach |
|---|---|
| Input validation | Zod schemas per route, validated in Fastify hooks |
| Error format | `{ error: string, code: string }` uniform shape |
| Pagination | Cursor-based for feeds (teams, notifications); offset for admin tables |
| Rate limiting | `@fastify/rate-limit` — stricter on auth routes |
| CORS | Allowlist: `web` origin only |
| Logging | `pino` (Fastify default) — structured JSON |
| Audit trail | Middleware writes to `AuditLog` on all admin + operator mutations |
| Mailer | Nodemailer + SMTP or Resend for transactional email |
| Env config | `dotenv` + `.env.example` committed, secrets never in repo |

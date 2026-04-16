# SportBook Backend Execution Plan

## Summary

The `api/` Fastify app, Prisma schema, seed script, and a first-pass `web/src/lib/api/` client already exist. The plan below is a **completion plan**, not a greenfield plan: reconcile what's on disk, lock decisions that are still drifting, then ship domain-by-domain with each domain wired end-to-end (backend + web consumer + one `localStorage` source retired) before moving on.

## Baseline (on disk, 2026-04-16)

- `api/` app exists: Fastify + Prisma + Zod + bcrypt + JWT + cookies all in `api/package.json`
- All 16 modules scaffolded under `api/src/modules/`: `auth`, `users`, `player`, `sports`, `facilities`, `courts`, `coaches`, `bookings`, `payments`, `reviews`, `store`, `teams`, `coach-workspace`, `operator-workspace`, `admin-workspace`
- `api/prisma/schema.prisma` exists and uses **SQLite** with a committed `dev.db`
- `api/prisma/seed.ts` exists
- `web/src/lib/api/` exists with `client.ts`, `errors.ts`, `hooks.ts`
- No root `package.json` — web and api are still independent installs
- `web/src/lib/*.ts` still holds `localStorage`-backed business state: `accountType.ts`, `roleUpgradeRequests.ts`, `favorites.ts`, `notifications.ts`, `teams.ts`, `storeCart.ts`, `storeProducts.ts`, `courts.ts`, `coaches.ts`

## Locked decisions (resolve before more modules land)

1. **Database**: SQLite for local dev, PostgreSQL for deploy. Schema must stay provider-neutral — no Postgres-only features (`jsonb`, partial indexes, `gen_random_uuid`, native enums) until the `DATABASE_URL` switches. Enums stay as string unions with runtime validation via Zod.
2. **Module naming (canonical)**: `auth`, `users` (self-service `/users/me`), `sports`, `facilities`, `courts`, `coaches`, `bookings`, `checkout`, `payments`, `reviews`, `teams`, `store`, `coach-workspace`, `operator-workspace`, `admin-workspace`. The `-workspace` suffix stays (matches existing folders). Rename `player` → fold into `users` before Phase 2 ships.
3. **Role name**: `OPERATOR` is the canonical privileged business role. `facility` references in `web/` are migration aliases only.
4. **Route prefix**: everything under `/api/v1`.
5. **Error shape**: `{ error: string, code: string }`.
6. **Auth transport**: JWT access (short TTL) + opaque refresh in HttpOnly cookie, rotated on use, persisted in `RefreshToken` table.
7. **List pagination**: cursor for `teams` and `notifications`; offset for admin tables.
8. **Audit**: every operator/admin mutation writes `AuditLog`. Auth mutations do not unless privileged.
9. **Uploads**: out of scope for v1. Avatars, facility images, coach photos, and review photos stay as URL strings pointing at external hosts. Un-defer only if a specific screen demands upload before launch.
10. **Idempotency**: webhook handlers require a unique constraint on `(provider, externalEventId)` — **hard requirement**, not a footnote.

## Phase A — Reconciliation (replaces original Phases 0–4)

**Goal**: know what's actually wired vs. stubbed before adding anything.

1. Add root `package.json` with `workspaces: ["api", "web"]` and scripts: `dev`, `dev:api`, `dev:web`, `build`, `lint`, `test`, `db:migrate`, `db:seed`.
2. Add `.nvmrc` or `engines.node` pin.
3. Audit each module in `api/src/modules/*`:
   - routes.ts registered in `api/src/app.ts`? yes/no
   - service methods implemented vs. throwing `not implemented`?
   - Zod schema covers every route input?
   - emits `AuditLog` where required?
   - owns its Prisma access (no cross-module queries)?
4. Produce `docs/module-status.md` with a one-row-per-module matrix. This is the real backlog.
5. Fold `api/src/modules/player` into `api/src/modules/users`. Delete the old folder.
6. Confirm `schema.prisma` enums/indexes match the locked decisions. One migration to fix, then freeze.
7. Wire seed to run after every `prisma migrate dev` in local dev (via `prisma.seed` config in `api/package.json`).

**Exit gate**: `npm install` + `npm run db:migrate && npm run db:seed && npm run dev` works from repo root with no hand-holding. Module status matrix is committed.

## Phase B — Shared backend conventions

**Goal**: one reference module proves the pattern others copy.

- Layout: `api/src/modules/<name>/{routes.ts, service.ts, schema.ts, mapper.ts?}`.
- Zod validation at route boundary only. Services never see raw request objects.
- Prisma access stays inside services.
- Responses: list → `{ items, pageInfo }`; detail → resource object; mutation → updated resource or `{ ok: true }`.
- Test policy: service-level unit tests for business rules, route integration tests for auth + validation. **Each phase's exit gate includes its own tests.**
- Pick one module (recommend `auth`, since everything depends on it) and make it the reference implementation.

## Phase C — Auth end-to-end (vertical slice)

Backend:
- `POST /auth/register`, `/login`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password`, `/verify-email`, `/send-request`
- `GET /users/me`, `PATCH /users/me`
- Password hashing, JWT signing, refresh rotation, email/reset token tables
- Role-upgrade request creation for `COACH` / `OPERATOR`
- RBAC decorators: `requireAuth`, `requireRole(...)`

Web:
- Wire `web/src/app/auth/sign-in`, `sign-up`, `forgot-password`, `reset-password`, `verify-email`, `send-request` to real endpoints
- Replace `web/src/lib/accountType.ts` with session-driven role (read from `/users/me`)
- Replace `web/src/lib/roleUpgradeRequests.ts` with API calls
- Add auth-aware fetch in `web/src/lib/api/client.ts` (cookie-based, auto-refresh on 401)

Tests:
- Auth flow integration tests (register → login → refresh → logout)
- RBAC helper unit tests
- Token rotation / revocation tests

**Exit gate**: a new user can sign up, sign in across refresh, and have their role change reflected in the UI without any `localStorage` business state. Two `web/src/lib/*.ts` files are deleted.

## Phase D — Self-service user domain

Backend:
- `GET/PATCH /users/me/preferences`
- `GET /users/me/wallet`, `/wallet/transactions`
- `GET/POST/DELETE /users/me/favorites` (targets: court, coach, facility)
- `GET /users/me/bookings`, `/orders`
- `GET /users/me/notifications`, `PATCH /users/me/notifications/read-all`
- Auto-provision `Wallet` and `UserPreference` on user create

Web:
- Replace `web/src/lib/favorites.ts` and `web/src/lib/notifications.ts`
- Wire profile, preferences, and notification inbox pages

Tests: favorites dedup, wallet transaction ordering, notification read-all idempotency.

**Exit gate**: favorites and notifications work across browsers (no `localStorage`). Two more lib files deleted.

## Phase E — Public discovery

Backend:
- `GET /sports`
- `GET /facilities`, `/:id`, `/:id/branches`, `/:id/reviews`
- `GET /courts`, `/:id`, `/:id/slots` (24 hourly slots: `AVAILABLE` / `BUSY` / `BLOCKED`)
- `GET /coaches`, `/:slug`, `/:slug/availability`, `/:slug/services`, `/:slug/reviews`
- Filters: sport, city, price range, status

Web:
- Replace `web/src/lib/courts.ts` and `web/src/lib/coaches.ts` data sources
- Update `web/src/app/{courts,coaches,book,categories}/` and `page.tsx`
- Add API-DTO → card-props mapper so UI components don't change

Tests: slot availability given closures + overlapping bookings, filter combinations.

**Exit gate**: home, browse, and detail pages render backend data. Hardcoded arrays deleted.

## Phase F — Booking core + pricing

Backend:
- `POST /bookings/court`, `/bookings/coach`
- `GET /bookings/:id`, `POST /bookings/:id/cancel`
- Conflict helpers (overlap detection respecting blocking statuses)
- Pricing helpers: court base/peak/rules, coach service price, coupon discount — **all totals server-side**
- Status state machine

Web:
- Nothing public-visible yet beyond a hold/draft state

Tests (highest priority in the whole project):
- Two overlapping court bookings → second rejected
- Two overlapping coach bookings → second rejected
- Pricing calculation unit tests for every rule path
- Cancellation status transitions

**Exit gate**: conflict tests green. Frontend still can't check out, but booking intents are creatable via API.

## Phase G — Checkout, coupons, Paymob

Backend:
- `POST /checkout/validate-coupon`, `/checkout/initiate`
- `POST /payments/paymob/webhook`
- `api/src/lib/paymob.ts` wrapper with HMAC verification
- **Idempotency table** (or unique constraint on `processedWebhookEvents(provider, externalId)`) — reject replays
- On initiate: revalidate resource, revalidate slot/coach, validate coupon, create pending booking, return payment key
- On webhook: verify sig → load event → if already processed, 200 no-op → else mark paid, confirm booking, write wallet txn

Web:
- Replace `web/src/app/book/page.tsx` + `web/src/app/checkout/page.tsx` with API-backed flow
- Confirmation pages read booking state from API

Tests:
- HMAC signature verification
- Webhook replay returns 200 without double-confirming
- Coupon validation edge cases (expired, usage cap, per-user cap)

**Exit gate**: court booking → checkout → pending booking → webhook → confirmed, all via API, with replay safety.

## Phase H — Reviews

- `POST /reviews`, `GET /reviews`
- Gate: user must have a completed booking tied to the target
- One review per user per target (unique constraint)
- Default moderation `PENDING`; public endpoints return `APPROVED` only
- Expose on facility/court/coach detail pages

**Exit gate**: gating + dedup tests green.

## Phase I — Teams

Backend:
- `GET /teams`, `POST /teams`, `GET /teams/:id`
- Join request lifecycle: `POST /:id/join-request`, `/approve`, `/reject`
- `POST /:id/leave`, `DELETE /:id`
- Port rules from `web/src/lib/teams.ts`: participant overlap prevention, one court post per overlapping slot, creator-only approval, auto-full on threshold
- Emit notifications for join/approve/reject/full/cancelled

Web:
- Delete `web/src/lib/teams.ts`
- Wire team list + detail pages

Tests: all conflict rules; notification emission; cross-browser persistence.

## Phase J — Store + orders

Backend:
- `GET /store/products`, `/:id`
- `POST /store/orders`, `GET /store/orders/:id`, `POST /store/orders/:id/cancel`
- Stock decrement via transaction (no negative stock under concurrency)
- Reuse coupon + payment backbone from Phase G

Web:
- Delete `web/src/lib/storeProducts.ts` and `web/src/lib/storeCart.ts`
- Wire `web/src/app/store/*`

Tests: concurrent order stock test, cancellation refund path.

## Phase K — Coach workspace

Backend (all under `coach-workspace`):
- Dashboard, profile read/update, services CRUD, availability CRUD + exceptions, bookings list + status update, reports, settings

Web:
- Replace `web/src/lib/coach/mockData.ts` consumers
- Coach public profile + coach workspace share one record

Tests: service status changes reflect in public discoverability; availability exceptions affect slot endpoint.

## Phase L — Operator workspace

Backend (all under `operator-workspace`):
- Dashboard, bookings list + status, courts list/detail/update, branches CRUD, schedule, reports, staff, profile, settings, closure + pricing rule management
- Ownership checks: every mutation verifies the record belongs to the operator's facility
- Audit write on every mutation

Web:
- Replace `web/src/lib/operator/mockData.ts` consumers
- Normalize remaining `facility` account-type conflations

Tests: cross-operator access denied; audit rows written.

## Phase M — Admin control plane

Backend (all under `admin-workspace`):
- Dashboard, users list/detail/update, facilities, coaches, bookings, verification queue + approve/reject, coupons CRUD, review moderation, finance, reports, sports CRUD, store products CRUD, store orders, audit list, settings, localization, CMS get/update
- Verification approval upgrades `User.role` and closes the `RoleUpgradeRequest`
- Every privileged mutation writes `AuditLog`

Web:
- Replace `web/src/lib/admin/mockData.ts` consumers
- UI structure unchanged, only data source + mutations

Tests: verification approval → role change → audit row; moderation gate on reviews.

## Phase N — Cleanup + docs

- Delete or quarantine remaining mock libs (visual-only demo fallback allowed; business state is not)
- Route guards for `/profile`, `/coach`, `/operator`, `/admin`
- Loading / empty / error states on every API-backed page
- Update root `README.md` with full setup (DB, env, migrate, seed, run)
- Write `api/.env.example`: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_DAYS`, `WEB_ORIGIN`, SMTP vars, `PAYMOB_*`
- Document seeded test accounts + deferred features list (uploads, recurring bookings, geo search, Redis, S3, native mobile, combined cart checkout)

## Cross-cutting rules (apply every phase)

- **Testing is a phase exit gate, not a phase**: a module ships with its tests or it's not shipped.
- **Frontend integration is not a final phase**: each backend domain lands with its web consumer and at least one deleted `localStorage` lib.
- **Schema freeze discipline**: after Phase A, schema changes require migrations in the same PR as the code that needs them. No speculative fields.
- **No new abstractions without two concrete callers**: wait until the second module needs a helper before extracting it.

## Acceptance criteria

- Root workspace runs both apps with one install.
- Every module's status is either "done + tested" or explicitly "deferred (reason)".
- No business-critical state lives in `localStorage`.
- `OPERATOR` is the canonical privileged role across api + web.
- Booking conflict, pricing, webhook replay, and coupon tests are green.
- A fresh clone can migrate, seed, and walk the primary flows end-to-end using docs only.

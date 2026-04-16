# Module Status Matrix

> Generated 2026-04-16. Update this file when a module ships or is deferred.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done and tested |
| 🔧 | Scaffolded — routes/service exist, not fully tested |
| ⚠️ | Stub only — hardcoded data or not-implemented throws |
| ❌ | Missing |
| — | Not applicable |

---

## Backend modules (`api/src/modules/`)

| Module | routes.ts | service.ts | schema.ts | Registered in app.ts | AuditLog | Tests | Notes |
|--------|-----------|------------|-----------|----------------------|----------|-------|-------|
| `auth` | ✅ | ✅ | ✅ | ✅ `/api/v1/auth` | — | ❌ | Register, login, logout, refresh, forgot/reset password, role-upgrade request |
| `users` | ✅ | ✅ | ✅ | ✅ `/api/v1/users` | — | ❌ | `/me`, preferences, wallet, favorites, bookings, orders, notifications. Hosts `playerRoutes` stubs at `/api/v1/player` |
| `sports` | ✅ | ✅ | ✅ | ✅ `/api/v1/sports` | — | ❌ | List + detail |
| `facilities` | ✅ | ✅ | ✅ | ✅ `/api/v1/facilities` | — | ❌ | List, detail, branches, reviews |
| `courts` | ✅ | ✅ | ✅ | ✅ `/api/v1/courts` | — | ❌ | List with filters, detail, slot availability |
| `coaches` | ✅ | ✅ | ✅ | ✅ `/api/v1/coaches` | — | ❌ | List, profile, availability, services, reviews |
| `bookings` | ✅ | ✅ | ✅ | ✅ `/api/v1/bookings` | — | ❌ | Create court/coach booking, cancel, status machine — conflict detection needed |
| `payments` | ✅ | ✅ | ✅ | ✅ `/api/v1/payments` | — | ❌ | PaymentIntent create/process; Paymob webhook TBD in Phase G |
| `reviews` | ✅ | ✅ | ✅ | ✅ `/api/v1/reviews` | — | ❌ | Create, list, moderation gate |
| `teams` | ✅ | ✅ | ✅ | ✅ `/api/v1/teams` | — | ❌ | CRUD, join-request lifecycle, notifications |
| `store` | ✅ | ✅ | ✅ | ✅ `/api/v1/store` | — | ❌ | Products, orders, stock decrement |
| `coach-workspace` | ✅ | ✅ | ✅ | ✅ `/api/v1/coach-workspace` | — | ❌ | Dashboard, services, availability, bookings, reports, settings |
| `operator-workspace` | ✅ | ✅ | ✅ | ✅ `/api/v1/operator-workspace` | ⚠️ | ❌ | Dashboard, branches, courts, schedule, bookings, reports, staff, profile, settings |
| `admin-workspace` | ✅ | ✅ | ✅ | ✅ `/api/v1/admin-workspace` | ⚠️ | ❌ | Dashboard, users, facilities, coaches, verification, coupons, reviews, finance, reports, sports, store, audit, CMS |

> **Deleted:** `player` module (2026-04-16) — stubs migrated to `users/routes.ts` as `playerRoutes`, registered at `/api/v1/player`. Will be removed entirely in Phase C when web frontend is updated to call correct endpoints.

---

## Web frontend data sources (`web/src/lib/`)

| File | Status | Blocked by | Target endpoint |
|------|--------|------------|-----------------|
| `accountType.ts` | ⚠️ localStorage | Phase C | `GET /api/v1/users/me` |
| `roleUpgradeRequests.ts` | ⚠️ localStorage | Phase C | `POST /api/v1/auth/send-request` |
| `favorites.ts` | ⚠️ localStorage | Phase D | `GET/POST/DELETE /api/v1/users/me/favorites` |
| `notifications.ts` | ⚠️ localStorage | Phase D | `GET /api/v1/users/me/notifications` |
| `courts.ts` | ⚠️ mock array | Phase E | `GET /api/v1/courts` |
| `coaches.ts` | ⚠️ mock array | Phase E | `GET /api/v1/coaches` |
| `teams.ts` | ⚠️ localStorage | Phase I | `GET/POST /api/v1/teams` |
| `storeProducts.ts` | ⚠️ mock array | Phase J | `GET /api/v1/store/products` |
| `storeCart.ts` | ⚠️ localStorage | Phase J | `POST /api/v1/store/orders` |

---

## Phase completion checklist

| Phase | Status | Exit gate met? |
|-------|--------|----------------|
| A — Reconciliation | 🔧 In progress | Workspace + module matrix done; player folded; TypeScript clean |
| B — Shared conventions | ❌ Not started | — |
| C — Auth end-to-end | ❌ Not started | — |
| D — Self-service user domain | ❌ Not started | — |
| E — Public discovery | ❌ Not started | — |
| F — Booking core + pricing | ❌ Not started | — |
| G — Checkout + Paymob | ❌ Not started | — |
| H — Reviews | ❌ Not started | — |
| I — Teams | ❌ Not started | — |
| J — Store + orders | ❌ Not started | — |
| K — Coach workspace | ❌ Not started | — |
| L — Operator workspace | ❌ Not started | — |
| M — Admin control plane | ❌ Not started | — |
| N — Cleanup + docs | ❌ Not started | — |

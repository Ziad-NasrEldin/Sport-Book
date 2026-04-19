# Sport-Book Project Memory

## Architecture
- **Frontend:** Next.js 16.2.3 (Turbopack) with App Router, TypeScript, Tailwind CSS
- **Backend:** Fastify + Prisma ORM with SQLite
- **Auth:** JWT with httpOnly cookies, role-based access (PLAYER, COACH, OPERATOR, ADMIN)
- **API prefix:** `/api/v1/`
- **API response format:** `{ data: ... }` wrapper — pages must unwrap with `res?.data || res || fallback`

## Key Patterns
- **Frontend API hooks:** `useApiCall<T>(url)` for GET, `api.post/patch/delete(url, body)` for mutations
- **Coach booking flow** (`/coaches/[slug]/checkout`, `/coaches/[slug]/confirmation`) is the reference pattern for properly connected pages
- **AdminTable** — NOT wrapped in `memo` (generic type inference breaks with memo)
- **Trend types:** AdminStatCard supports `'up' | 'down' | 'flat' | 'steady'`
- **ChartPoint vs number[]:** AdminTrendBars takes `number[]`, AdminDonut takes `{label, value, color}[]` — must map ChartPoint data

## Test Accounts
- Admin: `admin@sportbook.com` / `password123`
- Operator: `operator@sportbook.com` / `password123`
- Coach: `coach@sportbook.com` / `password123`
- Player 1: `player1@example.com` / `password123`
- Player 2: `player2@example.com` / `password123`

## Common Pitfalls
- API responses wrap data in `{data: ...}` — always use `Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])`
- Coach/sport fields are objects `{id, name, displayName}` — extract string with `item.sport?.displayName || item.sport?.name || ''`
- `role` field from auth can be object `{displayName, name}` — normalize with helper
- All hooks must be called before any conditional returns to avoid "fewer hooks" error

## Session History
- **2026-04-18:** Full-stack integration sprint — connected 22 disconnected pages, added 8 backend endpoints, fixed 5 TS errors, wrote E2E tests, fixed runtime bugs
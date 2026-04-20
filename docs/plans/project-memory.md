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
- **2026-04-20:** Admin UI polish Phase 1 — created new component library (AdminButton, AdminSelect), enhanced existing components (AdminTable, AdminFilterBar, AdminStatusPill, AdminStatCard, AdminPanel, AdminPageHeader), added animations and reduced-motion support

---

## Design Context

### Brand Personality
**"Kinetic Editorial"** — The design system draws from tennis: precision, explosive power, and refined elegance.

### Aesthetic Direction
- **Not "standard app"** — Treat UI as a high-end digital magazine
- **Intentional asymmetry** over rigid grids
- **Hyper-rounded forms** (lg/xl radius) mimicking tennis court curves
- **Immersive depth** via tonal layering, not borders

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#00113a` | Dark text, authority |
| Primary Container | `#002366` | Royal blue — headers, active states |
| Secondary | `#904d00` | Orange accent |
| Secondary Container | `#fd8b00` | High-visibility actions |
| Tertiary Fixed | `#c3f400` | Tennis-ball neon for selections |
| Surface | `#faf8ff` | Base background |
| Surface Container Low | `#f4f3f9` | Section backgrounds |
| Surface Container Lowest | `#ffffff` | Cards, content pop |

### Typography
- **Display/Headlines:** Plus Jakarta Sans (geometric, stadium scoreboard feel)
- **Body:** Plus Jakarta Sans (readable, generous x-height)
- **Utility/Labels:** Lexend (technical, high-performance for data)

### Design Principles (from design.md)
1. **No 1px borders** — Use color shifts and tonal transitions
2. **No-line rule** — Boundaries via surface hierarchy, not dividers
3. **Ghost border fallback** — Use `outline-variant` at 15% opacity
4. **Hyper-rounded** — Use lg (2rem) and xl (3rem) corner radii
5. **Progressive disclosure** — Hide non-essential data

### Polished Components (Phase 1)
- **AdminButton** — primary/secondary/ghost/danger variants, loading state, focus rings
- **AdminSelect** — styled dropdown with focus/hover states
- **AdminTable** — row hover, zebra striping, consistent typography
- **AdminFilterBar** — focus ring, clear button
- **AdminStatusPill** — consistent tone mapping, interactive prop
- **AdminStatCard** — hover scale, trend colors via tone
- **AdminPanel** — standardized typography, noPadding option
- **AdminPageHeader** — className prop, consistent typography
- **globals.css** — animations (fade-in, slide-up), focus-visible, reduced-motion

### Accessibility
- Focus-visible outlines on all interactive elements
- Reduced-motion media query support
- Standard WCAG contrast ratios via design tokens
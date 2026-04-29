## 2026-04-15
- Fixed Next.js runtime image host error by allowing Unsplash in Next image remote patterns.
- Updated Next config to include images remotePatterns for images.unsplash.com.
- Verified with production build success (`npm run build`).

## 2026-04-15
- Implemented desktop-responsive version of the Court Advantage homepage while preserving the same sections and content architecture.
- Added responsive container shell behavior, category row-to-grid adaptation, and two-column desktop court cards.
- Scaled typography, spacing, imagery, and floating dock dimensions for large screens without introducing new features or sections.
- Verified with production build success (`npm run build`).

## 2026-04-15
- Created a brand-new `/book` booking page corresponding to the provided design reference in Next.js structure.
- Reconstructed the responsive layout implementing the sticky bottom action bar, court gallery, floating stats, interactive 24-slot time grid (hours 0-23 with mapping coloring from the HTML sample), and rules section.
- Upgraded the home page `CourtCard` UI to function as standard Next.js links allowing `Link href="/book"` redirections when a court is marked "Available".
- Ensured perfect desktop scaling logic matches earlier adjustments (max-widths, centered containers).

## 2026-04-15
- Implemented \/checkout\ checkout page reproducing the provided 'Checkout' reference design.
- Included UI components for a top cover image, order details grid (400 EGP), interactive payment selection (Credit Card / Apple Pay / Wallet), and promo code form.
- Bound the 'Confirm Booking' button from the \/book\ page to route dynamically to the new \/checkout\ flow.
- Styled according to Kinetic Editorial constraints (ambiance shadows, transparent soft borders, rounded large radii).
- Verified production build success (\
pm run build\).


## 2026-04-15
- Fixed an overlapping issue on the homepage where the 'Book Now' button inside CourtCards was partially covered by the floating navigation dock.
- Increased the main container's bottom padding (\pb-32\ for mobile, \pb-36\ for desktop) to ensure sufficient scroll clearance above the dock.
- Verified layout integrity and production build success.


## 2026-04-15 (Fix 2)
- Explicitly resolved the floating dock unscrollable overlap issue by adding an absolute hard-spacer (h-32 md:h-40) at the bottom of the main content wrapper in page.tsx and scaling up layout container bottom padding.

## 2026-04-15 (Fix 3)
- Replaced hard-coded page spacer padding with a shared dock-safe clearance system using CSS variables and safe-area-aware calculations.
- Updated the floating navigation bottom offset to use the same safe-area-aware variable so scroll clearance and dock position stay in sync across mobile devices.

## 2026-04-15 (Fix 4)
- Tuned dock-safe spacing to be more robust on real mobile viewports by lowering the dock anchor while increasing dynamic content clearance above it.
- Centralized clearance behavior in global CSS variables so the homepage and future pages stay protected from floating dock overlap without page-specific spacer hacks.

## 2026-04-15 (Fix 5)
- Added explicit bottom spacing to the Courts Nearby section so the final CourtCard action row always remains above the floating dock, even on shorter mobile viewports.

## 2026-04-15 (Fix 6 - Scratch Rebuild)
- Rebuilt dock integration from scratch: removed global dock injection from layout and mounted the floating dock directly in the homepage only.
- Removed old global dock utility CSS and replaced it with page-owned bottom reserve spacing (`pb-[calc(8.5rem+env(safe-area-inset-bottom))]`) so `Book Now` stays clear of the dock.
- Kept dock fixed with explicit safe-area bottom anchoring while eliminating cross-page spacing side effects.
- Verified production build success (`npm run build`).

## 2026-04-15 (Fix 7 - Image Recovery)
- Identified root cause for missing images: multiple Unsplash links used in Home, Book, and Checkout were returning HTTP 404.
- Replaced dead image URLs with verified live Unsplash URLs and confirmed compilation success.


## 2026-04-15 (Feature - Booking Confirmation Page)
- Implemented /confirmation route to match the Court Booking success design.
- Utilized Lucide React and tailwind patterns consistent with the rest of the application.
- Embedded FloatingNav navigation at the bottom of the page.
- Connected checkout to confirmation.

## 2026-04-15 (Feature - Rating Modal Popup)
- Created <ReviewModal /> as a mandatory intercept between selecting a court and proceeding to checkout.
- Modal features an interactive 5-star rating overlay and text area mapped to the design palette.
- Wired Confirm Booking in /book to toggle the modal, maintaining the unified booking flow.

## 2026-04-15 (Feature - Homepage Date Selector)
- Created DateSelector horizontal sliding component to inject between categories and nearby courts on the home route.
- Implemented dynamic snapping and state mirroring visually what's requested in the design overlay (snapping to TUE 08 by default).

## 2026-04-15 (Fix - Date Selector Mobile Opt)
- Disabled horizontal sliding on the DateSelector for screens md and above.
- Container now spreads items predictably using flex space-between on desktop and reverts back to the snap container slider exclusively on mobile Viewports.

## 2026-04-15 (Fix - Centered Mobile Date Slider)
- Reworked DateSelector mobile behavior into a true touch-drag carousel with snap-center locking.
- Added center tracking during scroll so the day nearest the middle becomes the active selection.
- Added edge padding logic so first and last days can also snap and land in the exact center.

## 2026-04-15 (Fix - Date Slider Flicker)
- Smoothed mobile date drag behavior by deferring active-day state updates until scrolling settles.
- Added a single center-lock commit after drag end to prevent rapid highlight flipping while swiping.

## 2026-04-15 (Feature - User Profile Module Design)
- Designed the main user Profile Page (\web/src/app/profile/page.tsx\) based on the rules outlined in \design.md\ (The Kinetic Editorial).
- Utilized No-Line rule, deep tonal layers (ambient shadow drops), and large-scale border radii (full & lg) to construct stacked profile cards.
- Implemented 'Glass & Gradient' header layer with user personal details floating gracefully over immersive hero imagery.
- Embedded functional summaries: Wallet current balance quick view, next Booking history, Saved Favorites shortcut, and Preferences toggles overview without creating disparate complex routes that hinder mobile fluidity.

## 2026-04-15 (Fix - Profile Icon Removal)
- Converted the 'Profile' and 'Home' buttons in FloatingNav.tsx to Next.js 'Link' components.
- Added usePathname logic to correctly highlight the active tab dynamically (e.g., highlighting 'Profile' when on the profile page).
- Designed and added a new /bookings page with upcoming sessions, booking history, monthly booking stats, and floating dock integration.
- Updated the Profile page action so 'View All Bookings' now routes directly to /bookings.
- Locked DateSelector tile and container heights so selection animation no longer changes section flow.
- Replaced size-changing selected-state transitions with paint-only transitions, preventing Courts cards from shifting vertically during date interactions.

## 2026-04-15 (Feature - Favorites Page + Profile Link)
## 2026-04-16 (Feature - Preferences Page + Profile Access)

## 2026-04-16 (Fix - Home Category Discover Routing)
- Made the home category cards clickable links so the `Discover` action now navigates to the courts list page.
- Implemented overlap protection rules in Teams logic to block conflicting user schedules and court-slot conflicts while still allowing unlimited non-overlapping joins.
- Added team completion notifications (in-app + mocked email/push records) and connected existing bell modals/count badges to persisted in-app notifications.
- Wrapped `/courts`, `/store/checkout`, and `/store/confirmation` client pages in Suspense boundaries to satisfy Next.js App Router build requirements when using `useSearchParams()`.
- Verified successful production build after the boundary updates.

## 2026-04-16 (Feature - Onboarding First-Launch Gate + Replay Trigger)

## 2026-04-16 (Feature - Dynamic Favorites for Courts and Coaches)
## 2026-04-16 (Feature - Coach Booking Confirm + Checkout Flow)
- Added a new coach booking confirmation step at `/coaches/[slug]/confirm-booking` with session setup, duration/type selection, and live pricing summary.
- Updated `/coaches/[slug]` to include a prominent `Confirm Booking` CTA that opens the new flow with prefilled session details.

- Added reusable admin UI building blocks (sidebar, topbar, page header, panels, status pills, stat cards, filter bar, table, and lightweight chart components) to keep visual behavior and interactions consistent across pages.
- Added centralized admin mock datasets and formatting helpers, then wired realistic UI interactions per page (searching, filtering, status updates, moderation actions, toggles, and report/CMS form states) for detailed desktop-first mockups.

## 2026-04-16 (Feature - Coach/Facility Request Flow From Auth)

## 2026-04-16 (Feature - Admin Verification Consumes Auth Requests)

## 2026-04-16 (Feature - Coach Dashboard Suite 7 Pages)
- Added centralized coach mock-data contracts in `web/src/lib/coach/mockData.ts` to power KPIs, availability blocks, services, bookings, reports, profile, and settings states.
- Added coach-managed flexible session type formats in `/coach/services` (not limited to private/duo) to prepare later integration with the player booking flow.
- Updated coach account post-login destination to `/coach/dashboard` and aligned `/dashboard/[role]` coach shortcuts to the new coach suite routes.
- Verified production build success (`npm run build`).

## 2026-04-16 (Feature - Reviews Analytics Tabs + User Directory Row Actions)
- Upgraded `/admin/reviews` with analytics and graphs plus two tabs (`Facilities`, `Coaches`), each with its own performance insights, booking-share donut, trend bars, and best-performing leaderboard.
- Connected review tab filtering so moderation queue entries now scope correctly to the selected entity type while preserving search/status filtering and moderation actions.
- Enhanced `/admin/users` User Directory rows with new action controls: `View Account Details`, `Edit Account`, and `Quick Chat on WhatsApp`.
- Verified production build success (`npm run build`).

## 2026-04-16 (Feature - Dedicated User Account Details + Edit Routes)

## 2026-04-16 (UX - Admin Account Edit Toasters + Save Timeline)

## 2026-04-16 (Feature - Detailed Create Coupon + Add Sport Mockups)

## 2026-04-16 (Feature - Operator Facility Suite Mockup)

## 2026-04-16 (Feature - Persistent Verification Decisions for Auth Requests)

## 2026-04-16 (UX - Admin Dashboard Logout Button)

## 2026-04-16 (UX - Hide Facility In Login Account Type Selector)

## 2026-04-16 (Feature - Admin Store Management Page)

## 2026-04-16 (Fix - Sidebar Overlap Across Dashboard Suites)

## 2026-04-16 (UX - Sidebar and Role Dashboard Logout)

## 2026-04-16 (SEO - Robots Metadata + Canonical URL Template)
- Added `web/src/app/robots.ts` to generate `robots.txt` with canonical host/sitemap values derived from `NEXT_PUBLIC_SITE_URL` (with safe fallback support).
- Added `web/.env.example` as a production template for `NEXT_PUBLIC_SITE_URL` and updated `web/.gitignore` to allow committing `.env.example`.

## 2026-04-23 (Fix - Web Dev OOM and Localhost Memory Spike)
- Investigated localhost crash behavior and reproduced a Turbopack out-of-memory failure during `/` compile, including worker-thread spawn failures under resource pressure.
- Fixed Next config scope in `web/next.config.ts` by aligning both `outputFileTracingRoot` and `turbopack.root` to the `web` app directory instead of the repository root.
- Eliminated repo-root module resolution side effects (including `tailwindcss` resolution attempts from `E:\GitHub\Sport-Book`) and restored stable local dev startup/compile behavior.

## 2026-04-23 (Fix - Auth Sign-In Hydration Mismatch)
- Fixed SSR/client text mismatch on `/auth/sign-in` by removing localStorage-based account-type initialization from first render.
- Set deterministic initial account type (`player`) and moved persisted account-type hydration into `useEffect` after mount.

## 2026-04-23 (Style - Bold Design System: User Profile & Preferences)
- Updated Saved Favorites, Preferences, Store Purchases, Legal, and Policy pages to implement the new SportBook Bold Design System (Teko/Saira typography, rounded shapes, and ambient shadows).

## 2026-04-23 (Style - Bold Design System: Auth Pages)
- Redesigned the Sign In and Sign Up pages to implement the bold design system using squircle inputs, animated floating states, and updated Saira/Teko typography.
- Migrated `forgot-password`, `reset-password`, `send-request`, and `verify-email` auth pages to bold design system.
- Resolved a TypeScript compilation issue with invalid props on `LoadingSpinner` component.
- Next.js build verification successful.

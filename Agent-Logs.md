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
- Removed the user profile avatar icon from the top header of the Home, Checkout, and Confirmation pages entirely, per request.

## 2026-04-15 (Fix - Profile Routing)
- Converted the 'Profile' and 'Home' buttons in FloatingNav.tsx to Next.js 'Link' components.
- Added usePathname logic to correctly highlight the active tab dynamically (e.g., highlighting 'Profile' when on the profile page).

## 2026-04-15 (Feature - Bookings Page + Profile Redirect)
- Designed and added a new /bookings page with upcoming sessions, booking history, monthly booking stats, and floating dock integration.
- Updated the Profile page action so 'View All Bookings' now routes directly to /bookings.
- Updated FloatingNav so the Bookings tab routes to /bookings and displays correct active-state highlighting.

## 2026-04-15 (Fix - Date Selector Layout Isolation)
- Locked DateSelector tile and container heights so selection animation no longer changes section flow.
- Replaced size-changing selected-state transitions with paint-only transitions, preventing Courts cards from shifting vertically during date interactions.

## 2026-04-15 (Fix - Profile Page Missing Dock)
- Added \<FloatingNav />\ to the \/profile\ page layout so the navigation dock remains accessible while browsing account options.

## 2026-04-15 (Fix - Dock Visual Consistency Across Pages)
- Normalized FloatingNav background from raw white tint to the design-system surface token so it renders consistently across Home and Bookings.
- Removed overflow clipping from the /bookings page root container to avoid any page-level visual interference with the floating dock.

## 2026-04-15 (Fix - Bookings Card Responsiveness + History Route)
- Refined /bookings mobile card layout with strict compact sizing so booking cards stay responsive and never exceed 25% of viewport height.
- Moved Booking History out of /bookings into a dedicated /bookings/history page and added in-page links to open it quickly.
- Kept floating dock navigation available across both /bookings and /bookings/history screens.

## 2026-04-15 (Feature - Account Details Page)
- Added a new account details page at /profile/account-details with profile photo, personal information, preferences, and security sections in the existing Kinetic Editorial style.
- Wired Profile page account settings entry points so both desktop Settings icon and mobile Account Details card now route to /profile/account-details.
- Kept floating dock integration consistent on the new page and preserved profile active-state for nested /profile routes.

## 2026-04-15 (Fix - Further Bookings Card Size Reduction)
- Compressed My Bookings page cards again for mobile by switching stat cards to a dense 3-column mini-tile layout and reducing card paddings/typography.
- Tightened upcoming session cards to a significantly lower viewport-based height (h-[min(19svh,8.25rem)]) while still enforcing max-h-[25svh] so they stay compact across devices.

## 2026-04-15 (Feature - Notifications Popup with Booking Confirmation)
- Added a reusable notifications modal component and connected it to bell actions on Home and Book pages.
- Included a mock top notification titled 'Booking Confirmed' with session details to satisfy booking confirmation visibility.
- Added consistent overlay/modal behavior (close on backdrop, close button, styled notification cards) while preserving current design language.

## 2026-04-15 (Feature - Move Bookings Into Profile + Add Store Page)
- Moved the full My Bookings experience into the Profile page via a dedicated bookings section (stats, upcoming sessions, and history entry point).
- Replaced Bookings dock destination with Store and added a new /store page scaffold that is intentionally empty for now.
- Added route compatibility redirects: /bookings now redirects to /store, and /bookings/history redirects to /profile/bookings-history.

## 2026-04-16 (Feature - Profile Bookings Card + Dedicated Page)
- Added a fourth card on /profile named Bookings beside existing favorites/preferences/account-details actions.
- Created /profile/bookings and moved the full bookings module UI into this dedicated page (stats, upcoming sessions, and history entry).
- Updated profile quick booking CTA to open /profile/bookings while keeping existing navigation behavior consistent.

## 2026-04-16 (Feature - Categories View All Page)
- Added a dedicated /categories page with editorial category cards, summary stats, and direct category exploration actions.
- Wired Home page category 'VIEW ALL' action to route to /categories using Next.js Link.
- Preserved floating dock integration and existing design-system styling consistency on the new page.

## 2026-04-16 (Fix - Bookings Back Button Uses Navigation History)
- Updated /profile/bookings back button to use browser history (outer.back()) instead of fixed redirect to /profile.
- Updated /profile/bookings-history back button to use browser history as well, with safe fallback routes when no prior history exists.

## 2026-04-16 (Feature - View All Courts Page)
- Added a new /courts page designed from the provided reference: sticky header, search bar, sport tabs, filter chips, stacked court cards, and a floating bottom dock style specific to courts exploration.
- Implemented interactive mock filtering (sport, price, distance, and text search) with empty-state handling.
- Wired category exploration cards on /categories to open /courts with the selected sport prefilled via query parameter.
## 2026-04-16 (Feature - View All Courts Page)
- Added a new /courts page designed from the provided reference: sticky header, search bar, sport tabs, filter chips, stacked court cards, and a floating bottom dock style specific to courts exploration.
- Implemented interactive mock filtering (sport, price, distance, and text search) with empty-state handling.
- Wired category exploration cards on /categories to open /courts with the selected sport prefilled via query parameter.
## 2026-04-16 (Feature - Home View All Courts CTA)
- Added a new 'View All Courts' button beneath the Courts Nearby cards on the Home page.
- Wired the new CTA to route directly to /courts.
## 2026-04-16 (Tweak - Home View All Courts Link Style)
- Replaced the large 'View All Courts' button under Courts Nearby with a small text hyperlink style CTA.
- Preserved the same /courts routing behavior.
## 2026-04-16 (Fix - Unified Floating Dock on Courts Page)
- Removed the custom floating dock implementation from /courts and replaced it with the shared FloatingNav component.
- Aligned /courts bottom safe-area padding with the same dock reserve used across the app for consistent layout behavior.

## 2026-04-16 (Feature - Wallet Top Up Page)
- Added a new dedicated wallet top-up experience at /profile/wallet/topup with preset amounts, custom amount input, payment method selection, and charge summary.
- Wired the Profile wallet CTA ('Top Up Balance') to navigate directly to the new top-up page.
- Kept floating dock integration and visual styling aligned with the existing profile and booking design language.
## 2026-04-16 (Feature - Store Marketplace Cards Design)
- Fully redesigned /store into a marketplace-style catalog with card-based sports items sold by facilities (rackets, balls, grips, and bags).
- Added a clear seller-access policy section stating that only verified facility owners can upload products, with an owner upload CTA.
- Added search input, category chips, stock badges, pricing, and facility attribution per product card while preserving shared floating dock consistency.
## 2026-04-16 (Fix - Store Mobile Responsiveness)
- Improved /store mobile responsiveness by stacking seller policy rows and preventing owner upload CTA overflow on small screens.
- Updated product card action rows so price and 'View Item' adapt cleanly from stacked mobile layout to inline desktop layout.
- Added overflow-safe text handling for facility/location labels and constrained header subtitle width for better readability.
## 2026-04-16 (Fix - Store Filters and Search Functionality)
- Converted /store to a client page and implemented working category chip filters with active-state behavior.
- Implemented live search filtering across product title, category, facility name, and location.
- Added a no-results state when filters/search produce zero matching products.
## 2026-04-16 (Tweak - Removed Seller Access Policy Card)
- Removed the Seller Access Policy/Owner Upload card block from the /store page as requested.
- Cleaned related unused icon imports after removing the section.
## 2026-04-16 (Feature - Store Product Details Page)
- Added dynamic product details route at /store/[productId] and wired Store 'View Item' actions to open the selected product page.
- Introduced shared store product data module to keep listing and details pages synchronized.
- Implemented functional UI controls on details page: back navigation, quantity stepper, fulfillment mode toggle, add-to-cart state button, and Buy Now route action.
## 2026-04-16 (Feature - Dedicated Store Checkout Flow)
- Added a separate store purchase checkout page at /store/checkout with product summary, quantity, delivery method, contact/shipping form, payment method selection, promo code apply logic, and full order total breakdown.
- Updated Store product details 'Buy Now' action to route to /store/checkout instead of the court booking checkout.
- Added store-specific order confirmation page at /store/confirmation so Place Order is functional end-to-end for store purchases.
## 2026-04-16 (Feature - Profile Store Purchases Section)
- Added a new Store Purchases card section to /profile linking to /profile/store-purchases.
- Implemented /profile/store-purchases page to review store order history with status, order ID, fulfillment, and totals.
- Added functional actions per purchase: View Product and Buy Again (routes to dedicated store checkout).
## 2026-04-16 (Feature - Store Cart Icon and Integration)
- Added a cart icon to the top header of /store (store page only) with a live quantity badge.
- Implemented a functional cart drawer UI on /store with item list, quantity controls, remove item, clear cart, subtotal, and per-item checkout actions.
- Integrated product details Add To Cart with shared cart state (localStorage + update events) so cart contents sync between /store/[productId] and /store.

## 2026-04-16 (Feature - Coaches Pages + Slot Framework)
- Added a new /coaches listing page with coach name, experience (years), coached game, and quick access to each coach profile.
- Added dynamic coach profile pages at /coaches/[slug] that use the same time-slot framework style as court booking (24-hour slot grid, availability legend, and rate bands).
- Wired FloatingNav Coaches tab to /coaches with active-state highlighting for coaches routes.

## 2026-04-16 (Feature - Coaches Search and Filters)
- Added in-page coach search on /coaches to find coaches by name or sport instantly.
- Added sport chips and minimum-experience filters (Any, 5+ years, 10+ years) with live result counts.
- Included a no-results state so users can clearly recover by adjusting filters or search terms.

## 2026-04-16 (UX - Collapsible Coaches Filters on Mobile)
- Added a mobile-friendly minimize/maximize control for the coaches filter section on /coaches to reduce visual clutter.
- Kept filter controls always visible on desktop while preserving the new collapsible behavior for smaller screens only.
- Maintained existing search, sport chips, experience filters, and live result count behavior.

## 2026-04-16 (Feature - Mock Auth Screens + Social Login)
- Added mock auth pages: /auth/sign-in, /auth/sign-up, and /auth/forgot-password with polished mobile-first UI and clear mock-only messaging.
- Included Google and Facebook actions on both Sign In and Sign Up screens, plus email/password mock forms and cross-links between auth pages.
- Wired Profile logout action to navigate to the new Sign In screen for a complete mock auth flow entry point.

## 2026-04-16 (UI Tweak - Auth Screen Ordering + Color Cleanup)
- Removed all visible 'Mockup' labels and mock wording from Sign In, Sign Up, and Forgot Password screens.
- Reordered auth flows so email form/action appears first, with Google/Facebook options placed below as requested.
- Updated primary auth CTA colors to the brighter secondary-container style for Sign In, Sign Up, and Send Reset Link buttons.

## 2026-04-16 (Feature - Teams Details + Lifecycle Actions)
- Added a dedicated dynamic Team Details route at /teams/[teamId] with full team summary, member list, and active-user switching for simulation/testing.
- Implemented member lifecycle actions in Teams state: leaveTeamPost for joined members and cancelTeamPost for creators with permission checks and post updates.
- Added direct View Details CTA from Teams feed cards and cancellation notifications to joined members (in-app + mocked email/push channels).

## 2026-04-16 (UX - Teams Cancel Confirmation + Redirect Banners)
- Added a confirmation modal before creators can cancel a team post on /teams/[teamId] to prevent accidental cancellation.
- Updated leave and cancel actions on team details to redirect back to /teams with success notices in the URL state.
- Added one-time success banners on /teams for redirected left and cancelled actions, then automatically cleaned the query parameter from the address bar.

## 2026-04-16 (UI Overhaul - Onboarding Screens Redesign)
- Rebuilt /onboarding from scratch with a cleaner mobile-first visual system, balanced typography scale, and improved spacing hierarchy across all 4 slides.
- Preserved ordered flow (Instant Booking, Expert Coaching, E-Commerce, Team Matchmaking) while introducing per-slide image treatments, badges, stat rows, and stronger CTA composition.
- Kept functional onboarding behavior intact: swipe gestures, skip, pagination dots, first-launch gating, completion persistence, and finish routing to /auth/sign-in.

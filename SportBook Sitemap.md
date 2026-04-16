# SportBook Sitemap

Last updated: 2026-04-16

## Summary Metrics
- Total UI page routes: 76
- Dynamic page routes: 12
- Redirect alias routes: 6

## Public Discovery, Booking, and Store
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| / | Static | Public | Home and discovery landing page. |
| /book | Static | Public | Booking entry flow. |
| /categories | Static | Public | Sports category browsing. |
| /coaches | Static | Public | Coaches listing and filtering. |
| /coaches/[slug] | Dynamic (slug) | Public | Coach profile and slots. Slugs sourced from lib/coaches.ts. |
| /coaches/[slug]/checkout | Dynamic (slug) | Public | Coach booking checkout stage. |
| /coaches/[slug]/confirm-booking | Dynamic (slug) | Public | Coach booking final review step. |
| /coaches/[slug]/confirmation | Dynamic (slug) | Public | Coach booking confirmation screen. |
| /courts | Static | Public | Court and facility discovery. |
| /checkout | Static | Public | Generic checkout route. |
| /confirmation | Static | Public | Generic confirmation route. |
| /store | Static | Public | Facility store listing and cart entry. |
| /store/[productId] | Dynamic (productId) | Public | Product detail page. IDs sourced from lib/storeProducts.ts. |
| /store/checkout | Static | Public | Store checkout stage. |
| /store/confirmation | Static | Public | Store order confirmation. |
| /teams | Static | Public | Team feed and post creation entry. |
| /teams/[teamId] | Dynamic (teamId) | Public | Team details. IDs are runtime-generated in browser storage. |

## Authentication and Onboarding
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| /auth/sign-in | Static | Public | Sign-in page. |
| /auth/sign-up | Static | Public | Registration page. |
| /auth/forgot-password | Static | Public | Password recovery flow. |
| /auth/send-request | Static | Public | Role/facility/coach request submission. |
| /onboarding | Static | Public | Initial user setup and guidance. |

## Player Account and Activity
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| /profile | Static | Authenticated User | Player profile center. |
| /profile/account-details | Static | Authenticated User | Account details editor. |
| /profile/bookings | Static | Authenticated User | Booking list in profile area. |
| /profile/bookings-history | Static | Authenticated User | Booking history in profile area. |
| /profile/store-purchases | Static | Authenticated User | Store purchase history. |
| /profile/wallet/topup | Static | Authenticated User | Wallet top-up screen. |
| /favorites | Static | Authenticated User | Saved favorites view. |
| /preferences | Static | Authenticated User | User preferences and personalization. |
| /bookings | Static | Authenticated User | Redirect alias to /store. |
| /bookings/history | Static | Authenticated User | Redirect alias to /profile/bookings-history. |

## Shared Role Gateway
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| /dashboard/[role] | Dynamic (role) | Shared Role Entry | Accepts admin, coach, facility, operator. admin role redirects to /admin/dashboard. |

## Coach Workspace
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| /coach | Static | Coach Role | Redirect alias to /coach/dashboard. |
| /coach/dashboard | Static | Coach Role | Coach workspace overview. |
| /coach/availability | Static | Coach Role | Availability management. |
| /coach/services | Static | Coach Role | Service catalog management. |
| /coach/bookings | Static | Coach Role | Coach booking operations. |
| /coach/reports | Static | Coach Role | Coach analytics and reporting. |
| /coach/profile | Static | Coach Role | Coach profile editor. |
| /coach/settings | Static | Coach Role | Coach settings and preferences. |

## Operator Workspace
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| /operator | Static | Operator Role | Redirect alias to /operator/dashboard. |
| /operator/dashboard | Static | Operator Role | Operator workspace overview. |
| /operator/approvals | Static | Operator Role | Approval queue and actions. |
| /operator/bookings | Static | Operator Role | Booking management. |
| /operator/branches | Static | Operator Role | Branch listing and management. |
| /operator/branches/[id] | Dynamic (id) | Operator Role | Branch detail and editor page. |
| /operator/courts | Static | Operator Role | Court listing and management. |
| /operator/courts/[id] | Dynamic (id) | Operator Role | Court detail and editor page. |
| /operator/schedule | Static | Operator Role | Scheduling and closure management. |
| /operator/reports | Static | Operator Role | Revenue and usage reports. |
| /operator/staff | Static | Operator Role | Staff and role management. |
| /operator/profile | Static | Operator Role | Operator profile editor. |
| /operator/settings | Static | Operator Role | Operator settings and policies. |

## Admin Workspace
| Route | Type | Access Intent | Notes |
| --- | --- | --- | --- |
| /admin | Static | Admin Role | Redirect alias to /admin/dashboard. |
| /admin/dashboard | Static | Admin Role | Admin overview dashboard. |
| /admin/users | Static | Admin Role | User management list. |
| /admin/users/[userId] | Dynamic (userId) | Admin Role | User details page. |
| /admin/users/[userId]/edit | Dynamic (userId) | Admin Role | User editing workflow. |
| /admin/facilities | Static | Admin Role | Facility management. |
| /admin/coaches | Static | Admin Role | Coach management. |
| /admin/verification | Static | Admin Role | Verification queue. |
| /admin/verification/[caseId] | Dynamic (caseId) | Admin Role | Verification case detail page. |
| /admin/bookings | Static | Admin Role | Platform booking management. |
| /admin/coupons | Static | Admin Role | Coupon listing and controls. |
| /admin/coupons/create | Static | Admin Role | Coupon creation flow. |
| /admin/finance | Static | Admin Role | Finance and transaction monitoring. |
| /admin/settings | Static | Admin Role | Platform settings. |
| /admin/sports | Static | Admin Role | Sports and category management. |
| /admin/sports/create | Static | Admin Role | Sports category creation flow. |
| /admin/localization | Static | Admin Role | Currency and localization settings. |
| /admin/reviews | Static | Admin Role | Review moderation. |
| /admin/audit | Static | Admin Role | Audit logs and tracking. |
| /admin/cms | Static | Admin Role | CMS, legal, and FAQ management. |
| /admin/reports | Static | Admin Role | Global platform reports. |
| /admin/store-management | Static | Admin Role | Marketplace/store operations. |

## Dynamic Route Parameters
- slug: coach profile and coach booking flow path segment.
- productId: store product detail path segment.
- teamId: team details path segment, generated at runtime from browser storage.
- role: shared role-gateway path segment.
- id: operator branch and court detail path segment.
- userId: admin user detail and edit path segment.
- caseId: admin verification case path segment.

## Canonical Redirect Notes
- /admin redirects to /admin/dashboard.
- /coach redirects to /coach/dashboard.
- /operator redirects to /operator/dashboard.
- /bookings redirects to /store.
- /bookings/history redirects to /profile/bookings-history.
- /dashboard/admin redirects to /admin/dashboard inside the role gateway page.

# SportBook

A modern sports booking platform with a Next.js frontend and Fastify backend.

## Architecture

- **Frontend**: Next.js 16 with React 19, Tailwind CSS
- **Backend**: Fastify + Prisma + SQLite (PostgreSQL for production)
- **Authentication**: JWT access tokens + HTTP-only refresh token cookies

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install dependencies for all workspaces
npm install
```

### Database Setup

```bash
# The database is SQLite (dev.db) - no external DB needed for development
# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

### Running the Application

```bash
# Run both frontend and backend
cd e:\GitHub\Sport-Book
npm run dev

# Or run separately:
npm run dev:api  # Backend on http://localhost:3001
npm run dev:web  # Frontend on http://localhost:3000
```

## Test Accounts

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sportbook.com | password123 |
| Operator | operator@sportbook.com | password123 |
| Coach | coach@sportbook.com | password123 |
| Player 1 | player1@example.com | password123 |
| Player 2 | player2@example.com | password123 |

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/send-request` - Request role upgrade (Coach/Operator)

### Users (Authenticated)
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update profile
- `GET /api/v1/users/me/preferences` - Get preferences
- `PATCH /api/v1/users/me/preferences` - Update preferences
- `GET /api/v1/users/me/wallet` - Get wallet
- `GET /api/v1/users/me/wallet/transactions` - Get transactions
- `GET /api/v1/users/me/favorites` - Get favorites
- `POST /api/v1/users/me/favorites` - Add favorite
- `DELETE /api/v1/users/me/favorites/:id` - Remove favorite
- `GET /api/v1/users/me/bookings` - Get my bookings
- `GET /api/v1/users/me/orders` - Get my store orders
- `GET /api/v1/users/me/notifications` - Get notifications
- `PATCH /api/v1/users/me/notifications/read-all` - Mark notifications read

### Public Discovery
- `GET /api/v1/sports` - List all sports
- `GET /api/v1/sports/:id` - Get sport details
- `GET /api/v1/facilities` - List facilities with filters
- `GET /api/v1/facilities/:id` - Get facility details
- `GET /api/v1/facilities/:id/branches` - Get facility branches
- `GET /api/v1/facilities/:id/reviews` - Get facility reviews
- `GET /api/v1/courts` - List courts with filters
- `GET /api/v1/courts/:id` - Get court details
- `GET /api/v1/courts/:id/slots` - Get availability slots
- `GET /api/v1/courts/:id/reviews` - Get court reviews
- `GET /api/v1/coaches` - List coaches with filters
- `GET /api/v1/coaches/:slug` - Get coach by slug
- `GET /api/v1/coaches/:slug/availability` - Get coach availability
- `GET /api/v1/coaches/:slug/services` - Get coach services
- `GET /api/v1/coaches/:slug/reviews` - Get coach reviews

### Bookings (Authenticated)
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `POST /api/v1/bookings/:id/cancel` - Cancel booking
- `POST /api/v1/bookings/:id/reschedule` - Reschedule booking
- `POST /api/v1/bookings/price-check` - Calculate price

### Payments (Authenticated)
- `POST /api/v1/payments/intent` - Create payment intent
- `POST /api/v1/payments/process` - Process Paymob payment
- `POST /api/v1/payments/wallet` - Pay with wallet
- `GET /api/v1/payments/:intentId` - Get payment status

### Reviews (Authenticated)
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews` - List reviews with filters
- `GET /api/v1/reviews/:id` - Get review details
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `POST /api/v1/reviews/:id/moderate` - Moderate review (admin/operator)
- `GET /api/v1/reviews/average/rating` - Get average rating

### Teams (Authenticated)
- `POST /api/v1/teams` - Create team post
- `GET /api/v1/teams` - List team posts
- `GET /api/v1/teams/:id` - Get team post details
- `POST /api/v1/teams/:id/join` - Request to join team
- `POST /api/v1/teams/requests/:requestId/respond` - Respond to join request
- `POST /api/v1/teams/:id/leave` - Leave team
- `POST /api/v1/teams/:id/cancel` - Cancel team post

### Store
- `GET /api/v1/store/products` - List products
- `GET /api/v1/store/products/:id` - Get product details
- `GET /api/v1/store/coupons` - List active coupons
- `POST /api/v1/store/orders` - Create order (authenticated)
- `GET /api/v1/store/orders` - List user orders (authenticated)
- `GET /api/v1/store/orders/:id` - Get order details (authenticated)

### Coach Workspace (Authenticated, Coach role)
- `GET /api/v1/coach-workspace/profile` - Get coach profile
- `PATCH /api/v1/coach-workspace/profile` - Update coach profile
- `POST /api/v1/coach-workspace/services` - Create service
- `PATCH /api/v1/coach-workspace/services/:id` - Update service
- `DELETE /api/v1/coach-workspace/services/:id` - Delete service
- `POST /api/v1/coach-workspace/availability` - Set availability
- `POST /api/v1/coach-workspace/availability/exception` - Set availability exception
- `GET /api/v1/coach-workspace/bookings` - Get coach bookings
- `GET /api/v1/coach-workspace/earnings` - Get coach earnings

### Operator Workspace (Authenticated, Operator role)
- `GET /api/v1/operator-workspace/facility` - Get operator's facility
- `PATCH /api/v1/operator-workspace/facility` - Update facility
- `GET /api/v1/operator-workspace/bookings` - Get operator's bookings
- `GET /api/v1/operator-workspace/revenue` - Get operator's revenue
- `GET /api/v1/operator-workspace/courts` - Get operator's courts
- `POST /api/v1/operator-workspace/courts` - Create court
- `PATCH /api/v1/operator-workspace/courts/:id` - Update court
- `DELETE /api/v1/operator-workspace/courts/:id` - Delete court
- `POST /api/v1/operator-workspace/courts/pricing-rules` - Create pricing rule
- `POST /api/v1/operator-workspace/courts/closures` - Create court closure

### Admin Workspace (Authenticated, Admin role)
- `GET /api/v1/admin-workspace/dashboard` - Get dashboard stats
- `GET /api/v1/admin-workspace/users` - List users
- `GET /api/v1/admin-workspace/users/:id` - Get user details
- `PATCH /api/v1/admin-workspace/users/:id` - Update user
- `GET /api/v1/admin-workspace/role-upgrades` - List role upgrade requests
- `POST /api/v1/admin-workspace/role-upgrades/:id/respond` - Respond to role upgrade
- `GET /api/v1/admin-workspace/audit-logs` - List audit logs
- `GET /api/v1/admin-workspace/facilities` - List facilities
- `GET /api/v1/admin-workspace/coaches` - List coaches

## Project Structure

```
Sport-Book/
├── api/                    # Fastify backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── src/
│       ├── config/         # Environment config
│       ├── lib/            # Utilities (prisma, crypto)
│       ├── modules/        # Feature modules
│       │   ├── auth/       # Authentication
│       │   └── users/      # User management
│       ├── plugins/        # Fastify plugins
│       ├── app.ts          # App factory
│       └── main.ts         # Entry point
├── web/                    # Next.js frontend
│   └── src/
│       ├── app/            # Pages
│       ├── components/     # React components
│       └── lib/            # Utilities
└── package.json            # Workspace root
```

## Implementation Status

### Completed
- [x] Monorepo workspace setup
- [x] Fastify API scaffold with plugins
- [x] Prisma schema (SQLite-compatible)
- [x] Database migrations and seeding
- [x] Auth module (login, register, logout, refresh, role upgrade)
- [x] Users module (profile, wallet, favorites, notifications, bookings, orders)
- [x] Public Discovery module (sports, facilities, courts, coaches)
- [x] Bookings module (create, list, cancel, reschedule, price check)
- [x] Payments module (Paymob integration, wallet payments)
- [x] Reviews module (create, list, moderate, average rating)
- [x] Teams module (create team posts, join requests, member management)
- [x] Store module (products, orders, coupons)
- [x] Coach workspace (profile, services, availability, bookings, earnings)
- [x] Operator workspace (facility management, court management, revenue tracking)
- [x] Admin control plane (user management, role approvals, analytics, audit logs)

### In Progress / Next Steps
- [ ] Frontend API integration
- [ ] Testing
- [ ] Documentation

## Environment Variables

Create `api/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_DAYS="7"
WEB_ORIGIN="http://localhost:3000"
PORT="3001"
HOST="0.0.0.0"
NODE_ENV="development"
```

## Scripts

```bash
npm run dev          # Run both API and web
npm run dev:api      # Run API only
npm run dev:web      # Run web only
npm run build        # Build both
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

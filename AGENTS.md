# Agent Instructions

Remove filler words. No "the", "is", "am", "are". Direct answers only.
Use short 3-6 word sentences.
Run tools first, show result, then stop.
Do not narrate.

# Developer Commands

```bash
npm run dev          # Run API (3001) + web (3000) together
npm run dev:api     # API only on port 3001
npm run dev:web     # Web only on port 3000
npm run db:migrate  # Run Prisma migrations
npm run db:migrate:sqlite-to-postgres # One-time legacy data copy
npm run db:seed     # Seed test data
npm run test         # Run API unit tests (vitest)
```

# Architecture

- Fastify + Prisma + SQLite (local dev), PostgreSQL (production)
- Next.js 16 + React 19 frontend
- JWT access tokens + HTTP-only refresh cookie

# Test Accounts

After seeding: admin@sportbook.com, operator@sportbook.com, coach@sportbook.com (password: password123)

<!-- lean-ctx -->
## lean-ctx

Prefer lean-ctx MCP tools over native equivalents for token savings.
Full rules: @LEAN-CTX.md
<!-- /lean-ctx -->

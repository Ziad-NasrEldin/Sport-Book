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

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

# SportBook

Book courts, coaches, and teams from one sports marketplace — players play, operators run facilities, coaches sell sessions.

Built for sports facilities and the people who use them: players who want a slot, coaches who sell time, and operators who need bookings and revenue in one place.

- Discover nearby courts by sport, date, and availability
- Book a court or a coach session, pay with wallet or Paymob
- Join or post a team, shop the store, and keep a booking history
- Operators manage courts, pricing, and staff; coaches manage services and earnings
- Admins approve roles, moderate reviews, and watch the control plane

## Run locally

Needs Node.js 20.11+ and the node package manager. There is no public site on this repo.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Web: [http://localhost:3000](http://localhost:3000) · API: [http://localhost:3001](http://localhost:3001)

Seeded roles, env vars, and the API map live in [`docs/local-setup.md`](docs/local-setup.md).

## How it works

A Next.js 16 app talks to a Fastify API. Prisma uses SQLite for local work and PostgreSQL in production. JWT access tokens plus HTTP-only refresh cookies cover auth. Players, coaches, operators, and admins each get their own workspace.

---

Built by [Ziad Ahmed](https://github.com/Ziad-NasrEldin) at [MaVoid](https://mavoid.com).

[Website](https://mavoid.com) · [LinkedIn](https://linkedin.com/in/ziad-ahmed-634202332) · [GitHub](https://github.com/Ziad-NasrEldin)

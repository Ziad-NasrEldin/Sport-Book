# Docker Files Summary

## Created Files

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-target production image for API and web |
| `docker-compose.yml` | Runs PostgreSQL, API, and web containers |
| `.dockerignore` | Keeps local build artifacts and secrets out of Docker context |
| `.env.example` | Production environment template |
| `nginx.conf.example` | HTTPS reverse proxy for web and API |
| `setup-docker.sh` | Ubuntu VPS setup script |
| `DOCKER_DEPLOYMENT.md` | Step-by-step deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Operator deployment checklist |
| `NGINX_ADVANCED_CONFIG.md` | Multi-app and advanced Nginx patterns |

## Architecture

```text
Browser
  |
  | HTTPS
  v
Nginx :443
  |-- /          -> 127.0.0.1:3000 -> sportbook-web
  |-- /api/v1/   -> 127.0.0.1:3001 -> sportbook-api
  |-- /health    -> 127.0.0.1:3001 -> sportbook-api

sportbook-api -> sportbook-postgres:5432
```

## Commands

```bash
cp .env.example .env
docker compose build
docker compose up -d
docker compose logs -f
```

## Security Features

- Non-root users inside API and web images
- Host-only port bindings for app containers
- HTTPS redirect in Nginx
- HSTS, frame, content-type, referrer, permissions, and CSP headers
- API rate limit zone at Nginx layer
- PostgreSQL data kept in Docker volume

## Performance Notes

- Next.js standalone output reduces web image size.
- `_next/static` assets cache for 60 days.
- Gzip enabled at Nginx.
- Docker build cache uses package manifests before source copy.

## Important Runtime Notes

- Local Prisma provider is SQLite; Docker production path uses PostgreSQL schema.
- Default production database points to `sportbook-postgres`.
- API migrations run during container startup.
- Browser API URL should stay `/api/v1` for same-domain deployment.

# SportBook VPS Docker Deployment

SportBook deploys as two Docker containers behind host Nginx:

| Service | Container | Internal port | Host bind |
| --- | --- | --- | --- |
| Next.js web | sportbook-web | 3000 | 127.0.0.1:3000 |
| Fastify API | sportbook-api | 3001 | 127.0.0.1:3001 |
| SQLite data | sportbook-data volume | /data/sportbook.db | Docker volume |

## Prerequisites

- Ubuntu 22.04 or 24.04 VPS
- Domain DNS A record pointing to VPS IP
- Docker Engine and Docker Compose plugin
- Nginx
- Certbot
- Git

Run base setup:

```bash
sudo bash setup-docker.sh
```

## Step 1/7: Upload Code

```bash
sudo mkdir -p /opt/sportbook
sudo chown -R "$USER:$USER" /opt/sportbook
cd /opt/sportbook
git clone <your-repo-url> .
```

## Step 2/7: Configure Environment

```bash
cp .env.example .env
nano .env
```

Required values:

| Variable | Purpose |
| --- | --- |
| DOMAIN | Public hostname |
| NEXT_PUBLIC_SITE_URL | Canonical web URL |
| NEXT_PUBLIC_API_URL | Browser API path, use `/api/v1` for same-domain Nginx |
| WEB_ORIGIN | Allowed browser origin |
| DATABASE_URL | SQLite file path inside container |
| JWT_SECRET | 32+ char signing secret |
| SMTP_* | Email provider credentials |
| PAYMOB_* | Payment provider credentials |

Generate JWT secret:

```bash
openssl rand -base64 48
```

## Step 3/7: Build Containers

```bash
docker compose build
```

## Step 4/7: Start App

```bash
docker compose up -d
docker compose ps
docker compose logs -f api
```

API container runs Prisma migrations before starting Fastify.

Seed test data only when needed:

```bash
docker compose exec api npm run db:seed
```

## Step 5/7: Configure Nginx

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/sportbook
sudo sed -i 's/sportbook.example.com/your-domain.com/g' /etc/nginx/sites-available/sportbook
sudo ln -s /etc/nginx/sites-available/sportbook /etc/nginx/sites-enabled/sportbook
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6/7: Enable SSL

```bash
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

## Step 7/7: Verify Deployment

```bash
curl -I https://your-domain.com
curl https://your-domain.com/health
curl https://your-domain.com/api/v1/health
docker compose ps
```

Expected API health response:

```json
{"status":"ok","timestamp":"2026-04-21T00:00:00.000Z"}
```

## Database Management

SQLite database lives in Docker volume `sportbook-data`.

Backup:

```bash
mkdir -p backups
docker compose exec api sh -c 'cp /data/sportbook.db /tmp/sportbook.db'
docker cp sportbook-api:/tmp/sportbook.db "backups/sportbook-$(date +%F-%H%M).db"
```

Restore:

```bash
docker compose down
docker run --rm -v sportbook_sportbook-data:/data -v "$PWD/backups:/backups" alpine cp /backups/sportbook.db /data/sportbook.db
docker compose up -d
```

PostgreSQL note: current Prisma schema uses SQLite. Move to PostgreSQL only after changing `api/prisma/schema.prisma`, regenerating migrations, and testing migration flow.

## Updates

```bash
cd /opt/sportbook
git pull
docker compose build
docker compose up -d
docker compose logs -f --tail=100
```

## Logs

```bash
docker compose logs -f api
docker compose logs -f web
sudo tail -f /var/log/nginx/sportbook.error.log
```

## Troubleshooting

Build fails:

```bash
docker compose build --no-cache
```

Nginx config invalid:

```bash
sudo nginx -t
sudo journalctl -u nginx -n 100 --no-pager
```

API unhealthy:

```bash
docker compose logs api
docker compose exec api sh
```

Migrations fail:

```bash
docker compose exec api npx prisma migrate status
docker compose exec api npx prisma migrate deploy
```

CORS or cookies fail:

- Confirm `WEB_ORIGIN=https://your-domain.com`
- Confirm browser calls `/api/v1`
- Confirm SSL active
- Confirm Nginx proxies `/api/v1/` to API

## Security

- Keep ports 3000 and 3001 bound to `127.0.0.1`
- Use HTTPS only
- Rotate JWT secret after compromise
- Keep `.env` out of Git
- Back up SQLite before updates
- Run `docker compose pull` monthly for base image updates

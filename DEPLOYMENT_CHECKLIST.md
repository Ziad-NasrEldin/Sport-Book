# SportBook Deployment Checklist

## Pre-Deployment

- [ ] Domain DNS points to VPS IP.
- [ ] VPS runs Ubuntu 22.04 or 24.04.
- [ ] Repo uploaded to `/opt/sportbook`.
- [ ] `setup-docker.sh` completed successfully.
- [ ] Ports 80 and 443 open.

## Environment

- [ ] `.env` created from `.env.example`.
- [ ] `DOMAIN` set to real domain.
- [ ] `NEXT_PUBLIC_SITE_URL` set to HTTPS URL.
- [ ] `NEXT_PUBLIC_API_URL=/api/v1`.
- [ ] `WEB_ORIGIN` set to HTTPS URL.
- [ ] `JWT_SECRET` generated with `openssl rand -base64 48`.
- [ ] SMTP variables configured.
- [ ] Paymob variables configured.

## Docker

- [ ] `docker compose config` passes.
- [ ] `docker compose build` passes.
- [ ] `docker compose up -d` starts containers.
- [ ] `docker compose ps` shows healthy API.
- [ ] `docker compose logs api` shows migrations applied.
- [ ] `docker compose logs web` shows Next.js ready.

## Nginx

- [ ] `nginx.conf.example` copied to `/etc/nginx/sites-available/sportbook`.
- [ ] Placeholder domain replaced.
- [ ] Site symlinked into `/etc/nginx/sites-enabled`.
- [ ] `sudo nginx -t` passes.
- [ ] Nginx reloaded.

## SSL

- [ ] `sudo certbot --nginx -d your-domain.com` completed.
- [ ] HTTP redirects to HTTPS.
- [ ] `sudo certbot renew --dry-run` passes.
- [ ] Browser shows valid certificate.

## Post-Deployment

- [ ] `https://your-domain.com` loads.
- [ ] `https://your-domain.com/health` returns OK.
- [ ] `https://your-domain.com/api/v1/health` returns OK.
- [ ] Login works.
- [ ] Refresh cookie works after page reload.
- [ ] Admin, operator, coach flows tested.
- [ ] Payment test flow checked.

## Security

- [ ] `.env` permissions restricted.
- [ ] SSH password login disabled.
- [ ] Firewall allows only SSH, HTTP, HTTPS.
- [ ] Docker ports bind to `127.0.0.1`.
- [ ] Nginx security headers present.
- [ ] Default Nginx site disabled if unused.

## Backup

- [ ] SQLite backup command tested.
- [ ] Restore process tested on staging or fresh volume.
- [ ] Backup directory excluded from public web paths.
- [ ] Backup retention policy documented.

## Maintenance

- [ ] Update process documented.
- [ ] Log locations documented.
- [ ] Certbot timer active.
- [ ] Monthly dependency and image update window scheduled.

# Nginx Advanced Config

## Same-Domain Routing

Best default for SportBook:

```nginx
location /api/v1/ {
    proxy_pass http://127.0.0.1:3001/api/v1/;
}

location / {
    proxy_pass http://127.0.0.1:3000;
}
```

Use:

```env
NEXT_PUBLIC_API_URL=/api/v1
WEB_ORIGIN=https://sportbook.example.com
```

## API Subdomain

Use when API must live at `api.sportbook.example.com`.

```nginx
server {
    listen 443 ssl http2;
    server_name api.sportbook.example.com;

    ssl_certificate /etc/letsencrypt/live/api.sportbook.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sportbook.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use:

```env
NEXT_PUBLIC_API_URL=https://api.sportbook.example.com/api/v1
WEB_ORIGIN=https://sportbook.example.com
```

## Multiple Apps On One VPS

Assign each app unique localhost ports:

| App | Web port | API port |
| --- | --- | --- |
| SportBook | 3000 | 3001 |
| CRM | 3100 | 3101 |
| Admin | 3200 | 3201 |

Change compose bindings:

```yaml
ports:
  - "127.0.0.1:3100:3000"
```

Then point each Nginx server block at matching localhost port.

## Load Balancing

For multiple web replicas:

```nginx
upstream sportbook_web {
    server 127.0.0.1:3000;
    server 127.0.0.1:3002;
}

location / {
    proxy_pass http://sportbook_web;
}
```

SQLite limits horizontal API scaling because one file backs writes. Move to PostgreSQL before multiple API replicas.

## Certbot Multiple Domains

```bash
sudo certbot --nginx \
  -d sportbook.example.com \
  -d www.sportbook.example.com
```

## Common Issues

502 Bad Gateway:

```bash
docker compose ps
sudo tail -f /var/log/nginx/sportbook.error.log
```

Mixed content:

- Confirm `NEXT_PUBLIC_SITE_URL` uses HTTPS.
- Rebuild web container after env changes.

Cookie not stored:

- Confirm HTTPS.
- Confirm `WEB_ORIGIN` exact scheme and domain.
- Confirm browser requests same domain `/api/v1`.

#!/usr/bin/env bash
set -euo pipefail

APP_USER="${APP_USER:-sportbook}"
APP_DIR="${APP_DIR:-/opt/sportbook}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash setup-docker.sh"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release nginx ufw

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

if [[ ! -f /etc/apt/sources.list.d/docker.list ]]; then
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" > /etc/apt/sources.list.d/docker.list
fi

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin certbot python3-certbot-nginx

if ! id "${APP_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${APP_USER}"
fi

usermod -aG docker "${APP_USER}"
mkdir -p "${APP_DIR}" /var/www/certbot
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

systemctl enable --now docker nginx

cat <<EOF
VPS base setup complete.

Next steps:
1. Upload repo to ${APP_DIR}
2. cp .env.example .env
3. Edit .env with production values
4. docker compose build
5. docker compose up -d
6. Copy nginx.conf.example to /etc/nginx/sites-available/sportbook
7. Replace sportbook.example.com with real domain
8. sudo ln -s /etc/nginx/sites-available/sportbook /etc/nginx/sites-enabled/sportbook
9. sudo nginx -t && sudo systemctl reload nginx
10. sudo certbot --nginx -d your-domain.com
EOF

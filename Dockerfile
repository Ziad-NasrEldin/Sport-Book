# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl dumb-init
COPY package.json package-lock.json ./
COPY api/package.json api/package-lock.json ./api/
COPY web/package.json web/package-lock.json ./web/
RUN npm ci --include-workspace-root

FROM base AS api-build
COPY api ./api
WORKDIR /app/api
RUN npm run db:generate && npm run build

FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
RUN apk add --no-cache openssl dumb-init wget \
  && addgroup -S sportbook \
  && adduser -S sportbook -G sportbook \
  && mkdir -p /data \
  && chown -R sportbook:sportbook /data
COPY package.json package-lock.json ./
COPY api/package.json api/package-lock.json ./api/
RUN npm ci --omit=dev --workspace=api --include-workspace-root && npm cache clean --force
COPY --from=api-build --chown=sportbook:sportbook /app/api/dist ./api/dist
COPY --from=api-build --chown=sportbook:sportbook /app/api/prisma ./api/prisma
WORKDIR /app/api
RUN npm run db:generate
USER sportbook
EXPOSE 3001
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health >/dev/null || exit 1
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

FROM base AS web-build
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_SITE_URL=https://sportbook.example.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY web ./web
WORKDIR /app/web
RUN npm run build

FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache dumb-init wget \
  && addgroup -S nextjs \
  && adduser -S nextjs -G nextjs
COPY --from=web-build --chown=nextjs:nextjs /app/web/.next/standalone ./
COPY --from=web-build --chown=nextjs:nextjs /app/web/.next/static ./web/.next/static
COPY --from=web-build --chown=nextjs:nextjs /app/web/public ./web/public
USER nextjs
WORKDIR /app/web
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["dumb-init", "node", "server.js"]

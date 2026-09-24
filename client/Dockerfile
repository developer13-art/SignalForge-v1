# =============================================================
# SignalForge AI - Client Dockerfile
# =============================================================

# -------------------------------------------------------------
# Base Stage
# -------------------------------------------------------------
FROM node:20.11.1-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm@9.1.0

# -------------------------------------------------------------
# Dependencies Stage
# -------------------------------------------------------------
FROM base AS dependencies

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile --filter @signalforge/client...

# -------------------------------------------------------------
# Development Stage
# -------------------------------------------------------------
FROM base AS development

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/client/node_modules ./client/node_modules
COPY --from=dependencies /app/shared/node_modules ./shared/node_modules

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY shared ./shared
COPY client ./client

WORKDIR /app/client

EXPOSE 3000

CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# -------------------------------------------------------------
# Build Stage
# -------------------------------------------------------------
FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/client/node_modules ./client/node_modules
COPY --from=dependencies /app/shared/node_modules ./shared/node_modules

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY shared ./shared
COPY client ./client

WORKDIR /app/client

RUN pnpm build

# -------------------------------------------------------------
# Production Stage
# -------------------------------------------------------------
FROM nginx:1.27-alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/client/dist /usr/share/nginx/html

COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
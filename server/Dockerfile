# =============================================================
# SignalForge AI - Server Dockerfile
# =============================================================
# Multi-stage build with development and production targets.
# =============================================================

# -------------------------------------------------------------
# Base stage
# -------------------------------------------------------------
FROM node:20.11.1-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production

RUN apk add --no-cache \
      bash \
      curl \
      dumb-init \
      tini \
      python3 \
      make \
      g++ \
    && corepack enable \
    && corepack prepare pnpm@9.1.0 --activate

WORKDIR /app

# -------------------------------------------------------------
# Dependencies stage
# -------------------------------------------------------------
FROM base AS deps

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile --prod=false --filter @signalforge/server... --filter @signalforge/shared...

# -------------------------------------------------------------
# Development stage
# -------------------------------------------------------------
FROM base AS development

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

COPY pnpm-workspace.yaml package.json ./
COPY shared ./shared
COPY server ./server

WORKDIR /app/server

EXPOSE 4000

CMD ["pnpm", "dev"]

# -------------------------------------------------------------
# Build stage
# -------------------------------------------------------------
FROM deps AS build

COPY pnpm-workspace.yaml package.json ./
COPY shared ./shared
COPY server ./server

RUN pnpm --filter @signalforge/shared build || true
RUN pnpm --filter @signalforge/server build || true

# -------------------------------------------------------------
# Production stage
# -------------------------------------------------------------
FROM base AS production

ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

COPY pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/
COPY shared/src ./shared/src
COPY server/package.json ./server/
COPY server/src ./server/src
COPY server/scripts ./server/scripts

WORKDIR /app/server

RUN mkdir -p logs && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:4000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "src/index.js"]
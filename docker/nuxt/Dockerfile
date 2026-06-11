# =============================================================================
# craft-nuxt-starter — Nuxt 4 image
# Build context: project root
# =============================================================================

FROM node:22-alpine AS base

ENV APP_ROOT=/app/frontend
WORKDIR ${APP_ROOT}

# -----------------------------------------------------------------------------
# dev — install deps; source is bind-mounted at runtime
# -----------------------------------------------------------------------------
FROM base AS dev

# Manifests only — this layer is cached until deps change
COPY frontend/package.json frontend/package-lock.json* ./

RUN npm install --no-audit --no-fund

ENV HOST=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=development \
    NUXT_TELEMETRY_DISABLED=1

# 3000  — Nuxt dev server
# 24678 — Vite HMR websocket
EXPOSE 3000 24678

CMD ["npm", "run", "dev"]

# -----------------------------------------------------------------------------
# builder + prod — production build (not used in dev; here for when you deploy)
# -----------------------------------------------------------------------------
FROM base AS builder

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY frontend/ .

ARG NUXT_PUBLIC_GQL_API_HOST
ENV NUXT_PUBLIC_GQL_API_HOST=${NUXT_PUBLIC_GQL_API_HOST}

RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

FROM node:22-alpine AS prod

WORKDIR /app

COPY --from=builder /app/frontend/.output ./

ENV HOST=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["node", "server/index.mjs"]

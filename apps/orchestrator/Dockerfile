# Build context is the repo root — see apps/api/Dockerfile for why.
#   docker build -f apps/orchestrator/Dockerfile -t exploityard-orchestrator .
FROM node:20-alpine AS base
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/orchestrator/package.json apps/orchestrator/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY infra/package.json infra/package.json
RUN npm ci

COPY . .
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npx prisma generate --schema=infra/prisma/schema.prisma
RUN npm run build --workspace=packages/shared

WORKDIR /repo/apps/orchestrator
ENV NODE_ENV=production
EXPOSE 4100
CMD ["npx", "tsx", "src/index.ts"]

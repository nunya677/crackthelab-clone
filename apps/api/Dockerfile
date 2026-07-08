# Build context is the repo root (this is an npm-workspaces monorepo, so the
# image needs access to packages/shared and infra, not just apps/api).
#   docker build -f apps/api/Dockerfile -t exploityard-api .
FROM node:20-alpine AS base
WORKDIR /repo

# Install all workspace deps once. Copying just the package.json files first
# (not the source) lets Docker cache this layer until dependencies change.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/orchestrator/package.json apps/orchestrator/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY infra/package.json infra/package.json
RUN npm ci

# Now bring in the actual source and generate the Prisma client. `prisma
# generate` only needs the schema file, not a live DB connection, but the
# CLI still wants DATABASE_URL to be set to *something* syntactically valid.
COPY . .
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN npx prisma generate --schema=infra/prisma/schema.prisma

# packages/shared has an actual build step (dist output); apps/api and
# apps/orchestrator don't (@crackthelab/db's `main` points straight at
# TypeScript source), so both run via tsx at runtime instead of node+tsc —
# same execution model as local dev, just without --watch.
RUN npm run build --workspace=packages/shared

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]

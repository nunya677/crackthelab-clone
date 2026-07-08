import { PrismaClient } from '../generated/client/index.js';

export * from '../generated/client/index.js';
export * from './flag.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Reuse a single PrismaClient across hot reloads in dev instead of exhausting
// the Postgres connection pool with a new client per reload.
export const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

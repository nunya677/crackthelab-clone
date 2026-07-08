import { createHash } from 'node:crypto';

// Flags are stored as sha256 hashes so the plaintext flag is never readable
// from the database (e.g. via a Prisma Studio browse or a DB dump leak).
export function hashFlag(flag: string): string {
  return createHash('sha256').update(flag.trim()).digest('hex');
}

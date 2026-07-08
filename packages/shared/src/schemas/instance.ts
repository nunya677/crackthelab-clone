import { z } from 'zod';

export const instanceSchema = z.object({
  id: z.string(),
  challengeId: z.string(),
  status: z.enum(['STARTING', 'RUNNING', 'STOPPED', 'EXPIRED']),
  url: z.string().nullable(),
  startedAt: z.string(),
  expiresAt: z.string(),
});
export type Instance = z.infer<typeof instanceSchema>;

// Internal request from apps/api -> apps/orchestrator (not exposed to the browser)
export const createInstanceRequestSchema = z.object({
  userId: z.string(),
  challengeId: z.string(),
  dockerImage: z.string(),
});
export type CreateInstanceRequest = z.infer<typeof createInstanceRequestSchema>;

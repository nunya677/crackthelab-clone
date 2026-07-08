import { z } from 'zod';

export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string(),
  points: z.number().int().nonnegative(),
  solves: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

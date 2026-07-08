import { z } from 'zod';

export const challengeSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  categorySlug: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  points: z.number().int().positive(),
  type: z.enum(['STATIC', 'LIVE']),
  solved: z.boolean(),
  solveCount: z.number().int().nonnegative(),
  isPremium: z.boolean(),
  // True when this challenge is premium and the requester isn't on a PRO
  // plan. Submitting a flag or starting an instance is rejected server-side
  // regardless of this flag — it's purely for the UI to show a lock state.
  locked: z.boolean(),
});
export type ChallengeSummary = z.infer<typeof challengeSummarySchema>;

export const challengeDetailSchema = challengeSummarySchema.extend({
  description: z.string(),
  lessonSlug: z.string().nullable(),
});
export type ChallengeDetail = z.infer<typeof challengeDetailSchema>;

export const submitFlagSchema = z.object({
  flag: z.string().min(1).max(256),
});
export type SubmitFlagInput = z.infer<typeof submitFlagSchema>;

export const submitFlagResultSchema = z.object({
  correct: z.boolean(),
  alreadySolved: z.boolean(),
  pointsAwarded: z.number().int().nonnegative(),
});
export type SubmitFlagResult = z.infer<typeof submitFlagResultSchema>;

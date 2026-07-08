import { z } from 'zod';

export const lessonSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  categorySlug: z.string(),
  summary: z.string(),
  challengeSlugs: z.array(z.string()),
});
export type LessonSummary = z.infer<typeof lessonSummarySchema>;

export const relatedChallengeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  points: z.number().int().positive(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
});
export type RelatedChallenge = z.infer<typeof relatedChallengeSchema>;

export const lessonDetailSchema = lessonSummarySchema.extend({
  content: z.string(),
  relatedChallenges: z.array(relatedChallengeSchema),
});
export type LessonDetail = z.infer<typeof lessonDetailSchema>;

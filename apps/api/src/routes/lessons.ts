import { Router } from 'express';
import { prisma } from '@crackthelab/db';
import type { Prisma } from '@crackthelab/db';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';

export const lessonsRouter = Router();

const lessonListQuery = {
  include: {
    category: true,
  },
  orderBy: [
    { category: { name: 'asc' } },
    { title: 'asc' },
  ],
} satisfies Prisma.LessonFindManyArgs;

type LessonListItem = Prisma.LessonGetPayload<typeof lessonListQuery>;

lessonsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const lessons = await prisma.lesson.findMany(lessonListQuery);

    res.json(
      lessons.map((l: LessonListItem) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        categorySlug: l.category.slug,
        summary: l.summary,
        challengeSlugs: l.challengeSlugs,
      })),
    );
  }),
);

lessonsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const lesson = await prisma.lesson.findUnique({
  where: {
    slug: req.params.slug as string,
  },
  include: {
    category: true,
  },
});

    if (!lesson) {
      throw new HttpError(404, 'Lesson not found');
    }

    const relatedChallenges = await prisma.challenge.findMany({
      where: {
        slug: { in: lesson.challengeSlugs },
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        points: true,
        difficulty: true,
      },
    });

    res.json({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      categorySlug: lesson.category.slug,
      summary: lesson.summary,
      challengeSlugs: lesson.challengeSlugs,
      content: lesson.content,
      relatedChallenges,
    });
  }),
);
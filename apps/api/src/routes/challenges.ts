import { Router } from 'express';
import { prisma, hashFlag } from '@crackthelab/db';
import { submitFlagSchema } from '@crackthelab/shared';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { getLeaderboard } from '../services/leaderboard.js';
import { emitLeaderboardUpdated } from '../lib/socket.js';

export const challengesRouter = Router();

async function getRequesterPlan(userId: string | undefined): Promise<'FREE' | 'PRO'> {
  if (!userId) return 'FREE';
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  return user?.plan ?? 'FREE';
}

challengesRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user?.sub;
    const plan = await getRequesterPlan(userId);
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      include: {
        category: true,
        solves: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { solves: true } },
      },
      orderBy: [{ category: { name: 'asc' } }, { points: 'asc' }],
    });

    res.json(
      challenges.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        categorySlug: c.category.slug,
        difficulty: c.difficulty,
        points: c.points,
        type: c.type,
        solved: userId ? c.solves.length > 0 : false,
        solveCount: c._count.solves,
        isPremium: c.isPremium,
        locked: c.isPremium && plan !== 'PRO',
      })),
    );
  }),
);

challengesRouter.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user?.sub;
    const plan = await getRequesterPlan(userId);
    const c = await prisma.challenge.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        solves: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { solves: true } },
      },
    });
    if (!c || !c.isActive) throw new HttpError(404, 'Challenge not found');

    const lesson = await prisma.lesson.findFirst({
      where: { challengeSlugs: { has: c.slug } },
      select: { slug: true },
    });

    res.json({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      categorySlug: c.category.slug,
      difficulty: c.difficulty,
      points: c.points,
      type: c.type,
      solved: userId ? c.solves.length > 0 : false,
      solveCount: c._count.solves,
      isPremium: c.isPremium,
      locked: c.isPremium && plan !== 'PRO',
      lessonSlug: lesson?.slug ?? null,
    });
  }),
);

challengesRouter.post(
  '/:id/submit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const { flag } = submitFlagSchema.parse(req.body);

    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });
    if (!challenge || !challenge.isActive) throw new HttpError(404, 'Challenge not found');

    if (challenge.isPremium && (await getRequesterPlan(userId)) !== 'PRO') {
      throw new HttpError(403, 'This challenge requires a PRO subscription — upgrade to unlock it.');
    }

    const existingSolve = await prisma.solve.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
    });

    const correct = hashFlag(flag) === challenge.flagHash;

    await prisma.submission.create({
      data: { userId, challengeId: challenge.id, submittedFlag: flag, correct },
    });

    if (!correct) {
      res.json({ correct: false, alreadySolved: !!existingSolve, pointsAwarded: 0 });
      return;
    }

    if (existingSolve) {
      res.json({ correct: true, alreadySolved: true, pointsAwarded: 0 });
      return;
    }

    // Race-safe: unique(userId, challengeId) on Solve rejects a concurrent
    // duplicate; treat that as "already solved" rather than an error.
    try {
      await prisma.solve.create({
        data: { userId, challengeId: challenge.id, points: challenge.points },
      });
    } catch {
      res.json({ correct: true, alreadySolved: true, pointsAwarded: 0 });
      return;
    }

    res.json({ correct: true, alreadySolved: false, pointsAwarded: challenge.points });
    emitLeaderboardUpdated(await getLeaderboard());
  }),
);

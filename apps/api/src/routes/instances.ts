import { Router } from 'express';
import { prisma } from '@crackthelab/db';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { createInstance, stopInstance } from '../services/orchestratorClient.js';

export const instancesRouter = Router();

function toInstanceDto(i: {
  id: string;
  challengeId: string;
  status: string;
  url: string | null;
  startedAt: Date;
  expiresAt: Date;
}) {
  return {
    id: i.id,
    challengeId: i.challengeId,
    status: i.status,
    url: i.url,
    startedAt: i.startedAt.toISOString(),
    expiresAt: i.expiresAt.toISOString(),
  };
}

instancesRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const instances = await prisma.instance.findMany({
      where: { userId: req.user!.sub, status: { in: ['STARTING', 'RUNNING'] } },
      orderBy: { startedAt: 'desc' },
    });
    res.json(instances.map(toInstanceDto));
  }),
);

instancesRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const challengeId = String(req.body?.challengeId ?? '');
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge || !challenge.isActive) throw new HttpError(404, 'Challenge not found');
    if (challenge.type !== 'LIVE' || !challenge.dockerImage) {
      throw new HttpError(400, 'Challenge does not have a live instance');
    }

    if (challenge.isPremium) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      if (user?.plan !== 'PRO') {
        throw new HttpError(403, 'This challenge requires a PRO subscription — upgrade to unlock it.');
      }
    }

    const instance = await createInstance(userId, challenge.id, challenge.dockerImage);
    res.status(201).json(instance);
  }),
);

instancesRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const instance = await prisma.instance.findUnique({ where: { id: req.params.id } });
    if (!instance || instance.userId !== req.user!.sub) {
      throw new HttpError(404, 'Instance not found');
    }
    const updated = await stopInstance(instance.id);
    res.json(updated);
  }),
);

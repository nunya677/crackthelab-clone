import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { getLeaderboard } from '../services/leaderboard.js';

export const leaderboardRouter = Router();

leaderboardRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await getLeaderboard());
  }),
);

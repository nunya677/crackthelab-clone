import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { authRouter } from './routes/auth.js';
import { challengesRouter } from './routes/challenges.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { instancesRouter } from './routes/instances.js';
import { lessonsRouter } from './routes/lessons.js';
import { billingRouter } from './routes/billing.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  // env.corsOrigins is webOrigin plus anything in EXTRA_CORS_ORIGINS (e.g. an
  // ngrok tunnel URL) — set that env var instead of hardcoding tunnel URLs
  // here, since they change every time the tunnel restarts.
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
  // Generous enough for normal browsing (including polling), but a bulk
  // scraper hammering every challenge/lesson slug in a loop hits this fast.
  const contentLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 300 });

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/challenges', contentLimiter, challengesRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/instances', instancesRouter);
  app.use('/api/lessons', contentLimiter, lessonsRouter);
  app.use('/api/billing', billingRouter);

  app.use(errorHandler);

  return app;
}

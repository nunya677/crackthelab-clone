import { Router } from 'express';
import { prisma } from '@crackthelab/db';
import { loginSchema, registerSchema } from '@crackthelab/shared';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const REFRESH_COOKIE = 'refreshToken';
const isProd = process.env.NODE_ENV === 'production';
// In prod the frontend (Vercel) and API (VM) are on different origins, so the
// refresh cookie must be SameSite=None to survive cross-site fetch() calls —
// Lax cookies are only sent on top-level navigations, not XHR/fetch, which
// would otherwise silently break login the moment frontend/backend split
// domains. None requires Secure, which is fine since prod is HTTPS-only.
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProd,
  path: '/api/auth',
};

function toAuthUser(user: {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO';
}) {
  return { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan };
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
    });
    if (existing) {
      throw new HttpError(409, 'Email or username already in use');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { email: input.email, username: input.username, passwordHash },
    });

    const accessToken = signAccessToken({ sub: user.id, username: user.username, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    res.status(201).json({ user: toAuthUser(user), accessToken });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const accessToken = signAccessToken({ sub: user.id, username: user.username, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
    res.json({ user: toAuthUser(user), accessToken });
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new HttpError(401, 'Missing refresh token');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new HttpError(401, 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, 'User no longer exists');

    const accessToken = signAccessToken({ sub: user.id, username: user.username, role: user.role });
    res.json({ user: toAuthUser(user), accessToken });
  }),
);

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  res.status(204).send();
});

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    res.json({ user: toAuthUser(user) });
  }),
);

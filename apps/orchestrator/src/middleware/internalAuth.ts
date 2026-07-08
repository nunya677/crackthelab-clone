import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';

export function requireInternalToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (token !== env.internalToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

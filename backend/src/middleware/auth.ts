import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthenticatedRequest = Request & { userId?: number };

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret') as { userId: number };
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

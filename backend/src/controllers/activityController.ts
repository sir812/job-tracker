import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function listActivities(req: AuthenticatedRequest, res: Response, next: (err?: unknown) => void) {
  try {
    const activities = await prisma.activity.findMany({
      where: { userId: req.userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return res.json({ activities });
  } catch (err) {
    next(err);
  }
}

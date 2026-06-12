import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function listInterviews(req: AuthenticatedRequest, res: Response, next: (err?: unknown) => void) {
  try {
    const interviews = await prisma.interviewEvent.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
    });

    return res.json({ interviews });
  } catch (err) {
    next(err);
  }
}

export async function createInterview(req: AuthenticatedRequest, res: Response, next: (err?: unknown) => void) {
  try {
    const { jobId, company, role, title, date, time, type, notes } = req.body as Record<string, unknown>;

    if (!jobId || !company || !role || !title || !date || !time || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const job = await prisma.job.findFirst({
      where: { id: Number(jobId), userId: req.userId },
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const interview = await prisma.interviewEvent.create({
      data: {
        jobId: Number(jobId),
        company: String(company),
        role: String(role),
        title: String(title),
        date: String(date),
        time: String(time),
        type: String(type),
        notes: notes ? String(notes) : null,
        userId: req.userId ?? 0,
      },
    });

    await prisma.activity.create({
      data: {
        userId: req.userId ?? 0,
        type: 'interview',
        message: `Scheduled ${interview.type} interview for ${interview.role} at ${interview.company} on ${interview.date}`,
        jobId: interview.jobId,
      },
    });

    return res.status(201).json({ interview });
  } catch (err) {
    next(err);
  }
}

export async function deleteInterview(req: AuthenticatedRequest, res: Response, next: (err?: unknown) => void) {
  try {
    const existing = await prisma.interviewEvent.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    await prisma.interviewEvent.delete({ where: { id: existing.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

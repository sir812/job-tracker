import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

function normalizeTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [] as string[];
}

export async function listJobs(req: AuthenticatedRequest, res: Response) {
  const jobs = await prisma.job.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
  });

  return res.json({ jobs });
}

export async function getJob(req: AuthenticatedRequest, res: Response) {
  const job = await prisma.job.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  });

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  return res.json({ job });
}

export async function createJob(req: AuthenticatedRequest, res: Response) {
  const { title, company, role, status, link, salary, location, notes, dateApplied, priority, tags } = req.body as Record<string, unknown>;

  if (!title || !company) {
    return res.status(400).json({ message: 'Title and company are required' });
  }

  const job = await prisma.job.create({
    data: {
      title: String(title),
      company: String(company),
      role: role ? String(role) : null,
      status: typeof status === 'string' ? status : 'Applied',
      link: link ? String(link) : null,
      salary: salary ? String(salary) : null,
      location: location ? String(location) : null,
      notes: notes ? String(notes) : null,
      dateApplied: typeof dateApplied === 'string' && dateApplied ? new Date(dateApplied) : null,
      priority: typeof priority === 'number' ? priority : Number(priority ?? 0),
      tags: normalizeTags(tags),
      userId: req.userId ?? 0,
    },
  });

  return res.status(201).json({ job });
}

export async function updateJob(req: AuthenticatedRequest, res: Response) {
  const existing = await prisma.job.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const { title, company, role, status, link, salary, location, notes, dateApplied, priority, tags } = req.body as Record<string, unknown>;

  const job = await prisma.job.update({
    where: { id: existing.id },
    data: {
      title: title ? String(title) : existing.title,
      company: company ? String(company) : existing.company,
      role: role !== undefined ? (role ? String(role) : null) : existing.role,
      status: typeof status === 'string' ? status : existing.status,
      link: link !== undefined ? (link ? String(link) : null) : existing.link,
      salary: salary !== undefined ? (salary ? String(salary) : null) : existing.salary,
      location: location !== undefined ? (location ? String(location) : null) : existing.location,
      notes: notes !== undefined ? (notes ? String(notes) : null) : existing.notes,
      dateApplied: typeof dateApplied === 'string' && dateApplied ? new Date(dateApplied) : existing.dateApplied,
      priority: priority !== undefined ? Number(priority) : existing.priority,
      tags: tags !== undefined ? normalizeTags(tags) : existing.tags,
    },
  });

  return res.json({ job });
}

export async function deleteJob(req: AuthenticatedRequest, res: Response) {
  const existing = await prisma.job.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Job not found' });
  }

  await prisma.job.delete({ where: { id: existing.id } });
  return res.status(204).send();
}

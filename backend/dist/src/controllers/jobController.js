"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobs = listJobs;
exports.getJob = getJob;
exports.createJob = createJob;
exports.updateJob = updateJob;
exports.deleteJob = deleteJob;
const prisma_1 = require("../lib/prisma");
function normalizeTags(tags) {
    if (Array.isArray(tags)) {
        return tags.map((tag) => String(tag).trim()).filter(Boolean);
    }
    if (typeof tags === 'string') {
        return tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
    }
    return [];
}
async function listJobs(req, res) {
    const jobs = await prisma_1.prisma.job.findMany({
        where: { userId: req.userId },
        orderBy: { updatedAt: 'desc' },
    });
    return res.json({ jobs });
}
async function getJob(req, res) {
    const job = await prisma_1.prisma.job.findFirst({
        where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }
    return res.json({ job });
}
async function createJob(req, res) {
    const { title, company, role, status, link, salary, location, notes, dateApplied, priority, tags } = req.body;
    if (!title || !company) {
        return res.status(400).json({ message: 'Title and company are required' });
    }
    const job = await prisma_1.prisma.job.create({
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
    await prisma_1.prisma.activity.create({
        data: {
            userId: req.userId ?? 0,
            type: job.status.toLowerCase(),
            message: `Added new job entry: ${job.role || job.title} at ${job.company}`,
            jobId: job.id,
        },
    });
    return res.status(201).json({ job });
}
async function updateJob(req, res) {
    const existing = await prisma_1.prisma.job.findFirst({
        where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) {
        return res.status(404).json({ message: 'Job not found' });
    }
    const { title, company, role, status, link, salary, location, notes, dateApplied, priority, tags } = req.body;
    const oldStatus = existing.status;
    const newStatus = typeof status === 'string' ? status : existing.status;
    const job = await prisma_1.prisma.job.update({
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
    if (newStatus !== oldStatus) {
        await prisma_1.prisma.activity.create({
            data: {
                userId: req.userId ?? 0,
                type: newStatus.toLowerCase(),
                message: `Status of ${job.role || job.title} at ${job.company} changed from ${oldStatus} to ${newStatus}`,
                jobId: job.id,
            },
        });
    }
    return res.json({ job });
}
async function deleteJob(req, res) {
    const existing = await prisma_1.prisma.job.findFirst({
        where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) {
        return res.status(404).json({ message: 'Job not found' });
    }
    await prisma_1.prisma.activity.create({
        data: {
            userId: req.userId ?? 0,
            type: 'rejected',
            message: `Removed job entry: ${existing.role || existing.title} at ${existing.company}`,
        },
    });
    await prisma_1.prisma.job.delete({ where: { id: existing.id } });
    return res.status(204).send();
}

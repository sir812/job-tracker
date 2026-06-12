"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActivities = listActivities;
const prisma_1 = require("../lib/prisma");
async function listActivities(req, res, next) {
    try {
        const activities = await prisma_1.prisma.activity.findMany({
            where: { userId: req.userId },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });
        return res.json({ activities });
    }
    catch (err) {
        next(err);
    }
}

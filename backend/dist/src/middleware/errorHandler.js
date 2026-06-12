"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
function errorHandler(error, _req, res, _next) {
    console.error(error);
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        return res.status(503).json({
            message: 'Database is unavailable. For local development, run the backend with `npm run dev:backend` from the project root, or start the database with `npm run dev:db`.',
        });
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P1001' || error.code === 'P1000') {
            return res.status(503).json({
                message: 'Database is unavailable. Start Docker Postgres (docker compose up -d postgres) or run npm run dev:db from the project root.',
            });
        }
        return res.status(503).json({ message: 'Database request failed' });
    }
    return res.status(500).json({ message: 'Internal server error' });
}

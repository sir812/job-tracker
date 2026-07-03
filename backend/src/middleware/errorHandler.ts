import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  expose?: boolean;
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(error);

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      message:
        'Database is unavailable. For local development, run the backend with `npm run dev:backend` from the project root, or start the database with `npm run dev:db`.',
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P1001' || error.code === 'P1000') {
      return res.status(503).json({
        message:
          'Database is unavailable. Start Docker Postgres (docker compose up -d postgres) or run npm run dev:db from the project root.',
      });
    }
    return res.status(503).json({ message: 'Database request failed' });
  }

  // Handle body-parser / express errors that set statusCode + expose:true
  const httpErr = error as HttpError;
  if (httpErr?.expose && (httpErr.statusCode ?? httpErr.status)) {
    const code = httpErr.statusCode ?? httpErr.status ?? 400;
    return res.status(code).json({ message: httpErr.message ?? 'Bad request' });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

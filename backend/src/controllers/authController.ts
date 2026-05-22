import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

function createToken(userId: number) {
  return jwt.sign({ userId }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name?.trim() || null, email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return res.status(201).json({ user, token: createToken(user.id) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: createToken(user.id),
  });
}

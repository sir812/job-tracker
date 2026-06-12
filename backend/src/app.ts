import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import scraperRoutes from './routes/scraper';
import activityRoutes from './routes/activities';
import interviewRoutes from './routes/interviews';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/interviews', interviewRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

export default app;

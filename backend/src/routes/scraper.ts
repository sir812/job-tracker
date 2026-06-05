import { Router } from 'express';
import { triggerScraper, getScrapedJobs } from '../controllers/scraperController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect all scraper routes behind auth
router.use(authMiddleware);

/**
 * POST /api/scraper/run
 * Fetches fresh job listings from RemoteOK and Remotive,
 * normalizes them, and saves to backend/data/scraped_jobs.json.
 */
router.post('/run', triggerScraper);

/**
 * GET /api/scraper/jobs
 * Returns cached scraped jobs from the last run.
 */
router.get('/jobs', getScrapedJobs);

export default router;

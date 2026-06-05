import { Request, Response } from 'express';
import { runScraper, readScrapedJobs } from '../lib/scraper';

/**
 * POST /api/scraper/run
 * Triggers the scraper, writes results to backend/data/scraped_jobs.json,
 * and returns a summary of what was collected.
 */
export async function triggerScraper(_req: Request, res: Response) {
  try {
    console.log('[scraper] Starting scrape...');
    const result = await runScraper();
    return res.json({
      message: `Successfully scraped ${result.count} jobs`,
      ...result,
    });
  } catch (err) {
    console.error('[scraper] Error:', err);
    return res.status(500).json({ message: 'Scraper failed', error: String(err) });
  }
}

/**
 * GET /api/scraper/jobs
 * Returns the cached scraped jobs from backend/data/scraped_jobs.json.
 * Returns 404 if the scraper has never been run.
 */
export function getScrapedJobs(_req: Request, res: Response) {
  const data = readScrapedJobs();
  if (!data) {
    return res.status(404).json({
      message: 'No scraped data found. Run POST /api/scraper/run first.',
    });
  }
  return res.json(data);
}

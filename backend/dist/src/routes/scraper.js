"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scraperController_1 = require("../controllers/scraperController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all scraper routes behind auth
router.use(auth_1.authMiddleware);
/**
 * POST /api/scraper/run
 * Fetches fresh job listings from RemoteOK and Remotive,
 * normalizes them, and saves to backend/data/scraped_jobs.json.
 */
router.post('/run', scraperController_1.triggerScraper);
/**
 * GET /api/scraper/jobs
 * Returns cached scraped jobs from the last run.
 */
router.get('/jobs', scraperController_1.getScrapedJobs);
exports.default = router;

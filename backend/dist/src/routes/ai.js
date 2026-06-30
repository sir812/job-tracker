"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scraper_1 = require("../lib/scraper");
const router = (0, express_1.Router)();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const AI_MOCK = process.env.AI_MOCK === 'true' || !GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const LOG_PATH = path_1.default.join(__dirname, 'apply_actions.log');
async function askAi(prompt) {
    if (AI_MOCK) {
        const summary = prompt.trim();
        return `[MOCK RESPONSE] ${summary.length > 200 ? summary.substring(0, 197) + '...' : summary}`;
    }
    try {
        const response = await axios_1.default.post(GROQ_API_URL, {
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful career and job-application assistant. Be concise and actionable.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
        }, {
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
        const choices = response.data?.choices || [];
        if (choices.length > 0) {
            return choices[0].message?.content || '';
        }
        return '';
    }
    catch (error) {
        console.error('Groq API error:', error.response?.data || error.message);
        throw new Error(`Groq request failed: ${error.message}`);
    }
}
function formatJobsForPrompt(jobs, limit = 40) {
    if (!jobs || jobs.length === 0)
        return 'No scraped jobs available.';
    return jobs
        .slice(0, limit)
        .map((job, i) => {
        const parts = [
            `${i + 1}. ${job.title || 'Unknown'} @ ${job.company || 'Unknown'}`,
            `   Location: ${job.location || 'Remote'}`,
        ];
        if (job.salary)
            parts.push(`   Salary: ${job.salary}`);
        if (job.tags)
            parts.push(`   Tags: ${job.tags.slice(0, 6).join(', ')}`);
        parts.push(`   Link: ${job.link || ''}`);
        return parts.join('\n');
    })
        .join('\n\n');
}
router.post('/ask', async (req, res, next) => {
    try {
        const { prompt } = req.body;
        const result = await askAi(prompt);
        res.json({ response: result });
    }
    catch (err) {
        next(err);
    }
});
router.post('/cover-letter', async (req, res, next) => {
    try {
        const { job_description, user_skills } = req.body;
        const prompt = `Write a concise cover letter for the following job description: ${job_description}. Highlight these user skills: ${user_skills}.`;
        const result = await askAi(prompt);
        res.json({ cover_letter: result });
    }
    catch (err) {
        next(err);
    }
});
router.post('/resume-bullet', async (req, res, next) => {
    try {
        const { bullet } = req.body;
        const prompt = `Improve this resume bullet point: ${bullet}. Make it action-oriented and results-focused.`;
        const result = await askAi(prompt);
        res.json({ bullet: result });
    }
    catch (err) {
        next(err);
    }
});
router.post('/job-fit', async (req, res, next) => {
    try {
        const { job_description, profile } = req.body;
        const prompt = `Given the job description: ${job_description}, assess how well the following profile matches it: ${profile}. Summarize strengths and gaps.`;
        const result = await askAi(prompt);
        res.json({ assessment: result });
    }
    catch (err) {
        next(err);
    }
});
router.post('/interview-prep', async (req, res, next) => {
    try {
        const { job_title, company } = req.body;
        const prompt = `Prepare three interview questions for a ${job_title} role at ${company}. Include one technical and two behavioral questions.`;
        const result = await askAi(prompt);
        res.json({ questions: result });
    }
    catch (err) {
        next(err);
    }
});
router.post('/apply-preview', async (req, res, next) => {
    try {
        const { job_id, cover_letter, resume_bullet } = req.body;
        const promptParts = [`Job id: ${job_id}`];
        if (cover_letter)
            promptParts.push(`Cover letter:\n${cover_letter}`);
        if (resume_bullet)
            promptParts.push(`Resume bullet:\n${resume_bullet}`);
        const prompt = `Summarize the application materials and produce a short submission preview:\n\n` + promptParts.join('\n\n');
        const preview = await askAi(prompt);
        res.json({ preview });
    }
    catch (err) {
        next(err);
    }
});
router.post('/apply-execute', async (req, res, next) => {
    try {
        const { job_id, confirm, cover_letter, resume_bullet } = req.body;
        if (!confirm) {
            return res.status(400).json({ message: 'Application not confirmed by user' });
        }
        const entry = {
            timestamp: new Date().toISOString(),
            provider: 'mock-job-board',
            job_id,
            cover_letter_excerpt: (cover_letter || '').substring(0, 800),
            resume_bullet: (resume_bullet || '').substring(0, 300),
            status: 'submitted',
        };
        try {
            fs_1.default.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf-8');
        }
        catch (err) {
            entry.status = 'submitted (logging failed)';
        }
        res.json({ status: 'ok', message: 'Application action recorded (mock).', result: { status: 'ok', detail: entry } });
    }
    catch (err) {
        next(err);
    }
});
router.post('/find-jobs', async (req, res, next) => {
    try {
        const { query, profile, limit = 40 } = req.body;
        const scraperResult = (0, scraper_1.readScrapedJobs)();
        const jobs = scraperResult ? scraperResult.jobs : [];
        if (jobs.length === 0) {
            return res.json({
                matches: '',
                count: 0,
                message: 'No scraped jobs found. Run a scrape first via POST /api/scraper/run.',
            });
        }
        const jobsText = formatJobsForPrompt(jobs, limit);
        const profileSection = profile ? `\n\nCandidate profile:\n${profile}` : '';
        const prompt = `You are a career advisor. Below is a list of live job listings scraped from the web.\n\n` +
            `Job listings:\n${jobsText}${profileSection}\n\n` +
            `User request: ${query}\n\n` +
            `Identify the 5 best matching jobs for the user's request and profile. ` +
            `For each match explain WHY it's a good fit in 1-2 sentences and include the application link.`;
        const result = await askAi(prompt);
        res.json({ matches: result, count: jobs.length });
    }
    catch (err) {
        next(err);
    }
});
router.post('/scrape-and-find', async (req, res, next) => {
    try {
        const { query, profile, limit = 40 } = req.body;
        const scrapeResult = await (0, scraper_1.runScraper)();
        const scraperResult = (0, scraper_1.readScrapedJobs)();
        const jobs = scraperResult ? scraperResult.jobs : [];
        if (jobs.length === 0) {
            return res.json({
                matches: '',
                count: 0,
                scraped: scrapeResult,
                message: 'Scrape ran but no jobs were returned.',
            });
        }
        const jobsText = formatJobsForPrompt(jobs, limit);
        const profileSection = profile ? `\n\nCandidate profile:\n${profile}` : '';
        const prompt = `You are a career advisor. Below is a fresh list of live job listings just scraped from the web.\n\n` +
            `Job listings:\n${jobsText}${profileSection}\n\n` +
            `User request: ${query}\n\n` +
            `Identify the 5 best matching jobs for the user's request and profile. ` +
            `For each match explain WHY it's a good fit in 1-2 sentences and include the application link.`;
        const result = await askAi(prompt);
        res.json({
            matches: result,
            count: jobs.length,
            scraped: scrapeResult,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScraper = runScraper;
exports.readScrapedJobs = readScrapedJobs;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Walks up the directory tree from `startDir` until it finds a directory
 * containing `package.json` — that's our package root.
 * Works correctly whether running via ts-node-dev (src/) or compiled (dist/).
 */
function findPackageRoot(startDir) {
    let dir = startDir;
    while (true) {
        if (fs_1.default.existsSync(path_1.default.join(dir, 'package.json')))
            return dir;
        const parent = path_1.default.dirname(dir);
        if (parent === dir)
            return startDir; // filesystem root, give up
        dir = parent;
    }
}
const DATA_DIR = path_1.default.join(findPackageRoot(__dirname), 'data');
const OUTPUT_FILE = path_1.default.join(DATA_DIR, 'scraped_jobs.json');
// ─── RemoteOK ──────────────────────────────────────────────────────────────
async function scrapeRemoteOK() {
    const { data } = await axios_1.default.get('https://remoteok.com/api', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; job-tracker-scraper/1.0)',
        },
        timeout: 15000,
    });
    // First element is a notice object — skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];
    return jobs
        .filter((j) => j && j.position)
        .map((j) => ({
        id: `remoteok-${j.id ?? j.slug ?? Math.random()}`,
        title: String(j.position ?? ''),
        company: String(j.company ?? ''),
        location: String(j.location || 'Remote'),
        salary: j.salary_min
            ? `$${j.salary_min}${j.salary_max ? ` – $${j.salary_max}` : '+'}/yr`
            : undefined,
        link: String(j.url ?? `https://remoteok.com/remote-jobs/${j.slug}`),
        tags: Array.isArray(j.tags)
            ? j.tags.slice(0, 8).map(String)
            : [],
        datePosted: j.date ? String(j.date) : undefined,
        source: 'remoteok',
    }));
}
// ─── Remotive ───────────────────────────────────────────────────────────────
async function scrapeRemotive() {
    const { data } = await axios_1.default.get('https://remotive.com/api/remote-jobs', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; job-tracker-scraper/1.0)',
        },
        timeout: 15000,
    });
    const jobs = data?.jobs ?? [];
    return jobs.map((j) => ({
        id: `remotive-${j.id}`,
        title: String(j.title ?? ''),
        company: String(j.company_name ?? ''),
        location: String(j.candidate_required_location || 'Remote'),
        salary: j.salary ? String(j.salary) : undefined,
        link: String(j.url ?? ''),
        tags: Array.isArray(j.tags)
            ? j.tags.slice(0, 8).map(String)
            : [],
        datePosted: j.publication_date ? String(j.publication_date) : undefined,
        source: 'remotive',
    }));
}
// ─── Main scrape function ────────────────────────────────────────────────────
async function runScraper() {
    const results = await Promise.allSettled([
        scrapeRemoteOK(),
        scrapeRemotive(),
    ]);
    const remoteOKJobs = results[0].status === 'fulfilled' ? results[0].value : [];
    const remotiveJobs = results[1].status === 'fulfilled' ? results[1].value : [];
    if (results[0].status === 'rejected') {
        console.warn('[scraper] RemoteOK failed:', results[0].reason);
    }
    if (results[1].status === 'rejected') {
        console.warn('[scraper] Remotive failed:', results[1].reason);
    }
    // Deduplicate by link
    const seen = new Set();
    const allJobs = [];
    for (const job of [...remoteOKJobs, ...remotiveJobs]) {
        if (!seen.has(job.link)) {
            seen.add(job.link);
            allJobs.push(job);
        }
    }
    // Ensure data directory exists
    if (!fs_1.default.existsSync(DATA_DIR)) {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    const scrapedAt = new Date().toISOString();
    const output = { scrapedAt, count: allJobs.length, jobs: allJobs };
    fs_1.default.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`[scraper] Saved ${allJobs.length} jobs → ${OUTPUT_FILE}`);
    return {
        count: allJobs.length,
        sources: {
            remoteok: remoteOKJobs.length,
            remotive: remotiveJobs.length,
        },
        filePath: OUTPUT_FILE,
        scrapedAt,
    };
}
// ─── Read cached results ─────────────────────────────────────────────────────
function readScrapedJobs() {
    if (!fs_1.default.existsSync(OUTPUT_FILE))
        return null;
    try {
        const raw = fs_1.default.readFileSync(OUTPUT_FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}

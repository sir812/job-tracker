"""
scraper_service.py
~~~~~~~~~~~~~~~~~~
Fetches live scraped job listings from the Node/Express scraper API
(GET /api/scraper/jobs) and optionally triggers a fresh scrape
(POST /api/scraper/run).

The Express backend runs on port 4000 by default.
"""
import os
from typing import Any

import aiohttp

EXPRESS_API_BASE: str = os.getenv("EXPRESS_API_BASE", "http://127.0.0.1:4000/api")
SCRAPER_JOBS_URL: str = f"{EXPRESS_API_BASE}/scraper/jobs"
SCRAPER_RUN_URL: str = f"{EXPRESS_API_BASE}/scraper/run"


async def fetch_scraped_jobs(auth_token: str | None = None) -> list[dict[str, Any]]:
    """
    Returns the cached scraped jobs from the Express scraper endpoint.
    Passes the user's JWT token if provided so the auth middleware allows it.
    """
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    timeout = aiohttp.ClientTimeout(total=15.0)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.get(SCRAPER_JOBS_URL, headers=headers) as resp:
            if resp.status == 404:
                return []  # scraper not yet run
            if resp.status != 200:
                body = await resp.text()
                raise RuntimeError(f"Scraper API error {resp.status}: {body}")
            data: dict[str, Any] = await resp.json()
            return data.get("jobs", [])


async def trigger_scrape(auth_token: str | None = None) -> dict[str, Any]:
    """
    Triggers a fresh scrape via the Express API and returns the summary.
    """
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    timeout = aiohttp.ClientTimeout(total=60.0)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(SCRAPER_RUN_URL, headers=headers) as resp:
            if resp.status != 200:
                body = await resp.text()
                raise RuntimeError(f"Scraper run error {resp.status}: {body}")
            return await resp.json()


def format_jobs_for_prompt(jobs: list[dict[str, Any]], limit: int = 40) -> str:
    """
    Formats a list of scraped jobs into a compact text block for the AI prompt.
    Limits to `limit` jobs to stay within token budget.
    """
    if not jobs:
        return "No scraped jobs available."

    lines: list[str] = []
    for i, job in enumerate(jobs[:limit], start=1):
        parts = [
            f"{i}. {job.get('title', 'Unknown')} @ {job.get('company', 'Unknown')}",
            f"   Location: {job.get('location', 'Remote')}",
        ]
        if job.get("salary"):
            parts.append(f"   Salary: {job['salary']}")
        if job.get("tags"):
            parts.append(f"   Tags: {', '.join(job['tags'][:6])}")
        parts.append(f"   Link: {job.get('link', '')}")
        lines.append("\n".join(parts))

    return "\n\n".join(lines)

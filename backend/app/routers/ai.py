from typing import Any

from fastapi import APIRouter, Body, HTTPException, Header
from pydantic import BaseModel

from ..services.ai_service import ask_ai
from ..services.apply_service import perform_mock_apply
from ..services.scraper_service import fetch_scraped_jobs, trigger_scrape, format_jobs_for_prompt

router = APIRouter()


class AskPrompt(BaseModel):
    prompt: str


class CoverLetterRequest(BaseModel):
    job_description: str
    user_skills: str


class ResumeBulletRequest(BaseModel):
    bullet: str


class JobFitRequest(BaseModel):
    job_description: str
    profile: str


class InterviewPrepRequest(BaseModel):
    job_title: str
    company: str


class ApplyPreviewRequest(BaseModel):
    job_id: str
    cover_letter: str | None = None
    resume_bullet: str | None = None


class ApplyExecuteRequest(BaseModel):
    job_id: str
    confirm: bool
    cover_letter: str | None = None
    resume_bullet: str | None = None


@router.post("/ai/ask")
async def ask_endpoint(body: AskPrompt) -> dict[str, str]:
    try:
        result: str = await ask_ai(body.prompt)
        return {"response": result}
    except HTTPException as exc:
        raise exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/cover-letter")
async def cover_letter_endpoint(body: CoverLetterRequest) -> dict[str, str]:
    prompt: str = (
        f"Write a concise cover letter for the following job description: "
        f"{body.job_description}. Highlight these user skills: {body.user_skills}."
    )
    try:
        result: str = await ask_ai(prompt)
        return {"cover_letter": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/resume-bullet")
async def resume_bullet_endpoint(body: ResumeBulletRequest) -> dict[str, str]:
    prompt: str = (
        f"Improve this resume bullet point: {body.bullet}. "
        f"Make it action\u2011oriented and results\u2011focused."
    )
    try:
        result: str = await ask_ai(prompt)
        return {"bullet": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/job-fit")
async def job_fit_endpoint(body: JobFitRequest) -> dict[str, str]:
    prompt: str = (
        f"Given the job description: {body.job_description}, assess how well "
        f"the following profile matches it: {body.profile}. Summarize strengths and gaps."
    )
    try:
        result: str = await ask_ai(prompt)
        return {"assessment": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/interview-prep")
async def interview_prep_endpoint(body: InterviewPrepRequest) -> dict[str, str]:
    prompt: str = (
        f"Prepare three interview questions for a {body.job_title} role at "
        f"{body.company}. Include one technical and two behavioral questions."
    )
    try:
        result: str = await ask_ai(prompt)
        return {"questions": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/apply-preview")
async def apply_preview_endpoint(body: ApplyPreviewRequest) -> dict[str, str]:
    """Return a preview of what would be submitted when applying to a job.

    This endpoint does NOT perform any external actions. It composes the application
    materials the AI would submit and returns them for user confirmation.
    """
    prompt_parts: list[str] = [f"Job id: {body.job_id}"]
    if body.cover_letter:
        prompt_parts.append(f"Cover letter:\n{body.cover_letter}")
    if body.resume_bullet:
        prompt_parts.append(f"Resume bullet:\n{body.resume_bullet}")

    prompt: str = "\n\n".join(prompt_parts)
    try:
        preview: str = await ask_ai(
            f"Summarize the application materials and produce a short submission preview:\n\n{prompt}"
        )
        return {"preview": preview}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/apply-execute")
async def apply_execute_endpoint(
    body: ApplyExecuteRequest = Body(...),
) -> dict[str, Any]:
    """Execute a mocked application 'apply' action after explicit user confirmation.

    For safety, this implementation only updates internal state or logs the action.
    Real integrations with external job portals must be added separately with user
    credential handling and proper auditing.
    """
    if not body.confirm:
        raise HTTPException(status_code=400, detail="Application not confirmed by user")

    try:
        result: dict[str, Any] = await perform_mock_apply(
            body.job_id, body.cover_letter, body.resume_bullet
        )
        return {"status": "ok", "message": "Application action recorded (mock).", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


# ─── Scraper-powered job discovery ─────────────────────────────────────────

class FindJobsRequest(BaseModel):
    query: str
    profile: str | None = None
    limit: int = 40


@router.post("/ai/find-jobs")
async def find_jobs_endpoint(
    body: FindJobsRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    """Pull cached scraped jobs and ask the AI to find the best matches.

    The user's JWT token is forwarded to the Express scraper API so the
    auth middleware accepts the request.
    """
    token: str | None = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]

    try:
        jobs = await fetch_scraped_jobs(auth_token=token)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch scraped jobs: {e}")

    if not jobs:
        return {
            "matches": "",
            "count": 0,
            "message": "No scraped jobs found. Run a scrape first via POST /api/scraper/run.",
        }

    jobs_text = format_jobs_for_prompt(jobs, limit=body.limit)
    profile_section = f"\n\nCandidate profile:\n{body.profile}" if body.profile else ""

    prompt = (
        f"You are a career advisor. Below is a list of live job listings scraped from the web.\n\n"
        f"Job listings:\n{jobs_text}{profile_section}\n\n"
        f"User request: {body.query}\n\n"
        f"Identify the 5 best matching jobs for the user's request and profile. "
        f"For each match explain WHY it's a good fit in 1-2 sentences and include the application link."
    )

    try:
        result: str = await ask_ai(prompt)
        return {"matches": result, "count": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/ai/scrape-and-find")
async def scrape_and_find_endpoint(
    body: FindJobsRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    """Trigger a fresh scrape, then immediately run find-jobs matching.

    Useful when the user clicks 'Pull & Search' — fetches the newest listings
    from RemoteOK + Remotive and then runs AI matching in a single request.
    """
    token: str | None = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]

    # 1. Trigger a fresh scrape
    try:
        scrape_result = await trigger_scrape(auth_token=token)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Scraper trigger failed: {e}")

    # 2. Fetch the freshly scraped jobs
    try:
        jobs = await fetch_scraped_jobs(auth_token=token)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch scraped jobs: {e}")

    if not jobs:
        return {
            "matches": "",
            "count": 0,
            "scraped": scrape_result,
            "message": "Scrape ran but no jobs were returned.",
        }

    jobs_text = format_jobs_for_prompt(jobs, limit=body.limit)
    profile_section = f"\n\nCandidate profile:\n{body.profile}" if body.profile else ""

    prompt = (
        f"You are a career advisor. Below is a fresh list of live job listings just scraped from the web.\n\n"
        f"Job listings:\n{jobs_text}{profile_section}\n\n"
        f"User request: {body.query}\n\n"
        f"Identify the 5 best matching jobs for the user's request and profile. "
        f"For each match explain WHY it's a good fit in 1-2 sentences and include the application link."
    )

    try:
        result: str = await ask_ai(prompt)
        return {
            "matches": result,
            "count": len(jobs),
            "scraped": scrape_result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

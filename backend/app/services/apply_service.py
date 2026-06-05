import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Any

BASE_DIR: str = os.path.dirname(__file__)
LOG_PATH: str = os.path.join(BASE_DIR, "apply_actions.log")


async def perform_mock_apply(
    job_id: str,
    cover_letter: str | None = None,
    resume_bullet: str | None = None,
) -> dict[str, Any]:
    """Simulate applying to an external job board and record the action to a local log.

    This is a safe, mock connector used for demonstration and testing. It does not
    perform any external network calls or submit credentials.
    """
    # Simulate latency
    await asyncio.sleep(0.35)

    entry: dict[str, str] = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "provider": "mock-job-board",
        "job_id": job_id,
        "cover_letter_excerpt": (cover_letter or "")[:800],
        "resume_bullet": (resume_bullet or "")[:300],
        "status": "submitted",
    }

    # Ensure log directory exists
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        # best-effort: if logging fails, still return success but note the error
        entry["status"] = "submitted (logging failed)"

    return {"status": "ok", "detail": entry}

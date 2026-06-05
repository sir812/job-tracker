import os
from typing import Any

import aiohttp
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
AI_MOCK: bool = os.getenv("AI_MOCK", "false").lower() in ("1", "true", "yes")
GROQ_MODEL: str = "llama-3.3-70b-versatile"
GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"


async def ask_ai(prompt: str) -> str:
    """Send a prompt to Groq API and return generated text.

    Groq provides free, ultra-fast inference on open-weight models using
    custom LPU hardware.  The API follows the OpenAI chat-completions format.
    """
    # Return a deterministic mock when AI_MOCK is enabled (useful for offline dev)
    if AI_MOCK:
        # Provide a readable, short mock response based on the prompt
        summary: str = prompt.strip()
        if len(summary) > 200:
            summary = summary[:197] + "..."
        return f"[MOCK RESPONSE] {summary}"

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Get a free key at https://console.groq.com"
        )

    headers: dict[str, str] = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload: dict[str, Any] = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful career and job-application assistant. Be concise and actionable.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
    }
    timeout = aiohttp.ClientTimeout(total=30.0)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        try:
            async with session.post(
                GROQ_API_URL,
                json=payload,
                headers=headers,
            ) as response:
                if response.status != 200:
                    body: str = await response.text()
                    raise RuntimeError(
                        f"Groq API error {response.status}: {body}"
                    )
                data: dict[str, Any] = await response.json()
                choices: list[Any] = data.get("choices", [])
                if choices:
                    message: dict[str, Any] = choices[0]["message"]
                    content: str = message.get("content", "")
                    return content
                return ""
        except RuntimeError:
            raise
        except Exception as e:
            raise RuntimeError(f"Groq request failed: {e}") from e


# Backward-compatible alias so existing imports keep working
ask_mistral = ask_ai

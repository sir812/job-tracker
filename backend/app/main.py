from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import ai

app = FastAPI(title="Job Tracker AI Proxy", version="0.1.0")

# CORS settings to allow the Vite frontend
origins: list[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router, prefix="/api")

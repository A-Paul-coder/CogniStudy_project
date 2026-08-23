"""
Main FastAPI Application Entry Point
AI-Powered Study Buddy Backend
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers.auth_routes import router as auth_router
from routers.feature_routes import (
    tutor_router,
    explainer_router,
    summarizer_router,
    quiz_router,
    flashcard_router,
    dashboard_router,
)

# Auto-create SQLite database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Study Buddy API",
    description="Full-stack AI Academic Companion API powered by FastAPI, SQLite, and Google Gemini",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Sub-Routers
app.include_router(auth_router)
app.include_router(tutor_router)
app.include_router(explainer_router)
app.include_router(summarizer_router)
app.include_router(quiz_router)
app.include_router(flashcard_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "app": "AI Study Buddy Backend",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

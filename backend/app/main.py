"""
CampusIQ Backend Application Entrypoint
FastAPI application with automated DB migrations, seeding, CORS, and modular routers.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base, SessionLocal
from .services.data_generator import generate_cohort
from .routers import (
    dashboard,
    students,
    interventions,
    segments,
    alerts,
    copilot,
    data,
    ml
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed synthetic cohort if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        generate_cohort(db, student_count=420, seed=settings.RANDOM_SEED)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.TAGLINE} — AI-Powered Student Success Decision Support API",
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["system"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "production-ready prototype",
        "message": "CampusIQ Engine is fully operational"
    }

# Register API Routers
app.include_router(dashboard.router)
app.include_router(students.router)
app.include_router(interventions.router)
app.include_router(segments.router)
app.include_router(alerts.router)
app.include_router(copilot.router)
app.include_router(data.router)
app.include_router(ml.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

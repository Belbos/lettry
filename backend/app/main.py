from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine

# Importing models registers them with SQLAlchemy's metadata before create_all.
from app.models import (  # noqa: F401
    LottoDraw,
    NumberStatisticsCache,
    RecommendationHistory,
    User,
    UserAlgorithmPreset,
)
from app.rate_limit import limiter
from app.routers import auth, history, lotto, presets, recommend, statistics
from app.utils.disclaimers import RECOMMENDATION_DISCLAIMER

# MVP bootstrap. For production, switch to Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lottery MVP API", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if settings.app_env == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    return response

app.include_router(auth.router)
app.include_router(lotto.router)
app.include_router(statistics.router)
app.include_router(recommend.router)
app.include_router(presets.router)
app.include_router(history.router)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/")
def root():
    return {
        "service": "Lottery MVP",
        "version": "0.1.0",
        "disclaimer": RECOMMENDATION_DISCLAIMER,
    }

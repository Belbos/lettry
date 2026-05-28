from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
from app.routers import auth, lotto, recommend, statistics
from app.utils.disclaimers import RECOMMENDATION_DISCLAIMER

# MVP bootstrap. For production, switch to Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lottery MVP API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lotto.router)
app.include_router(statistics.router)
app.include_router(recommend.router)


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

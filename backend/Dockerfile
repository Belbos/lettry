# Backend image — FastAPI + Uvicorn. Schema is applied via Alembic on start.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_ENV=production

WORKDIR /app

# Install dependencies first for better layer caching.
COPY pyproject.toml ./
RUN pip install --upgrade pip && pip install .

# App source, migrations and initial data.
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini ./
COPY asset ./asset

EXPOSE 8000

# Apply pending migrations, then serve.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

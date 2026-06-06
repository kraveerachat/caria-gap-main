# CARIA-GAP backend image (Roadmap Phase 4).
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install deps first for layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Override in compose to run migrations/seed before the server.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

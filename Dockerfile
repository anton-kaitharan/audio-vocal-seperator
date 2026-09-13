# ──────────────────────────────────────────────
#  AuraVocal — Multi-stage Production Dockerfile
# ──────────────────────────────────────────────

# Stage 1: Build Next.js frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --prefer-offline
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend + static frontend bundle
FROM python:3.10-slim

# System deps: FFmpeg, Node (for yt-dlp JS challenges)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    nodejs \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY server.py watch.py bot.py app.py ./
COPY .env.example ./

# Copy frontend build output to static/ for server.py to serve
COPY --from=frontend-build /app/frontend/.next/standalone ./frontend-standalone/
COPY --from=frontend-build /app/frontend/.next/static ./frontend-standalone/.next/static/
COPY --from=frontend-build /app/frontend/public ./frontend-standalone/public/

# Create required directories
RUN mkdir -p queue processing done failed output logs models uploads separated static

# Environment
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/status || exit 1

# Run backend server
CMD ["python", "server.py"]

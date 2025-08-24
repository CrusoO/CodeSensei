# Interactive Coding Engine - Multi-stage Docker Build
# This container includes both the API backend and serves the integration examples

# Stage 1: Python Backend
FROM python:3.11-slim as backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy API code
COPY api/ ./api/

# Stage 2: Node.js for building examples
FROM node:18-alpine as frontend

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source files
COPY src/ ./src/
COPY examples/ ./examples/
COPY public/ ./public/

# Build the examples (optional, for demo purposes)
RUN npm run build || echo "Build failed, continuing without build"

# Stage 3: Final runtime image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies and code from backend stage
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /app/api ./api

# Copy built frontend assets (for demo/examples)
COPY --from=frontend /app/src ./src
COPY --from=frontend /app/examples ./examples

# Copy documentation and configuration
COPY README.md INTEGRATION_GUIDE.md QUICK_START.md ./
COPY LICENSE CONTRIBUTING.md PROJECT_SUMMARY.md ./

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/coding/health || exit 1

# Start the FastAPI server
CMD ["python", "-m", "uvicorn", "api.interactive-coding:router", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/

# Switch to non-root user
USER appuser

ENV PORT=5050
EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5050/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5050", "--proxy-headers", "--forwarded-allow-ips", "*"]

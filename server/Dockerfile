FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Create non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

COPY package.json ./
RUN npm i 

COPY . ./

# Switch to non-root user
USER appuser

ENV PORT=5050
EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5050/api/health || exit 1

CMD ["node", "index.js"]

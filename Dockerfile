# ---- Stage 1: Build ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (limit memory to avoid OOM on small VPS)
COPY package.json ./
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm i

# Copy source and build
COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
# Skip full tsc type-check in Docker (saves RAM/CPU); vite build handles transpilation
RUN npx vite build

# ---- Stage 2: Serve ----
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

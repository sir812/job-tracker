### Frontend Dockerfile (Vite React)
FROM cgr.dev/chainguard/node:latest-dev AS builder
USER root
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Build-time env vars — Vite bakes these into the static bundle at build time.
# Pass via: docker build --build-arg VITE_API_BASE_URL=https://... .
ARG VITE_API_BASE_URL=https://job-tracker-production-a2e6.up.railway.app/api
ARG VITE_AI_API_BASE_URL=https://job-tracker-production-a2e6.up.railway.app/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AI_API_BASE_URL=$VITE_AI_API_BASE_URL

# Copy source and build
COPY . .
RUN npm run build

FROM cgr.dev/chainguard/node:latest-dev AS runner
USER root
WORKDIR /app
ENV NODE_ENV=production

# Install serve to host the static build
RUN npm install -g serve

# Copy static build files from builder
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000
# Serve the static Vite build folder using serve on port 3000
CMD ["serve", "dist", "-p", "3000", "-s"]

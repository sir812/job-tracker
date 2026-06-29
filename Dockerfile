### Frontend Dockerfile (Vite React)
FROM cgr.dev/chainguard/node:latest-dev AS builder
USER root
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

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

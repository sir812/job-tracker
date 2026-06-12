### Frontend Dockerfile (Vite React)
FROM cgr.dev/chainguard/node:latest-dev AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy static build files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000
# Serve the static Vite build folder using serve on port 3000
CMD ["npx", "serve", "dist", "-p", "3000", "-s"]

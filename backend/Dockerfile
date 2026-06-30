### Backend Dockerfile (Express + Prisma)
FROM cgr.dev/chainguard/node:latest-dev AS builder
USER root
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --production=false

# Copy source
COPY . .

# Set dummy DATABASE_URL to satisfy Prisma 6 config validation
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db"

# Generate Prisma client first so that TS compilation succeeds
RUN npx prisma generate

# Build application
RUN npm run build

FROM cgr.dev/chainguard/node:latest-dev AS runner
USER root
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]

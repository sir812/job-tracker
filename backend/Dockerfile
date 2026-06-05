### Backend Dockerfile (Express + Prisma)
FROM cgr.dev/chainguard/node:latest-dev AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]

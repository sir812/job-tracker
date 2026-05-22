Deployment guide — Railway + Supabase

Overview
- Backend: Express + Prisma (Postgres)
- Database: Supabase (Postgres)
- Frontend: Next.js

Quick steps

1) Create a Supabase project
   - Create a new project in Supabase and copy the `Connection String` (Postgres URL).
   - In your local machine or Railway, set `DATABASE_URL` to that connection string.

2) Create a Railway service (or use Docker)
   - Option A (Docker): Build and deploy the `backend/Dockerfile` and the repo `Dockerfile` for frontend.
   - Option B (Railway native): Create two services:
     - Backend: configure a Node service and set `start` command to `node dist/index.js`.
     - Frontend: configure a Node service and run `npm run build && npm start`.

Environment variables
- `DATABASE_URL`: Postgres connection string (from Supabase)
- `JWT_SECRET`: A secure random secret for signing JWTs
- `NEXT_PUBLIC_API_URL`: Public URL of the backend (used by the frontend)

Prepare the backend

Locally or in CI, run:

```bash
cd backend
npm ci
# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy # (or `migrate dev` locally)
npm run build
```

Prepare the frontend

```bash
# from repo root
npm ci
npm run build
```

Deploy with Docker (example)

```bash
# Build images
docker build -t job-tracker-frontend .
docker build -t job-tracker-backend ./backend

# Run with env vars
docker run -e DATABASE_URL="<your db url>" -e JWT_SECRET="<secret>" -p 4000:4000 job-tracker-backend
docker run -e NEXT_PUBLIC_API_URL="http://localhost:4000" -p 3000:3000 job-tracker-frontend
```

Railway notes
- Add your Supabase `DATABASE_URL` and `JWT_SECRET` as environment variables in Railway.
- Run `npx prisma migrate deploy` in the build/deploy step to apply migrations.

Publish images to GitHub Container Registry

- The CI workflow now builds and pushes two images:
   - `ghcr.io/<owner>/job-tracker-backend:<sha>`
   - `ghcr.io/<owner>/job-tracker-frontend:<sha>`

Steps to use GHCR images in Railway

1. In your repo settings, allow GitHub Actions to publish packages to GHCR.
2. After the workflow runs, go to `Packages` → `Container registry` to find the image.
3. In Railway, create a new service and choose the Docker image option, then paste the GHCR image URL.

Notes: set the same environment variables in Railway as described above. Use the `LATEST` tag strategy if you want to simplify deployments.

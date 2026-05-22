Railway deployment guide

This file shows how to deploy both the backend and frontend to Railway, including a sample `railway.json` you can adapt.

1) Prepare your Supabase/Postgres database
   - Create a Supabase project and copy the `Connection String` (Postgres URL).
   - In Railway, add a new Environment Variable `DATABASE_URL` with that value.
   - Add `JWT_SECRET` as another Railway environment variable (use a secure random value).

2) Deploy with Railway (web UI)
   - In Railway, create a new Project and connect your GitHub repo.
   - Add two services:
     - Backend service:
       - Source: your repo (path: `backend`)
       - Build command: `npm ci && npx prisma generate && npm run build`
       - Start command: `node dist/index.js`
       - Environment variables: `DATABASE_URL`, `JWT_SECRET`
     - Frontend service:
       - Source: your repo (root path)
       - Build command: `npm ci && npm run build`
       - Start command: `npm start`
       - Environment variable: `NEXT_PUBLIC_API_URL` (set to the backend service URL)

3) Deploy with Railway CLI (example)
   - Install Railway CLI: `npm i -g railway`
   - From repo root:

```bash
railway login
railway init --name job-tracker
# create backend service
railway link --service backend --path backend
railway variables set DATABASE_URL "<your db url>" --service backend
railway variables set JWT_SECRET "<your secret>" --service backend
# create frontend service
railway link --service frontend --path .
railway variables set NEXT_PUBLIC_API_URL "https://your-backend.up.railway.app" --service frontend
railway up
```

4) Migrations
   - In the backend service build step, ensure you run `npx prisma generate` and `npx prisma migrate deploy` (deploy applies migrations to the production DB).

Sample `railway.json` (example)

```json
{
  "services": [
    {
      "name": "backend",
      "path": "backend",
      "build": "npm ci && npx prisma generate && npm run build",
      "start": "node dist/index.js",
      "env": ["DATABASE_URL", "JWT_SECRET"]
    },
    {
      "name": "frontend",
      "path": ".",
      "build": "npm ci && npm run build",
      "start": "npm start",
      "env": ["NEXT_PUBLIC_API_URL"]
    }
  ]
}
```

Notes
 - Railway may run build steps in ephemeral containers; ensure `npx prisma generate` runs during build so the generated client is available.
 - If you prefer Docker images, the CI already pushes GHCR images; you can point Railway at the GHCR URL instead of building from source.

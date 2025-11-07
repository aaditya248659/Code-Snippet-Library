README_DEPLOY.md

Overview
--------
This document contains step-by-step deployment instructions for the Code Snippet Library project.
It targets a simple, maintainable stack:
- MongoDB Atlas (database)
- Render (backend: Node/Express)
- Vercel (frontend: Vite/React)

It also contains the exact environment variables expected by the backend and frontend, local testing commands, and optional advanced guidance (Docker, purge history, CI).

1) Quick repo facts (detected)
-------------------------------
- Backend folder: `backend/`
  - Start script: `node server.js` (package.json `start`)
  - Dev script: `nodemon server.js` (package.json `dev`)
  - Reads DB env var: `MONGO_URI` or `MONGODB_URI`
  - Expects: `JWT_SECRET`, `FRONTEND_URL`, optional `PISTON_API`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
  - Health endpoint: GET `/health` (returns status 200)
  - CORS: configured to use `process.env.FRONTEND_URL` (fallback localhost)
- Frontend folder: `frontend/`
  - Build: `npm run build` -> output in `dist`
  - Uses Vite env var: `import.meta.env.VITE_API_URL` (fallback to `http://localhost:5000` set in `frontend/src/services/api.jsx`)

2) Required environment variables (short list)
----------------------------------------------
Backend (Render / Heroku / Railway):
- MONGO_URI (preferred) or MONGODB_URI
  - Example: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/code-snippets?retryWrites=true&w=majority`
- JWT_SECRET
  - Example: a long random string. Use a secrets manager / Render secret.
- NODE_ENV=production
- FRONTEND_URL
  - Example: `https://your-frontend.vercel.app` (used for CORS)
- PISTON_API (optional)
  - Default used in code: `https://emkc.org/api/v2/piston`. Override only if you host Piston yourself or need an alternate endpoint.
- ADMIN_EMAIL, ADMIN_PASSWORD (optional placeholders used for local seeding/admin tasks)

Frontend (Vercel / Netlify):
- VITE_API_URL
  - Example: `https://your-backend.onrender.com`
  - MUST start with `VITE_` so Vite exposes it to client code.

3) MongoDB Atlas (setup)
-------------------------
- Create a free cluster on MongoDB Atlas.
- Create a database user (username + password) with access to the cluster.
- Network Access: For quick testing, add 0.0.0.0/0 (allow from anywhere). For production, restrict to your host or VPC.
- Copy connection string, replace `<password>` and `<DBNAME>`.
- Use that string as `MONGO_URI` in the backend host's environment variables.

4) Deploy backend to Render (recommended)
-----------------------------------------
Why Render: simple Node hosting, auto deploy from GitHub, good logs.

Steps:
1. Sign in to Render and click New -> Web Service -> Connect GitHub.
2. Choose the repository `Code-Snippet-Library`.
3. Set the Root Directory to `backend/`.
4. Build command: `npm install`
5. Start command: `npm start` (or `node server.js`)
6. Environment: Node 18+ (choose LTS)
7. Add environment variables (the most important ones):
   - `MONGO_URI` = <your atlas connection string>
   - `JWT_SECRET` = <strong_secret_here>
   - `NODE_ENV` = production
   - `FRONTEND_URL` = https://<your-frontend-url>
   - `PISTON_API` = (optional) https://emkc.org/api/v2/piston
   - `ADMIN_EMAIL`/`ADMIN_PASSWORD` = (optional placeholders)
8. Deploy and enable automatic deploys from `main` branch.
9. Confirm the service URL (e.g., `https://your-backend.onrender.com`).
10. Verify `GET /health` returns 200.

Notes:
- Render will set `PORT` automatically — server already uses `process.env.PORT || 5000`.
- Check logs in Render to troubleshoot any runtime errors.

5) Deploy frontend to Vercel (recommended)
------------------------------------------
Why Vercel: excellent Vite support and previews.

Steps:
1. Sign in to Vercel and click New Project -> Import Git Repository.
2. Select repository `Code-Snippet-Library`.
3. Set the Root Directory to `frontend/`.
4. Framework Preset: Vite (should detect automatically).
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add Environment Variable (Project Settings):
   - `VITE_API_URL` = https://<your-backend-url>  (example: `https://your-backend.onrender.com`)
8. Deploy and enable automatic deploys from `main`.
9. Note the frontend URL (e.g., `https://your-frontend.vercel.app`).
10. Set `FRONTEND_URL` in backend env to this URL (so CORS matches).

6) Local testing before deploy
------------------------------
Run backend locally (dev):
```powershell
cd "C:\Users\aadit\Desktop\Code Snippet Library\backend"
npm install
npm run dev   # uses nodemon, server will run at http://localhost:5000 by default
```
Run frontend locally (dev):
```powershell
cd "C:\Users\aadit\Desktop\Code Snippet Library\frontend"
npm install
npm run dev   # Vite dev server at http://localhost:5173
```
Build frontend (what Vercel will run):
```powershell
cd "C:\Users\aadit\Desktop\Code Snippet Library\frontend"
npm run build
# Build output will be in frontend/dist
```
Verify requests: open dev frontend, check network calls are to `http://localhost:5000/api` (the frontend fallback), or set `VITE_API_URL` locally via `.env` file in `frontend/` (create `.env` with `VITE_API_URL=http://localhost:5000`).

Local testing with Docker Compose (recommended)
------------------------------------------------
I added a `docker-compose.yml` at the repo root for quick local testing of the backend + MongoDB. It builds the `backend` image from `backend/Dockerfile` and brings up a `mongo` service with a persistent volume.

To run locally (PowerShell):
```powershell
# from repo root
docker-compose up --build -d

# view backend logs
docker-compose logs -f backend

# test backend health
Invoke-RestMethod -Uri http://localhost:5000/health

# stop and remove
docker-compose down
```

The compose file maps MongoDB to `mongodb://mongo:27017/code_snippet_library` inside the Docker network. The backend service is exposed on port 5000.

Backup script
-------------
I also added `scripts/backup/backup.sh` — a small `mongodump` wrapper that creates a gzipped archive and uploads it to S3 if `S3_BUCKET` is set. Use Render Cron Jobs to run this on a schedule, or run from a small worker/container.

Example Render Cron Job configuration (UI):
- Create a new Job (or Worker) on Render and point it to the repo or use a small image with `mongodump` and `aws` CLI installed.
- Schedule: e.g., `0 2 * * *` (daily at 2:00 UTC)
- Command: `./scripts/backup/backup.sh`
- Environment: `MONGO_URI`, `S3_BUCKET`, and AWS creds (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).


7) Post-deploy verification checklist
-------------------------------------
- Visit frontend URL and ensure the site loads.
- Try register/login flows; verify tokens are returned and stored.
- Run playground execute: enter code and press run. Confirm results.
- Confirm backend logs show healthy connections and no repeated errors.
- Confirm `/health` returns a JSON status and 200.
- Confirm CORS is working: no CORS errors in browser console.

8) Security & operational recommendations
----------------------------------------
- Secrets: never commit secrets. Use Render/Vercel environment variables.
- Rate limiting: add express-rate-limit on `/api/playground/execute` to prevent abuse.
- Usage caps: consider limiting number of runs per IP/user per minute.
- Monitoring: enable Render/Vercel alerts and attach Sentry or a similar error tracker.
- Backups: set up MongoDB backups (Atlas provides this in paid tiers).

9) Optional: purge node_modules and large files from git history (advanced)
---------------------------------------------------------------------------
If you want to permanently remove node_modules and log files from repository *history* (to reduce repo size):
- Use BFG Repo-Cleaner or `git filter-repo`.
- This rewrites history and requires a forced push; all collaborators must re-clone afterwards.
- I can prepare exact commands if you want to proceed.

10) Optional: Docker/one-host quick path
----------------------------------------
I can prepare Dockerfiles for backend and frontend and a `docker-compose.yml` if you prefer to host everything on a single server (DigitalOcean droplet, VPS). This is a good path if you want a single host and control over the infra.

11) Useful env var template (copy into Render / Vercel env UI)
-------------------------------------------------------------
Backend (Render):
- MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/code-snippet-library
- JWT_SECRET=<strong-random-string>
- NODE_ENV=production
- FRONTEND_URL=https://your-frontend.vercel.app
- PISTON_API=https://emkc.org/api/v2/piston
- ADMIN_EMAIL=admin@example.com (optional)
- ADMIN_PASSWORD=choose-a-secure-password (optional placeholder)

Frontend (Vercel project settings):
- VITE_API_URL=https://your-backend.onrender.com

12) Troubleshooting quick tips
------------------------------
- If frontend requests fail with 401: verify `JWT_SECRET` matches what the backend expects, and tokens are generated and sent in Authorization header by frontend.
- If CORS errors occur: ensure `FRONTEND_URL` exactly matches the origin (protocol + domain) of Vercel deployment.
- If Mongo connection fails: confirm `MONGO_URI` user/password and network whitelist in Atlas (0.0.0.0/0 for quick testing).

13) Want me to generate files or CI?
------------------------------------
I can optionally:
- Generate a `README_DEPLOY.md` (this file) in the repo (done).
- Add a basic GitHub Actions CI to run tests on push.
- Add a small `express-rate-limit` integration on `backend/routes/playground.js`.
- Create Dockerfiles and `docker-compose.yml`.
- Prepare BFG/git-filter-repo commands to purge history.

If you want any of these, tell me which and I will scaffold them.

-- End of deployment guide

Render-hosted MongoDB guidance removed
-------------------------------------
This repository previously included optional guidance for running a MongoDB
container on Render. You've chosen MongoDB Atlas for production — good choice
for managed backups, HA, and ease of use.

If you still want to run a Mongo container on Render (not recommended for
production), the old guidance existed here. Instead, for production, follow the
MongoDB Atlas steps in Section 3 and set the Atlas connection string as
`MONGO_URI` in your Render backend service environment variables.

Render manifest (optional)
---------------------------
The `render.yaml` at the repo root now contains only the backend service and
an optional backup job. It does not create a Mongo service because production
will use Atlas. Before using `render.yaml`, open it and replace placeholders
(`REPLACE_WITH_ATLAS_MONGO_URI`, repo URL, and `S3_BUCKET`). DO NOT commit
secrets — set them in the Render UI as encrypted env vars.

If you want, I can:
- Fill the `render.yaml` with your GitHub repo owner and non-secret values.
- Produce PowerShell / curl payloads that call the Render API to create the
  backend service and cron job (you'll provide a Render API key to run them).

# BudgetMate Planner (Full Stack)

BudgetMate is now a full-stack personal finance app:

- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Node.js + Express
- Database: Prisma + SQLite
- Auth: JWT + bcrypt password hashing

## Features

- User signup/login with JWT authentication
- Protected routes and session persistence
- Manage transactions (add/edit/delete)
- Manage budgets (add)
- Manage categories (admin only create/edit/delete)
- Manage user settings (currency/theme)
- Reset all user data to defaults

## Project structure

- `src/` frontend app
- `server/src/` backend API
- `server/prisma/schema.prisma` database schema

## Local setup

### 1) Install dependencies

```bash
npm install
npm run server:install
```

### 2) Configure environment variables

Create frontend env file:

```bash
cp .env.example .env
```

Create backend env file:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell use:

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
```

### 3) Run database migration

```bash
npm run server:db:migrate
```

### 4) Start frontend + backend together

```bash
npm run dev:full
```

App URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api

## Important backend env variables

In `server/.env`:

- `DATABASE_URL="file:./dev.db"`
- `JWT_SECRET="replace_with_a_long_random_secret"`
- `PORT=4000`
- `FRONTEND_URL="http://localhost:5173"`
- `FRONTEND_URLS="https://your-frontend-domain.com,https://your-other-domain.com"` (optional)
- `ALLOW_VERCEL_ORIGIN="true"` (optional for `*.vercel.app` preview domains)

## Deployment guide

You can deploy frontend and backend separately.

## Docker Compose deployment (free on your own VPS)

This project can run as full stack using Docker Compose:

- `frontend` container: Nginx serving built React app
- `backend` container: Node + Express + Prisma
- `budgetmate_data` volume: persistent SQLite database file

### 1) Prerequisites

- Docker installed
- Docker Compose plugin installed (`docker compose` command)

### 2) Configure compose environment

Create compose env file from example:

```bash
cp .env.compose.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.compose.example .env
```

Update `.env` values:

- `JWT_SECRET` (required, strong random string)
- `FRONTEND_URL` (default `http://localhost:8080`)
- `FRONTEND_URLS` (optional comma-separated extra domains)

### 3) Build and run

```bash
docker compose up -d --build
```

### 4) Verify services

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:4000/api/health` (inside compose network; API also available via frontend domain on `/api`)

Health check through frontend routing:

```bash
curl http://localhost:8080/api/health
```

### 5) Stop services

```bash
docker compose down
```

Keep database data (recommended):

```bash
docker compose down
```

Remove database volume too (this deletes all app data):

```bash
docker compose down -v
```

### 6) Update after code changes

```bash
docker compose up -d --build
```

### Notes

- Frontend is built with `VITE_API_URL=/api` in compose, so browser uses same-origin API calls.
- Backend runs `prisma migrate deploy` on container startup.
- SQLite file is stored in Docker volume `budgetmate_data` for persistence.

### Backend deployment (Render/Railway/Fly/VM)

1. Deploy `server/` as a Node service.
2. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`.
3. Run migrations during deploy:
	- `npm run db:deploy`
4. Start command:
	- `npm run start`

### Frontend deployment (Vercel/Netlify)

1. Deploy project root as static frontend.
2. Set frontend env var:
	- `VITE_API_URL=https://your-backend-domain/api`
3. Build command:
	- `npm run build`
4. Publish directory:
	- `dist`

### Vercel Login/Signup fix checklist

If login/signup works locally but fails on Vercel, verify all of these:

1. Frontend env on Vercel is set:
	- `VITE_API_URL=https://your-backend-domain/api`
2. Backend is deployed separately (Vercel static frontend alone is not enough).
3. Backend CORS allows your frontend domain:
	- Set `FRONTEND_URL=https://your-vercel-domain.vercel.app`
	- Optionally set `ALLOW_VERCEL_ORIGIN=true` for preview URLs.
4. After env updates, redeploy frontend and restart backend service.

## API overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/bootstrap`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `POST /api/budgets`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `PATCH /api/settings`
- `POST /api/reset`

## Notes

- First user who signs up gets `admin` role.
- Categories page operations are admin-restricted at both UI and API levels.
- Auth token and user session are persisted in browser localStorage.

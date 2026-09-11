# CalPal Docker Containerization & Deployment Guide

This guide covers everything needed to build, run, and orchestrate the **CalPal Full-Stack Application** using **Docker** and **Docker Compose**.

---

## 1. System Architecture & Container Topology

```
                         ┌─────────────────────────────┐
                         │   Client / Web Browser      │
                         └──────────────┬──────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │  Port 3000                            │  Port 3001
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │   Frontend (my-app)    │              │ Backend (nest-prisma)  │
       │   Next.js 16 (React 19)│─────────────▶│ NestJS 11 + Prisma     │
       │   Standalone Runner    │  Client API  │ REST API & Swagger     │
       │   Non-root: nextjs     │              │ Non-root: nestjs       │
       └────────────────────────┘              └───────────┬────────────┘
                                                           │ Internal Network
                                                           │ db:5432
                                                           ▼
                                               ┌────────────────────────┐
                                               │ Database (PostgreSQL)  │
                                               │ postgres:16-alpine     │
                                               │ Named Volume:          │
                                               │ calpal-postgres-data   │
                                               └────────────────────────┘
```

| Service | Container Name | Base Image | Exposed Port | Role & Details |
| :--- | :--- | :--- | :---: | :--- |
| **`db`** | `calpal-postgres` | `postgres:16-alpine` | `5432` | Relational PostgreSQL database with health check probe (`pg_isready`) and named volume persistence. |
| **`backend`** | `calpal-backend` | `node:22-alpine` | `3001` | NestJS API with Prisma ORM, FatSecret integration, Gemini AI Vision, rate limiting, and Swagger at `/api`. |
| **`frontend`** | `calpal-frontend` | `node:22-alpine` | `3000` | Next.js standalone container optimized for production with Clerk authentication. |

---

## 2. Prerequisites & Environment Setup

### 2.1 Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows / Linux) with Docker Compose v2.20+.

### 2.2 Docker Environment File (`.env.docker`)
The project includes a ready-to-use `.env.docker` at the workspace root:

```env
# ─── PostgreSQL Database Configuration ───
POSTGRES_USER=YOUR_USER
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=YOUR_DB
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@db:5432/YOUR_DB

# ─── NestJS Backend Configuration ───
BACKEND_PORT=3001
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
FATSECRET_CLIENT_ID=...
FATSECRET_CLIENT_SECRET=...
GEMINI_KEY=AIzaSy...

# ─── Next.js Frontend Configuration ───
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/profile-setup
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/profile-setup
```

---

## 3. Quickstart: Building & Running

### 3.1 Start Full Stack (Detached Mode)
To build all images and start all 3 containers in the background:
```bash
docker compose --env-file .env.docker up -d --build
```

### 3.2 Verify Running Services
```bash
docker compose ps
```
You should see all 3 services running with `healthy` status:
* `calpal-postgres` $\rightarrow$ `Up (healthy)`
* `calpal-backend` $\rightarrow$ `Up (healthy)`
* `calpal-frontend` $\rightarrow$ `Up`

### 3.3 Test Endpoints in Browser
* 🌐 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* 📖 **Interactive Swagger UI**: [http://localhost:3001/api](http://localhost:3001/api)
* 🏥 **Database Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 4. Useful Docker Commands & Operations

### 4.1 Streaming Logs
```bash
# View logs from all services:
docker compose logs -f

# View backend logs specifically:
docker compose logs -f backend

# View frontend logs:
docker compose logs -f frontend

# View database query logs:
docker compose logs -f db
```

### 4.2 Graceful Shutdown & Stopping
```bash
# Stop containers without losing database data (Named volume is preserved):
docker compose down

# Stop and wipe database volume completely (Fresh start):
docker compose down -v
```

### 4.3 Running Prisma Migrations or DB Push Inside Backend
```bash
docker compose exec backend npx prisma db push
```

### 4.4 Opening PostgreSQL CLI Inside Container
```bash
docker compose exec db psql -U postgres -d postgres
```

---

## 5. Security & Optimization Best Practices

### 5.1 Multi-Stage Builds & Standalone Next.js
* **Next.js Standalone Mode**: Enabled via `output: 'standalone'` in `my-app/next.config.ts`. This traces all necessary server dependencies and strips away unneeded development files, dropping image size from **~1.1 GB down to ~120 MB**.
* **Prisma Engine in Alpine**: Uses `openssl` in Alpine to run native Prisma query engines smoothly.

### 5.2 Non-Root User Isolation
Both frontend and backend containers execute as isolated non-root users:
* **Frontend**: `USER nextjs` (UID: `1001`, GID: `1001`)
* **Backend**: `USER nestjs` (UID: `1001`, GID: `1001`)

### 5.3 Reliable Data Persistence via Named Volumes
Instead of fragile host bind mounts that can cause `EACCES` file permission conflicts between macOS and Linux, the PostgreSQL database uses Docker-managed named volume `postgres_data` (`calpal-postgres-data`).

---

## 6. Troubleshooting & FAQ

### Issue 1: Port `3001` or `5432` Already in Use
**Symptom**: `Bind for 0.0.0.0:3001 failed: port is already allocated`
**Fix**: Stop any local background Node or Postgres processes running on your host machine before launching Docker:
```bash
# On macOS:
lsof -ti :3001 | xargs kill -9
lsof -ti :5432 | xargs kill -9
```

### Issue 2: Backend Cannot Connect to Database
**Symptom**: `P1001: Can't reach database server at 'db:5432'`
**Fix**: Ensure `DATABASE_URL` in `.env.docker` uses `db` as the hostname (the Docker network service name) rather than `localhost`:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@db:5432/YOUR_DB
```

### Issue 3: Schema Out of Sync in Docker
**Symptom**: Database tables missing when opening the app.
**Fix**: The backend `docker-entrypoint.sh` automatically runs `npx prisma db push` upon boot. You can also trigger it manually:
```bash
docker compose exec backend npx prisma db push
```

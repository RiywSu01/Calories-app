# 🥑 CalPal — Next-Gen Metabolic Health & Nutrition Platform

<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS 11](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma 7](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Google Gemini 3.6](https://img.shields.io/badge/Google_Gemini_3.6-8E75B2?style=for-the-badge&logo=google&logoColor=white)

**An enterprise-grade, full-stack nutrition and calorie tracking platform featuring clinical metabolic calculations, verified food databases, and zero-storage multimodal AI vision.**

[Live API Docs (Swagger)](#-api-documentation-swagger) • [Architecture](#%EF%B8%8F-system-architecture) • [Getting Started](#-getting-started) • [Technical Docs](#-in-depth-documentation)

</div>

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#%EF%B8%8F-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Database Schema](#-database-schema)
6. [Zero-Storage AI Vision Pipeline](#-zero-storage-ai-vision-pipeline)
7. [Getting Started](#-getting-started)
   - [Running with Docker Compose (Recommended)](#1-running-with-docker-compose-recommended)
   - [Running Locally for Development](#2-running-locally-for-development)
   - [Testing Webhooks Locally (ngrok Tunnel)](#3-testing-webhooks-locally-ngrok-tunnel)
   - [Running Automated Tests](#4-running-automated-tests)
8. [Environment Variables](#-environment-variables)
9. [API Documentation (Swagger)](#-api-documentation-swagger)
10. [Security & Optimization](#-security--optimization)
11. [In-Depth Documentation](#-in-depth-documentation)

---

## 🌟 Overview

**CalPal** solves dietary tracking fatigue, inaccurate caloric estimations, and privacy risks by unifying:
1. **Clinical Metabolic Baselines**: Automated BMR & TDEE calculation via the **Mifflin-St Jeor** formula, tailoring calories and 30/25/45 macronutrient splits directly to individual biometrics with a clinical safety floor (1,200 kcal).
2. **Dual-Tier Food Sourcing**: Combines custom homemade user recipes with over 1,000,000+ brand-verified clinical food items from the **FatSecret Platform API**.
3. **Zero-Storage Multimodal AI Vision**: Instant photo-to-diary logging via **Google Gemini 3.6 Flash** without persisting any user images to disk or cloud buckets ($0.00 cloud storage cost, zero privacy footprint).
4. **Bi-Directional Identity Synchronization**: Seamless integration between **Clerk Auth** and **PostgreSQL** using cryptographically verified Svix webhooks and React 19 Server Actions.
5. **Enterprise Reliability & Rate Limiting**: Multi-tier sliding-window throttlers (`@nestjs/throttler`), 24-hour in-memory caching for FatSecret ToS compliance, and hardened non-root multi-stage Docker containers.

---

## ⚡ Key Features

### 🏠 1. Interactive Landing Page & Metabolic Calculator Preview (`/`)
* **Live Metabolic Calculator**: Interactive demo on the landing page letting visitors preview calculated BMR, TDEE, and daily caloric targets before registering.
* **Feature Highlights & Value Proposition**: Clean, responsive showcase of AI vision parsing, macro tracking, and personalized goal modes.
* **Direct Onboarding Call-to-Action**: Fast navigation into Clerk sign-up and onboarding wizard.

### 📊 2. Interactive Metabolic Dashboard (`/dashboard`)
* **7-Day Dynamic Calendar Strip**: Real-time week carousel with 1-click day navigation, instant "Today" reset, and view-only protection for past and future records.
* **Animated SVG Calorie Ring**: Smooth progress transitions with dynamic chromatic feedback (Mint for on-target, Coral/Peach when exceeding daily budget).
* **Macronutrient Tracking**: Real-time gram counters and progress meters for Protein, Carbohydrates, and Dietary Fat.
* **Meal Categories**: Expandable accordions for **Breakfast**, **Lunch**, and **Dinner** with subtotal calories and macro breakdowns.
* **Optimistic Deletion**: Instant UI updates with background synchronization to the backend database.
* **Nutrition Tips Carousel**: Curated, digestible nutrition advice cards with interactive modal viewing.
* **Light / Dark Theme**: Smooth theme toggling with zero flash-of-unstyled-content (FOUC) and local storage persistence.

### 🎯 3. Biometric Onboarding Wizard (`/profile-setup`)
* **Step 1 — Personal Biometrics**: Validated input for Gender, Date of Birth, Height (cm), and Weight (kg).
* **Step 2 — Activity Tiers**: 5 selectable lifestyle levels (Sedentary, Light, Moderate, Active, Very Active).
* **Step 3 — Goal Configuration**: Dynamic target calculation for **Lose Weight** (-500 kcal), **Maintain** (0 kcal), or **Gain Muscle** (+300 kcal), strictly protected by a **1,200 kcal clinical safety floor**.
* **Automatic Routing**: Directs completed profiles to `/dashboard`, redirecting admins to `/admin`.
* **Celebratory Screen**: In-page animated completion sequence before entering the application.

### 🍽️ 4. Multi-Modal Food Logging Hub (`/add-food`)
* 🔍 **FatSecret Search (`/add-food/search`)**: Real-time keyword search across 1,000,000+ verified branded and generic food items with portion selectors (grams, servings, cups, oz).
* 📸 **Zero-Storage AI Vision (`/add-food/ai`)**: Upload or snap a photo. Compressed in browser memory ($< 250\text{ KB}$), analyzed by Google Gemini 3.6 Flash, and verified against FatSecret's clinical database.
* ✍️ **Natural Language Prompting**: Type what you ate (e.g., *"two scrambled eggs with avocado toast"*) to have AI parse dish components automatically.
* 🍳 **Custom Food Builder & Library (`/add-food/customize`)**: Create, save, and reuse custom homemade recipes with custom portion units and nutritional macro values.

### 🛡️ 5. Server-Side Protected Admin Console (`/admin`)
* **Role-Based Access Control (RBAC)**: Strictly guarded at the Next.js server layer (`sessionClaims.metadata.role === 'admin'`). Non-admin requests are redirected before HTML generation.
* **Unified Directory**: Automatically merges Clerk identity accounts with PostgreSQL biometrics and daily nutritional targets.
* **Atomic Role Mutations**: Promote or demote users between `'user'` and `'admin'` using React 19 Server Actions with automatic two-way sync (Clerk + PostgreSQL).

### 🩺 6. Diagnostic & Compliance Features
* 🔑 **Token Test Tool (`/get-token`)**: Instant Clerk JWT retrieval page for testing authenticated backend API endpoints and Swagger UI.
* ⚖️ **FatSecret Attribution & Disclaimer**: Integrated `FatSecretAttribution` component providing mandatory legal attribution and medical disclaimers as required by the FatSecret Platform Terms of Service.

---

## 🏗️ System Architecture

```
                         ┌─────────────────────────────┐
                         │   Client / Web Browser      │
                         └──────────────┬──────────────┘
                                        │ HTTPS / JSON
                    ┌───────────────────┴───────────────────┐
                    │  Port 3000                            │  Port 3001
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │   Frontend (my-app)    │              │ Backend (nest-prisma)  │
       │   Next.js 16 (React 19)│─────────────▶│ NestJS 11 + Prisma 7   │
       │   • SSR & Client Comp. │  Client API  │ • REST Controllers     │
       │   • Canvas Compression │              │ • Multi-tier Throttle  │
       │   • Server Actions     │              │ • Swagger at /api      │
       └────────────────────────┘              └───────────┬────────────┘
                    │                                      │
                    │ OAuth / JWT                          │ Internal Network
                    ▼                                      │ db:5432
       ┌────────────────────────┐                          ▼
       │   Clerk Auth Server    │              ┌────────────────────────┐
       │   • Session Claims     │              │ Database (PostgreSQL)  │
       │   • Webhook Dispatcher │─────────────▶│ PostgreSQL 16 Alpine   │
       └────────────────────────┘  Svix Hook   │ Named Volume:          │
                                   rawBody:true│ calpal-postgres-data   │
                                               └────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology | Version | Description |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | **Next.js (App Router)** | `16.2.10` | Hybrid Server & Client Components powered by React 19. |
| **UI Library** | **React** | `19.2.4` | Latest React runtime with Server Actions & concurrent features. |
| **Styling & Design** | **Tailwind CSS + HSL Tokens** | `v4` | Modern CSS styling, glassmorphism, responsive design, dark mode. |
| **Icons** | **Lucide React** | `^1.31.0` | Accessible, consistent vector iconography. |
| **Backend Framework** | **NestJS** | `11.0.1` | Enterprise TypeScript framework with modular architecture and dependency injection. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | `16` / `7.8.0` | Relational schema with cascading foreign keys, enums, and composite indexes. |
| **Authentication** | **Clerk Auth** | `@clerk/nextjs 7.6` | Session management, RBAC metadata, and Svix-verified webhooks. |
| **Nutritional Database** | **FatSecret Platform API** | REST / OAuth 2.0 | 1M+ clinical items, OAuth 2.0 client credentials, 24-hour cache compliance. |
| **Multimodal Vision AI** | **Google Gemini 3.6 Flash** | `gemini-3.6-flash` | Direct native REST integration for zero-dependency, low-latency visual reasoning. |
| **Rate Limiting** | **`@nestjs/throttler`** | `^6.5.0` | 3-tier sliding window rate limiter (Burst, Medium, Sustained). |
| **Caching** | **`@nestjs/cache-manager`** | `^3.1.3` | Ephemeral RAM cache for OAuth tokens and search queries (ToS 24h compliance). |
| **Containerization** | **Docker & Docker Compose** | Multi-Stage | Alpine Linux base images running hardened non-root user execution. |

---

## 🗄️ Database Schema

```
┌─────────────────────────┐           ┌─────────────────────────┐
│          users          │           │      user_profiles      │
├─────────────────────────┤           ├─────────────────────────┤
│ user_id (PK, String)    │───(1:1)───│ user_id (PK, FK)        │
│ email (Unique)          │           │ auth_provider (Enum)    │
│ username                │           │ height_cm, weight_kg    │
│ role (user | admin)     │           │ date_of_birth, gender   │
│ created_at, updated_at  │           │ bmr, tdee, bmi          │
└────────────┬────────────┘           │ goal_mode (lose|main|gain│
             │                        │ target_calories/protein │
           (1:N)                      │ target_fat, target_carbs│
             │                        │ activity_level (Enum)   │
             ▼                        │ created_at, updated_at  │
┌─────────────────────────┐           └─────────────────────────┘
│        food_logs        │           ┌─────────────────────────┐
├─────────────────────────┤           │          foods          │
│ food_log_id (PK, UUID)  │           ├─────────────────────────┤
│ user_id (FK -> users)   │           │ food_id (PK, UUID)      │
│ food_id (FK -> foods)?  │───(N:1)───│ food_name (Unique)      │
│ fatsecret_food_id?      │           │ calories_per_serving    │
│ fatsecret_serving_id?   │           │ serving_size / unit     │
│ quantity                │           │ protein, fat, carbs     │
│ total_calories, macros  │           │ category, image_url     │
│ meal_type (B/L/D)       │           │ created_at, updated_at  │
│ created_at (Indexed)    │           └─────────────────────────┘
└─────────────────────────┘
```

* **Dual-Sourcing Architecture**: `food_logs` supports both internal custom recipes (`food_id`) and external FatSecret items (`fatsecret_food_id` + `fatsecret_serving_id`).
* **Snapshot Nutrition**: Exact calories, protein, fat, and carbs are stored directly on the log row to preserve historical accuracy even if base food items are modified.
* **Composite Index**: `[user_id, created_at DESC]` for sub-2ms daily diary queries.
* **Cascade Lifecycle**: Deleting a user automatically cascades to their profile and food logs via PostgreSQL foreign keys.

---

## 📷 Zero-Storage AI Vision Pipeline

CalPal runs a privacy-first, zero-storage image processing pipeline:

```
1. User captures photo on mobile or uploads an image / types prompt
                     │
                     ▼
2. Client Canvas Downscaling: Image resized to max 1024px & JPEG compressed (< 250 KB Base64)
                     │
                     ▼ HTTPS POST /foods/ai-analyze
3. NestJS AiVisionService formats structured schema prompt
                     │
                     ▼ Direct HTTPS REST
4. Google Gemini 3.6 Flash extracts:
   {
     "foodName": "Grilled Salmon",
     "thinking": "Pinkish flaky flesh with grill char marks, garnished with lemon...",
     "confidenceScore": 0.95
   }
                     │
                     ▼ Backend auto-queries
5. FatSecret Database searches "Grilled Salmon" -> Returns verified clinical serving sizes & macros
                     │
                     ▼
6. Frontend displays AI Reasoning Banner + Confidence Badge (95%) + Verified Food Cards
                     │
                     ▼
7. User selects serving portion -> Saved to PostgreSQL
   (Image data is discarded from RAM — $0.00 storage cost, zero privacy footprint)
```

---

## 🚀 Getting Started

### 1. Running with Docker Compose (Recommended)

The fastest and most reliable way to run the entire CalPal stack (Database, Backend API, and Frontend) is using Docker Compose.

#### Step 1: Ensure Docker Desktop is running
Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and active on your system.

#### Step 2: Configure Environment (`.env.docker`)
The repository includes a pre-configured `.env.docker` at the project root. Ensure your API keys are set:
```env
# ─── PostgreSQL Database Configuration ───
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=postgres
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB?schema=public

# ─── NestJS Backend Configuration ───
BACKEND_PORT=3001
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
FATSECRET_CLIENT_ID=your_fatsecret_id
FATSECRET_CLIENT_SECRET=your_fatsecret_secret
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

#### Step 3: Build & Start Containers
```bash
docker compose --env-file .env.docker up -d --build
```

#### Step 4: Access Applications
* **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* **Backend API & Swagger**: [http://localhost:3001/api](http://localhost:3001/api)
* **API Health Check**: [http://localhost:3001/health](http://localhost:3001/health)
* **PostgreSQL Host Port**: `localhost:5433` (maps to internal `5432`)

#### Docker Lifecycle Commands
| Action | Command |
| :--- | :--- |
| **View real-time logs** | `docker compose logs -f` |
| **Check container status** | `docker compose ps` |
| **Stop containers** | `docker compose down` |
| **Stop and wipe database volume** | `docker compose down -v` |
| **Clean rebuild from scratch** | `docker compose --env-file .env.docker up -d --build --force-recreate` |

---

### 2. Running Locally for Development

If you prefer running the applications directly on your host machine:

#### Prerequisites
* **Node.js 22+** & **npm**
* **PostgreSQL 16** running locally on port `5432`

#### Step 1: Start Backend (`nest-prisma`)
```bash
cd nest-prisma
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, FATSECRET_*, and GEMINI_KEY
npx prisma generate
npx prisma db push
npm run start:dev
```
*Backend runs on [http://localhost:3001](http://localhost:3001). Swagger is available at [http://localhost:3001/api](http://localhost:3001/api).*

#### Step 2: Start Frontend (`my-app`)
```bash
cd my-app
npm install
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
npm run dev
```
*Frontend runs on [http://localhost:3000](http://localhost:3000).*

---

### 3. Testing Webhooks Locally (ngrok Tunnel)

Clerk user lifecycle events (`user.created`, `user.updated`, `user.deleted`) require a public URL to receive HTTP webhooks:

1. Start an ngrok tunnel pointing to the NestJS backend:
   ```bash
   ngrok http 3001
   ```
2. Copy the generated HTTPS forwarding URL (e.g., `https://abc1234.ngrok-free.app`).
3. In the [Clerk Dashboard](https://dashboard.clerk.com) -> **Webhooks**:
   - Add endpoint: `https://abc1234.ngrok-free.app/user/webhook`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the Signing Secret (`whsec_...`) and update `CLERK_WEBHOOK_SECRET` in your `.env`.
4. Test with **"Testing -> Send Example"** in Clerk Dashboard to verify database synchronization without creating real accounts.

---

### 4. Running Automated Tests

```bash
# Run NestJS Unit Tests
cd nest-prisma
npm run test

# Run Rate-Limiting Load Tests (Autocannon)
npm run test:ratelimit
```

---

## 🔐 Environment Variables

### Backend (`nest-prisma/.env` or `.env.docker`)

| Variable | Scope | Required | Description |
| :--- | :--- | :---: | :--- |
| `DATABASE_URL` | Backend / Docker | Yes | PostgreSQL connection string (`postgresql://USER:PASSWORD@host:5432/DB`). |
| `PORT` / `BACKEND_PORT` | Backend | Yes | Port for NestJS backend (Default: `3001`). |
| `CLERK_SECRET_KEY` | Backend & Next.js | Yes | Clerk private API secret key (`sk_test_...`) for JWT authentication and user management. |
| `CLERK_WEBHOOK_SECRET`| Backend | Yes | Svix webhook signing secret (`whsec_...`) for HMAC signature verification. |
| `FATSECRET_CLIENT_ID` | Backend | Yes | FatSecret developer OAuth 2.0 client ID. |
| `FATSECRET_CLIENT_SECRET` | Backend | Yes | FatSecret developer OAuth 2.0 client secret. |
| `GEMINI_KEY` | Backend | Yes | Google Gemini API key for multimodal vision inference (`AIzaSy...`). Also accepts `GEMINI_API_KEY`. |

### Frontend (`my-app/.env.local` or `.env.docker`)

| Variable | Scope | Required | Description |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | Target URL for the NestJS backend API (`http://localhost:3001`). |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend | Yes | Clerk public key (`pk_test_...`) for client-side authentication widgets. |
| `CLERK_SECRET_KEY` | Frontend | Yes | Clerk secret key for Server Components and Server Actions. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Frontend | Yes | Path to sign-in page (`/sign-in`). |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Frontend | Yes | Path to sign-up page (`/sign-up`). |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Frontend | Yes | Post sign-in redirect fallback (`/profile-setup`). |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Frontend | Yes | Post sign-up redirect fallback (`/profile-setup`). |

---

## 📚 API Documentation (Swagger)

The backend provides fully interactive **OpenAPI 3.0** documentation powered by Swagger.

* **Swagger URL**: [http://localhost:3001/api](http://localhost:3001/api)
* **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

### Key Endpoints

| Tag | Method | Endpoint | Description | Rate Limit (Short / Med / Long) | Auth |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **App** | `GET` | `/health` | Live PostgreSQL connectivity check & server uptime. | `@SkipThrottle()` | Public |
| **Foods** | `POST` | `/foods/ai-analyze` | Multimodal photo & text recognition via Gemini + FatSecret. | **1/s, 3/10s, 10/min** | Public |
| **Foods** | `GET` | `/foods/search` | Search 1M+ verified items with 24h RAM cache. | **3/s, 10/10s, 25/min** | Public |
| **Foods** | `GET` | `/foods/external/:id` | Fetch verified serving sizes & macros for a FatSecret item. | **5/s, 15/10s, 40/min** | Public |
| **Foods** | `GET` | `/foods/cache-dump` | Inspect in-memory 24h cache state (Diagnostic tool). | `@SkipThrottle()` | Public |
| **Foods** | `POST` | `/foods` | Create a custom homemade recipe. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Foods** | `GET` | `/foods` | Retrieve all custom homemade dishes. | Baseline (3/s, 15/10s, 60/min) | Public |
| **Foods** | `GET` | `/foods/:id` | Get single custom food item by UUID. | Baseline (3/s, 15/10s, 60/min) | Public |
| **Foods** | `PATCH`| `/foods/edit/:id` | Update custom food recipe. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Foods** | `DELETE`| `/foods/remove/:id`| Remove custom food recipe from database. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Food Logs** | `GET` | `/food-logs` | Query diary logs with date, user, and timezone filters. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Food Logs** | `POST` | `/food-logs` | Log meal entry (Breakfast, Lunch, or Dinner). | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Food Logs** | `PATCH`| `/food-logs/:id` | Update logged food quantity or meal slot. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Food Logs** | `DELETE`| `/food-logs/:id` | Delete food log entry from diary. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **User Profiles** | `POST` | `/profile` | Calculate and persist BMR, TDEE, and macro goals. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **User Profiles** | `GET` | `/profile/:id` | Fetch user biometric profile & targets. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **User Profiles** | `PATCH`| `/profile/:id` | Update height, weight, activity, or target calories. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Users** | `GET` | `/user` | List all users and profiles (Admin directory). | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Users** | `PATCH`| `/user/:id` | Update user role or account details. | Baseline (3/s, 15/10s, 60/min) | Clerk JWT |
| **Webhooks** | `GET` | `/user/webhook` | Webhook route health check. | Baseline (3/s, 15/10s, 60/min) | Public |
| **Webhooks** | `POST` | `/user/webhook` | Clerk user lifecycle webhook (Svix signature verified). | Baseline (3/s, 15/10s, 60/min) | Svix HMAC |

---

## 🛡️ Security & Optimization

* **Multi-Tier Sliding-Window Throttling**: Protects external API quotas against keystroke spam, burst scrapers, and malicious exhaustion using 3 sliding windows (Burst: 1s, Medium: 10s, Sustained: 60s) via `@nestjs/throttler`.
* **Svix Cryptographic Webhook Integrity**: Express body parsing is bypassed for webhook routes (`rawBody: true`), preserving exact unparsed byte buffers for accurate HMAC-SHA256 signature verification.
* **Server-Side RBAC**: Admin routes are protected on the Next.js server before rendering HTML (`sessionClaims.metadata.role === 'admin'`), eliminating client-side inspection vulnerabilities.
* **Non-Root Docker Hardening**: Production Docker containers execute under dedicated non-root users (`USER nextjs` and `USER nestjs`) with minimal Alpine base images.
* **Direct REST AI Integration**: Invokes Google Gemini REST endpoints using Node.js native `fetch()`, keeping server memory minimal (~0 MB extra overhead) and eliminating out-of-memory crashes on 512 MB cloud containers.
* **ToS-Compliant 24h In-Memory Caching**: Implements an in-memory caching layer for FatSecret food items and OAuth tokens, fully adhering to Section 1.5 of FatSecret Terms of Service without bloating PostgreSQL with third-party cached data.

---

## 📖 In-Depth Documentation

For detailed architectural decisions, benchmarks, and walkthroughs, explore the project documentation:

### 📑 Project Architecture & Deployment Guides
* **[Comprehensive Project Learning Documentation](docs/Project_Documents/PROJECT_DOCUMENTATION.md)** — Complete 15-section project report covering system logic, methodologies, issues faced, and alternative architectures.
* **[Docker Deployment Guide](docs/Project_Documents/Docker_Deployment_Guide.md)** — Container orchestration, production tips, and volume management.
* **[Swagger API Documentation](docs/Project_Documents/Swagger_API_Documentation.md)** — Comprehensive REST API endpoint reference and DTO schemas.
* **[Clerk Auth Architecture, Setup & Webhook Guide](docs/Project_Documents/Clerk_documents.md)** — Authentication lifecycle, setup guide, Svix verification, and database synchronization.

### 🧪 Local Testing & Execution Guides (`docs/LocalTesting_Documents`)
* **[Local Testing & Execution Hub](docs/LocalTesting_Documents/README.md)** — Index and overview of local development setup, testing, and container deployment options.
* **[Run Locally Guide](docs/LocalTesting_Documents/RUN_PROJECT_LOCAL.md)** — Step-by-step instructions for running, developing, and testing the application locally without Docker (includes PostgreSQL 16 setup, NestJS backend, Next.js frontend, Clerk authentication, and ngrok webhook tunneling).
* **[Run with Docker Guide](docs/LocalTesting_Documents/RUN_PROJECT_WITH_DOCKER.md)** — Step-by-step instructions for running the full containerized stack via Docker Compose with healthcheck verification and volume persistence.

### 🍎 FatSecret API Integration & Quota Architecture
* **[FatSecret API Caching Strategy Decision](docs/FatSecretAPI_documents/CacheStrategyDecision.md)** — In-memory caching architecture and legal compliance (Section 1.5).
* **[FatSecret API Rate Limiting Guide](docs/FatSecretAPI_documents/Rate-limiting_fatSecretAPI.md)** — Multi-tier throttling design, mathematical models, and Autocannon stress testing.
* **[FatSecret API Technical Docs](docs/FatSecretAPI_documents/FatSecretAPI_docs.md)** — Endpoints, OAuth 2.0 flow, and serving size calculations.
* **[Cache Strategy Migration](docs/FatSecretAPI_documents/CacheStrategyMigration.md)** — Architectural migration report from database storage to ephemeral cache.

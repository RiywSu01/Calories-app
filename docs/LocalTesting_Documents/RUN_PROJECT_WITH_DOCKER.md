# How to Run CalPal with Docker — Execution & Deployment Guide

This guide provides step-by-step instructions for configuring, running, testing, and deploying the **CalPal Full-Stack Application** using **Docker Compose**.

> 💡 **Looking to run locally without Docker?** See the [Local Execution Guide (RUN_PROJECT_LOCAL.md)](./RUN_PROJECT_LOCAL.md).

---

## 📖 Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Backend & Database Setup (Do NOT Start Yet)](#step-1-backend--database-setup-do-not-start-yet)
- [Step 2: Setup Clerk Authentication](#step-2-setup-clerk-authentication)
- [Step 3: Setup Clerk Webhook](#step-3-setup-clerk-webhook)
- [Step 4: Start the Backend & Database Containers](#step-4-start-the-backend--database-containers)
- [Step 5: Port Forwarding with ngrok & Webhook Verification](#step-5-port-forwarding-with-ngrok--webhook-verification)
- [Step 6: Setup Frontend & Start](#step-6-setup-frontend--start)
- [Useful Docker Lifecycle Commands](#useful-docker-lifecycle-commands)
- [Environment Variables Reference](#environment-variables-reference)
- [Troubleshooting Common Run Issues](#troubleshooting-common-run-issues)

---

## Prerequisites

Before running the application with Docker, ensure the following tools are installed on your system:

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Docker Desktop** | `v24.0+` with Compose `v2.20+` | Multi-container orchestration (`db`, `backend`, `frontend`). |
| **Node.js / npm** (Optional) | `v22.0.0+` | For local inspection or running tools like `npx ngrok`. |
| **ngrok** | Latest | Secure tunnel to forward Clerk webhooks to local container port 3001. |

---

## Step 1: Backend & Database Setup (Do NOT Start Yet)

In this step, we configure the database and backend environment files. **Do NOT run `docker compose up` yet**, as the backend container requires Clerk authentication and webhook keys (configured in Steps 2 & 3) to boot and verify requests.

### 1.1 Inspect Docker Compose Architecture
The [`docker-compose.yml`](file:///Users/supawit/Desktop/Calories-app/docker-compose.yml) orchestrates 3 isolated services:
* **`db`** (`calpal-postgres`): PostgreSQL 16 Alpine container with a persistent volume. Internal port: `5432`, External host port: `5433` (to prevent conflicts with any local PostgreSQL instance on port 5432).
* **`backend`** (`calpal-backend`): NestJS 11 REST API. Internal communication with DB uses `db:5432`. Exposed on host port `3001`.
* **`frontend`** (`calpal-frontend`): Next.js 16 standalone production container. Exposed on host port `3000`.

### 1.2 Configure `.env.docker`
Ensure the master environment file [`.env.docker`](file:///Users/supawit/Desktop/Calories-app/.env.docker) exists at the root of the project. Set your database credentials and third-party API keys:

```env
# ─── PostgreSQL Database Configuration ───
POSTGRES_USER=YOUR_USER
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=YOUR_DB
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@db:5432/YOUR_DB

# ─── NestJS Backend Configuration ───
BACKEND_PORT=3001
FATSECRET_CLIENT_ID=your_fatsecret_client_id
FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret
GEMINI_KEY=your_gemini_api_key

# (Leave CLERK_SECRET_KEY and CLERK_WEBHOOK_SECRET for Steps 2 & 3)
```

> [!WARNING]
> Do not start containers yet! Proceed to Step 2 and Step 3 to retrieve your Clerk keys and signing secret first.

---

## Step 2: Setup Clerk Authentication

CalPal relies on Clerk for user identity and session management. In this step, you connect your personal Clerk application instance to the project.

### Step 2.1: Create a Free Clerk Account & Application
1. Visit [clerk.com](https://clerk.com/) and sign up for a free account (or sign in).
2. In the Clerk Dashboard, click **Create Application** (or **Add Application**).
3. Name your application (e.g., `CalPal Docker Dev`).
4. Choose your sign-in options (Email, Google, etc.) and click **Create Application**.

### Step 2.2: Retrieve API Keys
1. In the left sidebar of the Clerk Dashboard, click **Configure** $\rightarrow$ **Developers** $\rightarrow$ **API Keys** (or **API Keys** on the dashboard home).
2. Locate the **Quick Copy** card:
   * **Publishable Key**: Begins with `pk_test_...`
   * **Secret Key**: Begins with `sk_test_...`
3. Copy both keys.

### Step 2.3: Add Clerk Keys to `.env.docker`
Add the keys into [`.env.docker`](file:///Users/supawit/Desktop/Calories-app/.env.docker):
```env
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

---

## Step 3: Setup Clerk Webhook

When users register, edit profiles, or delete accounts, Clerk dispatches an HTTP POST event to your NestJS backend to keep your PostgreSQL database in sync.

> [!NOTE]
> For details on Svix HMAC-SHA256 signature verification and raw byte buffers, see [`Clerk_documents.md`](file:///Users/supawit/Desktop/Calories-app/docs/Project_documents/Clerk_documents.md).

### Step 3.1: Add Webhook Endpoint in Clerk Dashboard
1. In Clerk Dashboard, go to **Configure** $\rightarrow$ **Webhooks** in the left sidebar.
2. Click the **Add Endpoint** button in the top-right corner.

### Step 3.2: Configure Webhook Settings
* **Endpoint URL**:
  ```text
  https://<YOUR_NGROK_SUBDOMAIN>.ngrok-free.app/user/webhook
  ```
  *(We will generate this public ngrok address in Step 5. You can use a temporary placeholder like `https://temp.ngrok-free.app/user/webhook` for now and update it in Step 5).*
* **Description**: `CalPal Docker Backend Sync`

### Step 3.3: Subscribe to Events
Under **Message Filtering / Subscribe to events**, check the 3 user lifecycle events:
* ✅ `user.created`
* ✅ `user.updated`
* ✅ `user.deleted`

Click **Create** (or **Add Endpoint**).

### Step 3.4: Copy Signing Secret (`whsec_...`)
1. On the endpoint details page, find the **Signing Secret** section on the right-hand panel.
2. Copy the key beginning with `whsec_...` (e.g., `whsec_ZN0d3l1yE1LL8uS2e0cwonY/ZoSFCQCD`).

### Step 3.5: Add `CLERK_WEBHOOK_SECRET` to `.env.docker`
Open [`.env.docker`](file:///Users/supawit/Desktop/Calories-app/.env.docker) and add:
```env
CLERK_WEBHOOK_SECRET=whsec_your_copied_secret_here
```

---

## Step 4: Start the Backend & Database Containers

Now that all environment variables and secrets are populated in `.env.docker`, start the backend and database services.

### 4.1 Build and Run Database & Backend
Run from the root project directory:

```bash
# Build images and start Database and Backend in detached mode
docker compose --env-file .env.docker up -d --build db backend
```

*(Alternatively, to run without detached mode and observe real-time boot logs)*:
```bash
docker compose --env-file .env.docker up --build db backend
```

### 4.2 Verify Container Health & Auto-Migration
1. Inspect container statuses:
   ```bash
   docker compose ps
   ```
   Both `calpal-postgres` and `calpal-backend` should show state `running` / `healthy`.
2. Inspect backend logs:
   ```bash
   docker compose logs -f backend
   ```
   Notice that `docker-entrypoint.sh` automatically runs `npx prisma db push --url "$DATABASE_URL" --accept-data-loss` before starting the NestJS HTTP server, ensuring all database tables (`users`, `food_logs`, `profiles`, `foods`) are initialized.

### 4.3 Service Access URLs
* **Backend API & Swagger Documentation**: [http://localhost:3001/api](http://localhost:3001/api)
* **PostgreSQL Database (External Host Port)**: `localhost:5433` (Username: `YOUR_USER`, Password: `YOUR_PASSWORD`, DB: `YOUR_DB`)

---

## Step 5: Port Forwarding with ngrok & Webhook Verification

Clerk's servers exist in the cloud and cannot directly reach `http://localhost:3001` on your local computer. **ngrok** provides a secure public HTTPS tunnel that forwards incoming Clerk webhook traffic to container port 3001.

$$\text{Clerk (Cloud)} \xrightarrow{\text{HTTPS POST}} \text{ngrok URL (Public)} \xrightarrow{\text{Tunnel}} \text{localhost:3001 (Your-PC)} \xrightarrow{\text{Docker Bridge}} \text{calpal-backend (:3001)}$$

### 5.1 Start the Tunnel
In a new terminal window (keep the backend running):

```bash
# Option A: Direct npx execution (macOS, Linux, Windows — No installation needed)
npx ngrok http 3001 --authtoken <YOUR_NGROK_AUTHTOKEN>

# Option B: macOS via Homebrew
brew install ngrok/ngrok/ngrok
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
ngrok http 3001

# Option C: Windows via winget or Chocolatey
winget install ngrok.ngrok
# or: choco install ngrok
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
ngrok http 3001
```

The terminal will display your forwarding address:
```text
Forwarding    https://<subdomain>.ngrok-free.app -> http://localhost:3001
```

### 5.2 Update Clerk Dashboard Endpoint URL
1. In [Clerk Dashboard](https://dashboard.clerk.com/) $\rightarrow$ **Configure** $\rightarrow$ **Webhooks**, click your endpoint.
2. Under **Endpoint URL**, update the URL with your active ngrok tunnel:
   ```text
   https://<subdomain>.ngrok-free.app/user/webhook
   ```
3. Save changes.

> [!IMPORTANT]
> If using a free ngrok account, the subdomain changes whenever you restart ngrok. Remember to update the URL in Clerk Dashboard when restarted.

### 5.3 Verify Received Webhook Events
1. In Clerk Dashboard under your endpoint, open the **Testing** tab.
2. Select the `user.created` event and click **Send Example**.
3. Check your backend container logs:
   ```bash
   docker compose logs -f backend
   ```
   You should see:
   ```text
   LOG [ClerkWebhookService] Received Clerk Webhook Event: user.created
   LOG [UserService] Upserting user from Clerk Webhook: user_2g7np7Hrk0SN6kj5EDMLDaKNL0S
   ```
4. Confirm the record was written to PostgreSQL inside Docker:
   ```bash
   docker compose exec db psql -U YOUR_USER -d YOUR_DB -c "SELECT user_id, email, username FROM users;"
   ```

---

## Step 6: Setup Frontend & Start

Now that the database and backend are fully operational with Clerk sync verified, launch the frontend container.

### 6.1 Verify Frontend Config in `.env.docker`
Ensure the frontend configuration lines are present in [`.env.docker`](file:///Users/supawit/Desktop/Calories-app/.env.docker):
```env
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 6.2 Start Frontend Container
Run from the root project directory:

```bash
# Build and start frontend container in detached mode
docker compose --env-file .env.docker up -d --build frontend
```

*(Or to run the entire complete stack together)*:
```bash
docker compose --env-file .env.docker up -d --build
```

### 6.3 Access the Web Application
* Open [http://localhost:3000](http://localhost:3000) in your web browser.
* Click **Sign Up** or **Sign In** and create an account. Your user will authenticate through Clerk and automatically sync to PostgreSQL via the active ngrok tunnel!

### 6.4 Assign Yourself Admin Role (Optional)
To test the protected `/admin` dashboard:
1. In [Clerk Dashboard](https://dashboard.clerk.com/), click **Users** in the sidebar.
2. Select your newly created user account.
3. Scroll to **Public metadata** and click **Edit**.
4. Set the JSON payload to:
   ```json
   {
     "role": "admin"
   }
   ```
5. Click **Save**.
6. Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin console.

---

## Useful Docker Lifecycle Commands

| Action | Command |
| :--- | :--- |
| **Check running status** | `docker compose ps` |
| **View live logs across all containers** | `docker compose logs -f` |
| **View backend logs only** | `docker compose logs -f backend` |
| **View frontend logs only** | `docker compose logs -f frontend` |
| **Restart a single container** | `docker compose restart backend` |
| **Stop all containers (preserves DB data)** | `docker compose down` |
| **Stop and wipe database volume** | `docker compose down -v` |
| **Clean rebuild from scratch (no cache)** | `docker compose --env-file .env.docker up -d --build --force-recreate` |

---

## Environment Variables Reference

Complete list of environment variables defined in [`.env.docker`](file:///Users/supawit/Desktop/Calories-app/.env.docker):

| Variable Name | Scope | Default / Format | Description |
| :--- | :--- | :--- | :--- |
| `POSTGRES_USER` | DB & Backend | `YOUR_USER` | PostgreSQL superuser username. |
| `POSTGRES_PASSWORD` | DB & Backend | `YOUR_PASSWORD` | PostgreSQL superuser password. |
| `POSTGRES_DB` | DB & Backend | `YOUR_DB` | Target database name. |
| `DATABASE_URL` | Backend | `postgresql://YOUR_USER:YOUR_PASSWORD@db:5432/YOUR_DB` | Prisma connection string for internal Docker network (`db:5432`). |
| `BACKEND_PORT` | Backend | `3001` | HTTP port for NestJS server. |
| `FRONTEND_PORT` | Frontend | `3000` | HTTP port for Next.js server. |
| `CLERK_SECRET_KEY` | Backend & Next.js | `sk_test_...` | Clerk private API secret key for JWT verification. |
| `CLERK_WEBHOOK_SECRET` | Backend | `whsec_...` | Svix HMAC signing secret for webhook verification. |
| `FATSECRET_CLIENT_ID` | Backend | Hex string | FatSecret Platform API developer OAuth2 client ID. |
| `FATSECRET_CLIENT_SECRET`| Backend | Hex string | FatSecret Platform API developer OAuth2 client secret. |
| `GEMINI_KEY` | Backend | `AIzaSy...` | Google Gemini API key for multimodal vision inference. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend | `pk_test_...` | Clerk public key loaded in browser client bundle. |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:3001` | Base URL used by frontend fetch calls to reach backend. |

---

## Troubleshooting Common Run Issues

### 1. `listen tcp 0.0.0.0:5432: bind: address already in use`
* **Cause**: A native PostgreSQL service is already running on host port 5432.
* **Fix**: In [`docker-compose.yml`](file:///Users/supawit/Desktop/Calories-app/docker-compose.yml), the database external port is already mapped to `5433:5432`. Inside the Docker network, services communicate using internal port 5432 (`db:5432`), completely avoiding port conflicts.

### 2. `The table public.users does not exist`
* **Cause**: Database started but schema migrations were not executed.
* **Fix**: Trigger `prisma db push` inside the backend container:
  ```bash
  docker compose exec backend npx prisma db push --url "$DATABASE_URL" --accept-data-loss
  ```

### 3. `400 Bad Request: Webhook verification failed`
* **Cause**: `CLERK_WEBHOOK_SECRET` in `.env.docker` does not match the active Clerk Dashboard signing secret, or `rawBody` is missing.
* **Fix**: Copy the signing secret (`whsec_...`) from Clerk Dashboard and update `.env.docker`. Restart container: `docker compose restart backend`.

### 4. `Tunnel Connection Refused`
* **Cause**: ngrok is forwarding to port 3001, but the backend is still booting or not running.
* **Fix**: Run `docker compose ps` to ensure `backend` is running and healthy.

### 5. ngrok Subdomain Changed on Restart
* **Cause**: Free ngrok accounts receive a new random subdomain each restart.
* **Fix**: Copy the new `https://<subdomain>.ngrok-free.app` URL and update the **Endpoint URL** in Clerk Dashboard.

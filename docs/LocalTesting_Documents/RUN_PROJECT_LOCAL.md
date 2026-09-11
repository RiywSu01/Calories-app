# How to Run CalPal Locally — Execution & Development Guide

This guide provides step-by-step instructions for configuring, running, testing, and developing the **CalPal Full-Stack Application** locally on your machine (**without Docker**).

> 💡 **Looking to run using Docker Compose?** See the [Docker Execution Guide (RUN_PROJECT_WITH_DOCKER.md)](./RUN_PROJECT_WITH_DOCKER.md).

---

## 📖 Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Backend & Database Setup (Do NOT Start Yet)](#step-1-backend--database-setup-do-not-start-yet)
- [Step 2: Setup Clerk Authentication](#step-2-setup-clerk-authentication)
- [Step 3: Setup Clerk Webhook](#step-3-setup-clerk-webhook)
- [Step 4: Start the Backend](#step-4-start-the-backend)
- [Step 5: Port Forwarding with ngrok & Webhook Verification](#step-5-port-forwarding-with-ngrok--webhook-verification)
- [Step 6: Setup Frontend & Start](#step-6-setup-frontend--start)
- [Environment Variables Reference](#environment-variables-reference)
- [Troubleshooting Common Run Issues](#troubleshooting-common-run-issues)

---

## Prerequisites

Before running the application locally, ensure the following tools are installed on your machine:

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v22.0.0+` (or `v24.x`) | Runtime environment for Next.js frontend and NestJS backend. |
| **npm** | `v10.0.0+` | Package manager. |
| **PostgreSQL** | `v16.x` | Local relational database. |
| **ngrok** | Latest | Secure tunnel to forward Clerk webhooks to local port 3001. |

---

## Step 1: Backend & Database Setup (Do NOT Start Yet)

In this step, we ensure PostgreSQL is running, install backend dependencies, configure database credentials, and synchronize schema tables. **Do NOT start the backend development server (`npm run start:dev`) yet**, as NestJS requires Clerk authentication and webhook keys (configured in Steps 2 & 3).

### 1.1 Start PostgreSQL Locally
Ensure PostgreSQL is active on port `5432` with a database created (e.g., `postgres`):

#### On macOS:
```bash
brew services start postgresql@16
```

#### On Linux:
```bash
sudo systemctl start postgresql
```

#### On Windows:
Choose one of the following methods depending on your setup:
* **Option A: Windows Service (PowerShell as Administrator)**:
  ```powershell
  Start-Service postgresql-x64-16
  # Or via Command Prompt (CMD as Administrator):
  net start postgresql-x64-16
  ```
* **Option B: Windows Services GUI**:
  1. Press `Win + R`, type `services.msc`, and press **Enter**.
  2. Locate **postgresql-x64-16** (or your version number), right-click and select **Start**.
* **Option C: Manual `pg_ctl` in PowerShell / CMD**:
  ```powershell
  pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start
  ```
* **Option D: Lightweight Standalone Docker Container (DB Only)**:
  If you do not have native PostgreSQL installed on Windows, run just the database container:
  ```powershell
  docker run --name local-postgres -e POSTGRES_USER=YOUR_USER -e POSTGRES_PASSWORD=YOUR_PASSWORD -e POSTGRES_DB=YOUR_DB -p 5432:5432 -d postgres:16-alpine
  ```

---

### 1.2 Navigate to Backend & Install Dependencies
Open a terminal in the project root:

* **macOS / Linux (Bash/Zsh)**:
  ```bash
  cd nest-prisma
  npm install
  ```
* **Windows (PowerShell / CMD)**:
  ```powershell
  cd nest-prisma
  npm install
  ```

---

### 1.3 Configure `nest-prisma/.env`
Create or edit [`nest-prisma/.env`](file:///Users/supawit/Desktop/Calories-app/nest-prisma/.env) with your database connection string and third-party API keys:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB?schema=public"
PORT=3001

# Third-party nutritional APIs
FATSECRET_CLIENT_ID=your_fatsecret_client_id
FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret
GEMINI_KEY=your_gemini_api_key

# (Leave CLERK_SECRET_KEY and CLERK_WEBHOOK_SECRET for Steps 2 & 3)
```

> [!WARNING]
> Replace `YOUR_USER`, `YOUR_PASSWORD`, and `YOUR_DB` in `DATABASE_URL` with your actual local PostgreSQL credentials before proceeding.

---

### 1.4 Generate Prisma Client & Push Database Schema
Push the schema to your local database to create the required tables (`users`, `food_logs`, `profiles`, `foods`):

* **macOS / Linux**:
  ```bash
  npx prisma generate
  npx prisma db push
  ```
* **Windows (PowerShell / CMD)**:
  ```powershell
  npx prisma generate
  npx prisma db push
  ```

> [!TIP]
> **Windows PowerShell Execution Policy Error**:
> If PowerShell displays `File ...\prisma.ps1 cannot be loaded because running scripts is disabled on this system`, run this command in your PowerShell session to bypass the restriction for that terminal window:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```
> Alternatively, execute the command in standard **Command Prompt (CMD)** or **Git Bash**.

> [!IMPORTANT]
> **Do NOT run `npm run start:dev` yet!** Proceed to Step 2 and Step 3 to configure your Clerk keys first.

---

## Step 2: Setup Clerk Authentication

CalPal relies on Clerk for user identity and session management. In this step, you connect your personal Clerk application instance to the project.

### Step 2.1: Create a Free Clerk Account & Application
1. Visit [clerk.com](https://clerk.com/) and sign up for a free account (or sign in).
2. In the Clerk Dashboard, click **Create Application** (or **Add Application**).
3. Name your application (e.g., `CalPal Local Dev`).
4. Choose your sign-in options (Email, Google, etc.) and click **Create Application**.

### Step 2.2: Retrieve API Keys
1. In the left sidebar of the Clerk Dashboard, click **Configure** $\rightarrow$ **Developers** $\rightarrow$ **API Keys** (or **API Keys** on the dashboard home).
2. Locate the **Quick Copy** card:
   * **Publishable Key**: Begins with `pk_test_...`
   * **Secret Key**: Begins with `sk_test_...`
3. Copy both keys.

### Step 2.3: Add `CLERK_SECRET_KEY` to `nest-prisma/.env`
Open [`nest-prisma/.env`](file:///Users/supawit/Desktop/Calories-app/nest-prisma/.env) and add:
```env
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```
*(Keep your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` handy — we will add it to the frontend in Step 6).*

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
* **Description**: `CalPal Local Backend Sync`

### Step 3.3: Subscribe to Events
Under **Message Filtering / Subscribe to events**, check the 3 user lifecycle events:
* ✅ `user.created`
* ✅ `user.updated`
* ✅ `user.deleted`

Click **Create** (or **Add Endpoint**).

### Step 3.4: Copy Signing Secret (`whsec_...`)
1. On the endpoint details page, find the **Signing Secret** section on the right-hand panel.
2. Copy the key beginning with `whsec_...` (e.g., `whsec_ZN0d3l1yE1LL8uS2e0cwonY/ZoSFCQCD`).

### Step 3.5: Add `CLERK_WEBHOOK_SECRET` to `nest-prisma/.env`
Open [`nest-prisma/.env`](file:///Users/supawit/Desktop/Calories-app/nest-prisma/.env) and add:
```env
CLERK_WEBHOOK_SECRET=whsec_your_copied_secret_here
```

---

## Step 4: Start the Backend

Now that all database tables are synchronized and all Clerk keys and secrets are present in `nest-prisma/.env`, start the NestJS development server.

### 4.1 Launch Server in Watch Mode
In your `nest-prisma` terminal window, run:

* **macOS / Linux**:
  ```bash
  npm run start:dev
  ```
* **Windows (PowerShell / CMD)**:
  ```powershell
  npm run start:dev
  ```

### 4.2 Verify Server Health
Check the terminal output:
```text
[Nest] LOG [NestApplication] Nest application successfully started
```
* **Backend API**: [http://localhost:3001](http://localhost:3001)
* **Interactive Swagger Documentation**: [http://localhost:3001/api](http://localhost:3001/api)

Keep this terminal running.

---

## Step 5: Port Forwarding with ngrok & Webhook Verification

Clerk's servers exist in the cloud and cannot directly reach `http://localhost:3001` on your local computer. **ngrok** provides a secure public HTTPS tunnel that forwards incoming Clerk webhook traffic to your local port 3001.

$$\text{Clerk (Cloud)} \xrightarrow{\text{HTTPS POST}} \text{ngrok URL (Public)} \xrightarrow{\text{Tunnel}} \text{localhost:3001 (Your-PC)} \xrightarrow{\text{NestJS Webhook Router}} \text{calpal-backend (:3001)}$$

### 5.1 Start the Tunnel
In a **new, separate terminal window** (keep backend running):

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
3. Check your backend console logs:
   ```text
   LOG [ClerkWebhookService] Received Clerk Webhook Event: user.created
   LOG [UserService] Upserting user from Clerk Webhook: user_2g7np7Hrk0SN6kj5EDMLDaKNL0S
   ```
4. Confirm the record was written to your local PostgreSQL database:
   * **macOS / Linux**:
     ```bash
     psql -U YOUR_USER -d YOUR_DB -c "SELECT user_id, email, username FROM users;"
     ```
   * **Windows (PowerShell / CMD)**:
     ```powershell
     psql -U YOUR_USER -d YOUR_DB -c "SELECT user_id, email, username FROM users;"
     ```

---

## Step 6: Setup Frontend & Start

Now that the backend is running and Clerk webhook synchronization is verified, configure and launch the Next.js frontend application.

### 6.1 Navigate to Frontend Directory & Install Dependencies
In another **new, separate terminal window**:

* **macOS / Linux**:
  ```bash
  cd my-app
  npm install
  ```
* **Windows (PowerShell / CMD)**:
  ```powershell
  cd my-app
  npm install
  ```

### 6.2 Configure `my-app/.env.local`
Create or edit [`my-app/.env.local`](file:///Users/supawit/Desktop/Calories-app/my-app/.env.local):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6.3 Start Next.js Development Server
Run:

* **macOS / Linux**:
  ```bash
  npm run dev
  ```
* **Windows (PowerShell / CMD)**:
  ```powershell
  npm run dev
  ```

### 6.4 Access the Web Application
* Open [http://localhost:3000](http://localhost:3000) in your web browser.
* Click **Sign Up** or **Sign In** to register an account. Your user will authenticate through Clerk and automatically sync to your local PostgreSQL database via the active ngrok tunnel!

### 6.5 Assign Yourself Admin Role (Optional)
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

## Environment Variables Reference

### Backend (`nest-prisma/.env`)
| Variable Name | Default / Format | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB?schema=public` | Local PostgreSQL connection string. |
| `PORT` | `3001` | HTTP port for NestJS server. |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk private API secret key for JWT verification. |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Svix HMAC signing secret for webhook verification. |
| `FATSECRET_CLIENT_ID` | Hex string | FatSecret Platform API developer OAuth2 client ID. |
| `FATSECRET_CLIENT_SECRET`| Hex string | FatSecret Platform API developer OAuth2 client secret. |
| `GEMINI_KEY` | `AIzaSy...` | Google Gemini API key for multimodal vision inference. |

### Frontend (`my-app/.env.local`)
| Variable Name | Default / Format | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Clerk public key loaded in browser client bundle. |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk private API secret key for server-side auth. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base URL used by frontend fetch calls to reach backend. |

---

## Troubleshooting Common Run Issues

### 1. `P1000: Authentication failed against database server`
* **Cause**: Username or password in `DATABASE_URL` is incorrect.
* **Fix**: Verify your PostgreSQL username and password by connecting directly using `psql -U YOUR_USER -d YOUR_DB`. Update `DATABASE_URL` in `nest-prisma/.env`.

### 2. `P1001: Can't reach database server at 'localhost:5432'`
* **Cause**: PostgreSQL service is not running locally.
* **Fix**: Start the service (macOS: `brew services start postgresql@16`, Windows: `Start-Service postgresql-x64-16`).

### 3. Windows PowerShell: `File ...\prisma.ps1 cannot be loaded because running scripts is disabled`
* **Cause**: Windows PowerShell default ExecutionPolicy (`Restricted`) disallows running unsigned scripts.
* **Fix**: Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your active PowerShell terminal, or execute commands in standard **CMD** or **Git Bash**.

### 4. `400 Bad Request: Webhook verification failed`
* **Cause**: `CLERK_WEBHOOK_SECRET` does not match the active Clerk Dashboard signing secret, or `rawBody` is missing.
* **Fix**: Copy the signing secret (`whsec_...`) from Clerk Dashboard and update `nest-prisma/.env`. Restart the backend: `npm run start:dev`.

### 5. `Tunnel Connection Refused`
* **Cause**: ngrok is forwarding to port 3001, but the NestJS backend is not running.
* **Fix**: Ensure the terminal running `npm run start:dev` is active and listening on port 3001.

### 6. ngrok Subdomain Changed on Restart
* **Cause**: Free ngrok accounts receive a new random subdomain each restart.
* **Fix**: Copy the new `https://<subdomain>.ngrok-free.app` URL and update the **Endpoint URL** in Clerk Dashboard.

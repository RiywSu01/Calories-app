# Clerk Authentication Achitecture of Project, Setup & Webhook Synchronization Guide

This guide details the complete implementation of **Clerk Authentication** and **Bi-Directional Clerk Webhook Synchronization** across the **Next.js Frontend (`my-app`)**, the **NestJS Backend (`nest-prisma`)**, and the **PostgreSQL Database**.

---

## 📖 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Clerk Authentication Implementation](#2-clerk-authentication-implementation)
   - [Frontend (Next.js 16)](#21-frontend-nextjs-16)
   - [Backend (NestJS 11 Guard & Decorator)](#22-backend-nestjs-11-guard--decorator)
3. [Clerk Webhook Synchronization Logic](#3-clerk-webhook-synchronization-logic)
   - [Why Webhooks are Essential](#31-why-webhooks-are-essential)
   - [Subscribed Events](#32-subscribed-events)
   - [Svix Cryptographic Verification & rawBody](#33-svix-cryptographic-verification--rawbody)
   - [Bi-Directional Sync & Infinite Loop Prevention](#34-bi-directional-sync--infinite-loop-prevention)
4. [Clerk Webhook Setup Step-by-Step Guide](#4-step-by-step-clerk-dashboard-configuration)
5. [Local Testing & Port Forwarding (ngrok)](#5-local-testing--port-forwarding-ngrok)
   - [Why Port Forwarding is Required](#51-why-port-forwarding-is-required)
   - [Starting the Tunnel](#52-starting-the-tunnel)
   - [Testing via Clerk Dashboard](#53-testing-via-clerk-dashboard)
   - [Verifying in Database](#54-verifying-in-database)
6. [Troubleshooting & Common Issues](#6-troubleshooting--common-issues)

---

## 1. Architecture Overview

CalPal uses a **hybrid identity model**:
* **Clerk (Cloud Auth Hub)**: Manages credential security, OAuth2 providers (Google, Apple, Email OTP), session lifecycles, and user role claims (`user` or `admin`).
* **PostgreSQL (Local Relational Database)**: Stores relational domain data (`user_profiles`, `food_logs`, custom `foods`).
* **Webhooks (Svix-Verified)**: Bridge the gap in real-time, ensuring that when an account is created, updated, or deleted in Clerk, the PostgreSQL database reflects the exact same state automatically.

```
                          ┌────────────────────────────────┐
                          │     Client Web Browser         │
                          └───────┬────────────────▲───────┘
                                  │                │
                     Sign In / Up │                │ JWT Session Token
                                  ▼                │
                          ┌────────────────────────┴───────┐
                          │    Clerk Authentication Hub    │
                          │   • OAuth (Google, Apple, etc.)│
                          │   • Public Metadata: { role }  │
                          └───────┬────────────────────────┘
                                  │
                                  │ Asynchronous HTTP POST (Svix Signed)
                                  │ Headers: svix-id, svix-timestamp, svix-signature
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        NestJS Backend (nest-prisma)                          │
│                                                                              │
│  1. Express rawBody preserves original byte stream                           │
│  2. ClerkWebhookController (/user/webhook) receives payload                  │
│  3. ClerkWebhookService verifies Svix HMAC-SHA256 signature                  │
│  4. UserService routes event to Prisma:                                      │
│     - user.created  ──► prisma.user.upsert(...)                              │
│     - user.updated  ──► prisma.user.upsert(...)                              │
│     - user.deleted  ──► prisma.user.delete(...) (Cascade deletes logs & profile)
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼ TCP (Port 5432)
                          ┌────────────────────────┐
                          │ PostgreSQL 16 Database │
                          │ Table: public.users    │
                          └────────────────────────┘
```

---

## 2. Clerk Authentication Implementation

### 2.1 Frontend (Next.js 16)

#### 1. Root Provider Integration (`app/layout.tsx`)
The application is wrapped with `<ClerkProvider>` to supply authentication context to all Server and Client Components:
```tsx
// my-app/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: '#5BB899' },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

#### 2. Auth Pages & Drop-in Components
* **Sign In (`app/sign-in/[[...sign-in]]/page.tsx`)**: Renders `<SignIn />` with seamless redirects to `/dashboard` or `/profile-setup`.
* **Sign Up (`app/sign-up/[[...sign-up]]/page.tsx`)**: Renders `<SignUp />` with automatic onboarding redirection.
* **Header User Button**: Drop-in `<UserButton />` supporting custom profile management and one-click sign-out.

#### 3. Client & Server Hooks
* **Client Components**: Use `useUser()` to display user profile names and `useAuth()` to retrieve session JWT tokens:
  ```typescript
  const { getToken } = useAuth();
  const token = await getToken();
  ```
* **Server Components & Server Actions**: Use `auth()` for zero-client leakage authentication:
  ```typescript
  // my-app/app/admin/page.tsx
  const { sessionClaims } = await auth();

  // Strict Server-Side RBAC Guard
  if (sessionClaims?.metadata?.role !== 'admin') {
    redirect('/dashboard');
  }
  ```

#### 4. Authenticated Backend API Requests
When the frontend communicates with the NestJS backend, it attaches the Clerk session token in the HTTP `Authorization` header:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/food-logs?date=${date}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

### 2.2 Backend (NestJS 11 Guard & Decorator)

#### 1. `ClerkAuthGuard` (`nest-prisma/src/auth/clerk-auth.guard.ts`)
Validates incoming JWT tokens against Clerk's public key infrastructure using `@clerk/clerk-sdk-node`:

```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // Attach decoded payload to request.user
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
```

#### 2. Custom `@CurrentUser()` Decorator (`nest-prisma/src/auth/current-user.decorator.ts`)
Allows controllers to extract the authenticated user's ID without manually parsing headers:
```typescript
@Get()
@UseGuards(ClerkAuthGuard)
getDailyLogs(@CurrentUser('sub') userId: string, @Query('date') date: string) {
  return this.foodLogsService.findLogsByUserAndDate(userId, date);
}
```

---

## 3. Clerk Webhook Synchronization Logic

### 3.1 Why Webhooks are Essential
Clerk handles passwords, OAuth tokens, and session cookies in its cloud infrastructure. However, your application needs user records in PostgreSQL for foreign key relationships:
* `user_profiles.user_id` $\rightarrow$ `users.user_id` (BMR, TDEE, biometrics)
* `food_logs.user_id` $\rightarrow$ `users.user_id` (Meal diary history)

Webhooks guarantee that as soon as a user signs up (via Google, Apple, or Email), a corresponding row is created in `public.users`.

---

### 3.2 Subscribed Events

| Event Type | Trigger | Backend Handler Action |
| :--- | :--- | :--- |
| **`user.created`** | User registers or signs in for the first time via Clerk UI. | Extracts Clerk ID, primary email, username, and role. Executes `prisma.user.upsert()` to create the database record. |
| **`user.updated`** | User changes email, updates profile, or admin mutates role. | Updates username, email, or role (`UserRole.user` or `UserRole.admin`) in PostgreSQL. |
| **`user.deleted`** | User deletes account or admin removes user. | Executes `prisma.user.delete()`. PostgreSQL cascades and automatically wipes `user_profiles` and `food_logs`. |

---

### 3.3 Svix Cryptographic Verification & `rawBody`

To prevent malicious third parties from sending fake webhook events, Clerk signs every payload using **Svix** with an HMAC-SHA256 hash.

```typescript
// nest-prisma/src/user/webhook/clerk-webhook.service.ts
const wh = new Webhook(webhookSecret);
const rawString = (req as any).rawBody
  ? (req as any).rawBody.toString('utf8')
  : JSON.stringify(payload);

evt = wh.verify(rawString, {
  'svix-id': svixId,
  'svix-timestamp': svixTimestamp,
  'svix-signature': svixSignature,
});
```

#### ⚠️ The Critical `rawBody: true` Requirement
By default, Express parses incoming JSON streams into JavaScript objects (`req.body = { ... }`). During this parsing:
* Key order can change.
* Whitespace, newlines, and unicode escapes are modified.

Even a **1-byte difference** causes the HMAC-SHA256 signature verification to fail!

**The Solution:**
In [`nest-prisma/src/main.ts`](file:///Users/supawit/Desktop/Calories-app/nest-prisma/src/main.ts#L8):
```typescript
const app = await NestFactory.create(AppModule, { rawBody: true });
```
This instructs NestJS to preserve the original, untouched byte buffer in `req.rawBody`, allowing `wh.verify()` to validate signatures with 100% mathematical accuracy.

---

### 3.4 Bi-Directional Sync & Infinite Loop Prevention

Because updates can originate from both the Clerk UI and the NestJS Admin API, infinite update loops must be prevented:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       Synchronization Lifecycle                           │
└───────────────────────────────────────────────────────────────────────────┘

 [CLERK -> SERVER]
 [User Signs Up in Clerk] ──(Webhook: user.created)──> [NestJS Webhook]
                                                              │
                                                              ▼
                                                       [PostgreSQL DB]
                                                        (No Clerk call)

─────────────────────────────────────────────────────────────────────────────

 [SERVER -> CLERK]
 [Admin Action / Server] ───────────────> [Clerk SDK Update/Delete]
            │                                         │
            ▼                                         ▼
      [PostgreSQL DB]                        (Clerk fires webhook)
            │                                         │
            │                                         ▼
            └───────────────────────── (Idempotent DB upsert, loop terminates)
```

1. **Clerk $\rightarrow$ Server**: When Clerk triggers a webhook, `ClerkWebhookController` writes directly to PostgreSQL via Prisma. It **never** calls the Clerk SDK, stopping recursion at step 1.
2. **Server $\rightarrow$ Clerk**: When an admin promotes a user in `/admin`, the Server Action updates Clerk's metadata first, then updates PostgreSQL. When Clerk subsequently dispatches `user.updated`, the webhook handler executes an idempotent upsert (`WHERE user_id = ...`) with identical data, terminating cleanly.

---

## 4. Clerk Webhook Setup Step-by-Step Guide

Follow these steps to configure webhooks on the Clerk website:

### Step 1: Open Clerk Dashboard
1. Go to the [Clerk Dashboard](https://dashboard.clerk.com/).
2. Select your CalPal project.

### Step 2: Navigate to Webhooks
1. In the left navigation sidebar, click **Configure** $\rightarrow$ **Webhooks**.
2. Click the **Add Endpoint** button in the top right corner.

### Step 3: Configure Endpoint URL
* **Endpoint URL**: 
  - For Local Testing with ngrok: `http://[IP_ADDRESS_NGROK]/user/webhook`
  - For Production: `http://[IP_ADDRESS]/user/webhook`
* **Description**: `CalPal NestJS Database Sync`

### Step 4: Subscribe to Events
Under **Message Filtering / Subscribe to events**, check the following 3 events:
* ✅ `user.created`
* ✅ `user.updated`
* ✅ `user.deleted`

### Step 5: Copy Signing Secret
1. After creating the endpoint, locate the **Signing Secret** section on the right-hand panel.
2. It begins with `whsec_...` (e.g., `whsec_ZN0d3l1yE1LL8uS2e0cwonY/ZoSFCQCD`).
3. Click the copy icon.

### Step 6: Update Environment Variables
Paste the signing secret into your environment files:
* In [`nest-prisma/.env`](file:///Users/supawit/Desktop/Calories-app/nest-prisma/.env):
  ```env
  CLERK_WEBHOOK_SECRET=whsec_ZN0d3l1yE1LL8uS2e0cwonY/ZoSFCQCD
  ```
* In [`.env.docker`](file:///Users/supawit/Desktop/Calories-app/.env.docker):
  ```env
  CLERK_WEBHOOK_SECRET=whsec_ZN0d3l1yE1LL8uS2e0cwonY/ZoSFCQCD
  ```

---

## 5. Local Testing & Port Forwarding (ngrok)

### 5.1 Why Port Forwarding is Required

* **The Problem**: Your NestJS backend runs on your local machine (`http://localhost:3001`). Clerk's servers live in the cloud. Cloud servers cannot reach `localhost` or private local IP addresses (`192.168.x.x`) behind your router/NAT.
* **The Solution**: A secure tunnel (like **ngrok**) exposes your local port `3001` via a temporary public HTTPS address (e.g. `https://xxxx.ngrok-free.app`). Clerk sends webhooks to ngrok, which forwards them directly to your PC.

$$\text{Clerk (Cloud)} \xrightarrow{\text{HTTPS POST}} \text{ngrok URL (Public)} \xrightarrow{\text{Tunnel}} \text{localhost:3001 (Your-PC)} \xrightarrow{\text{Docker Bridge}} \text{calpal-backend (:3001)}$$

---

### 5.2 Starting the Tunnel

Make sure your backend is running (either via **DOCKER** or `npm run start:dev` on port 3001).

#### Option A: Using `npx ngrok` (No global install required)
```bash
npx ngrok http 3001 --authtoken <YOUR_NGROK_AUTHTOKEN>
```

#### Option B: Using Native Homebrew CLI (Fastest on Mac)
```bash
# 1. Install ngrok
brew install ngrok/ngrok/ngrok

# 2. Save your token once
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>

# 3. Start tunnel
ngrok http 3001
```

#### Output Example:
```text
Session Status                online
Account                       Your Name (Plan: Free)
Forwarding                    https://a1b2-2001-fb1.ngrok-free.app -> http://localhost:3001
```

> [!IMPORTANT]
> Copy the `https://...ngrok-free.app` URL and update the **Endpoint URL** in your Clerk Dashboard:
> `https://a1b2-2001-fb1.ngrok-free.app/user/webhook`

---

### 5.3 Testing via Clerk Dashboard

You can verify the webhook without creating a new email account using Clerk's built-in testing tool:

1. In Clerk Dashboard, go to **Webhooks** and click your endpoint.
2. Select the **Testing** tab.
3. Under **Event Type**, choose `user.created`.
4. Click **Send Example**.
5. Observe the response:
   - Status code should be **`200 OK`**.
   - Response body: `{"success": true}`.

#### Expected Backend Log Output:
```text
[Nest] LOG [ClerkWebhookController] handleWebhook called
[Nest] LOG [ClerkWebhookService] Received Clerk Webhook Event: user.created
[Nest] LOG [UserService] Upserting user from Clerk Webhook: user_2g7np7Hrk0SN6kj5EDMLDaKNL0S
```

---

### 5.4 Verifying in Database

Check that the webhook created the row in your PostgreSQL container:

```bash
docker compose exec db psql -U postgres -d postgres -c "SELECT user_id, email, username, role, created_at FROM users;"
```

#### Query Output:
```text
             user_id             |            email            | username | role |          created_at           
---------------------------------+-----------------------------+----------+------+-------------------------------
 user_2g7np7Hrk0SN6kj5EDMLDaKNL0S | user_test@clerk.example.com | user     | user | 2026-08-31 10:13:36.573+00
(1 row)
```

---

## 6. Troubleshooting & Common Issues

| Issue / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| **`400 Bad Request: Webhook verification failed`** | `CLERK_WEBHOOK_SECRET` does not match the dashboard signing secret, or `rawBody` is missing. | Verify secret in `.env.docker` begins with `whsec_...` and matches Clerk Dashboard. Ensure `{ rawBody: true }` is enabled in `main.ts`. |
| **`404 Not Found` on Webhook** | Endpoint URL path is incorrect in Clerk Dashboard. | Verify the URL path ends with `/user/webhook` (e.g. `https://xxx.ngrok-free.app/user/webhook`). |
| **`The table public.users does not exist`** | Database schema has not been pushed to PostgreSQL. | Run `docker compose exec backend npx prisma db push --url "$DATABASE_URL" --accept-data-loss` to initialize database tables. |
| **`JWT is expired`** | Local browser session cookie or bearer token has expired. | Sign out on `http://localhost:3000` and sign back in to refresh token claims. |
| **Tunnel Connection Refused** | The backend service is not running on port 3001. | Check container health via `docker compose ps` and verify port mapping `3001:3001`. |
| **Ngrok URL Reset on Restart** | Free-tier ngrok generates a new random subdomain each time it restarts. | After restarting ngrok, copy the new HTTPS URL and update the Clerk Dashboard endpoint setting. |

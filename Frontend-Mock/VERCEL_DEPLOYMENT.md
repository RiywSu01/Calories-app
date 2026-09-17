# 🚀 Deploying Frontend-Mock to Vercel for Free

This guide walks you through deploying **`Frontend-Mock`** to [Vercel](https://vercel.com) completely free of charge.

---

## 📋 Vercel Environment Variables Checklist

Add these variables in the Vercel project settings:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk Secret Key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Sign-in route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Sign-up route |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/profile-setup` | Post-login redirect |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/profile-setup` | Post-signup redirect |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Enables standalone offline mock mode |

---

## ⚡ Deployment Instructions

### Method 1: Monorepo Deployment (Vercel Root Directory)
1. Commit and push your changes to GitHub:
   ```bash
   git add Frontend-Mock/
   git commit -m "feat: add Frontend-Mock for Vercel deployment"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and import your `Calories-app` repository.
3. In **Project Settings**:
   - Set **Root Directory**: `Frontend-Mock`
   - Framework Preset: `Next.js`
4. Enter the environment variables listed above.
5. Click **Deploy**.

---

### Method 2: Standalone Repository
If you prefer pushing only `Frontend-Mock` to its own GitHub repository:
```bash
# 1. Copy folder to your home directory or Desktop
cp -R Frontend-Mock ~/Desktop/calpal-frontend-mock
cd ~/Desktop/calpal-frontend-mock
rm -rf .next node_modules

# 2. Push to a new GitHub repository
git init
git add .
git commit -m "Initial commit of CalPal mock frontend"
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/calpal-frontend-mock.git
git push -u origin main
```
Import `calpal-frontend-mock` in Vercel with Root Directory `./`.

---

## 🔒 Clerk Domain & Authentication Setup

### 1. Development Mode (`pk_test_...`) — No Setup Required 🎉
- When using Clerk test keys (`pk_test_...`), Clerk **automatically allows all `*.vercel.app` domains** out of the box.
- You do **not** need to add or verify your `https://calpal-app-xxx.vercel.app` domain in the Clerk Dashboard under **Domains**.
- Both Email login and Google SSO will work immediately on your Vercel preview/production URL.

### 2. Production Mode (`pk_live_...` / Custom Domains)
- If you switch to production by clicking **"Go to prod"** in the Clerk Dashboard or use a custom domain (e.g., `www.calpal.com`):
  1. Open [Clerk Dashboard](https://dashboard.clerk.com).
  2. Navigate to **Configure** → **Domains**.
  3. Add your custom production domain and configure the required DNS records (CNAME/TXT) provided by Clerk.
  4. Replace your Vercel Environment Variables with your production keys (`pk_live_...` and `sk_live_...`).


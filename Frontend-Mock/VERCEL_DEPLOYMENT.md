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

## 🔒 Update Clerk Allowed Origins
Once deployed on Vercel:
1. Open [Clerk Dashboard](https://dashboard.clerk.com).
2. Go to **Configure** → **Domains** / **Paths**.
3. Add your Vercel URL (e.g. `https://calpal-mock-xxx.vercel.app`) to allowed redirect origins.

# 🥑 CalPal — Standalone Mock Frontend

This is the standalone **Mock Frontend** for **CalPal**, tailored specifically for deploying directly to **Vercel** with **zero backend dependencies and 100% free hosting**.

---

## ✨ Features of the Mock Frontend

- **Zero-Backend Architecture**: Runs completely in the client browser using `localStorage`.
- **Pre-Seeded Clinical Foods**: Instant search across healthy foods (Avocado Toast, Grilled Salmon, Chicken Breast, Greek Yogurt, Rolled Oats, Jasmine Rice, etc.).
- **Live Interactive Dashboard**: Pre-loaded with realistic sample meals for today so the animated Calorie Ring, progress meters, and meal cards look vibrant on first visit.
- **Biometric Onboarding Wizard**: Fully functional `/profile-setup` that computes clinical BMR & TDEE (Mifflin-St Jeor formula) and stores personalized macro targets.
- **AI Food Analysis Simulation**: Simulates the multimodal Gemini Flash visual reasoning pipeline for meal photos and natural language descriptions.
- **Full Meal CRUD**: Add, customize, and delete meal logs with real-time UI updates.
- **Dark / Light Theme**: Theme persistence with zero flash of unstyled content (FOUC).

---

## 🚀 Deploying to Vercel (3 Simple Steps)

### Method A: Deploy from Monorepo (Root Directory setting)
1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project** and import this repository.
3. In **Project Settings**:
   - Set **Root Directory** to `Frontend-Mock`.
   - Framework Preset: **Next.js** (auto-detected).
4. Add Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: your Clerk publishable key (`pk_test_...`)
   - `CLERK_SECRET_KEY`: your Clerk secret key (`sk_test_...`)
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`: `/profile-setup`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`: `/profile-setup`
   - `NEXT_PUBLIC_DEMO_MODE`: `true`
5. Click **Deploy**!

### Method B: Deploy as a Separate Standalone Repository
If you want a dedicated repository `calpal-frontend-mock` on GitHub:
```bash
# Copy Frontend-Mock to Desktop
cp -R Frontend-Mock ~/Desktop/calpal-frontend-mock
cd ~/Desktop/calpal-frontend-mock
rm -rf .next node_modules

# Initialize and push to a new GitHub repo
git init
git add .
git commit -m "Initial commit: CalPal Mock Frontend"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/calpal-frontend-mock.git
git push -u origin main
```
Then import `calpal-frontend-mock` into Vercel with Root Directory `./`.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Build for production
npm run build
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

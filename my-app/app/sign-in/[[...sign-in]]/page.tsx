'use client';

import { useClerk } from '@clerk/nextjs';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLoggedInUserRole } from '../../admin/_actions';
import CalorieRing from '../../components/common/CalorieRing';
import MacroBadge from '../../components/common/MacroBadge';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CustomSignInPage() {
  const clerk = useClerk();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [suggestGoogle, setSuggestGoogle] = useState(false);

  const handleGoogleSignIn = () => {
    if (!clerk.loaded) return;
    clerk.client.signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/profile-setup',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerk.loaded) return;
    setError('');
    setSuggestGoogle(false);

    startTransition(async () => {
      try {
        const result = await clerk.client.signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete') {
          // Generates a new session on Clerk's servers and stores tokens in browser
          await clerk.setActive({ session: result.createdSessionId });

          const role = await getLoggedInUserRole();
          if (role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/profile-setup');
          }
        } else if (result.status === 'needs_first_factor') {
          setError('First-factor authentication required. Please check your credentials.');
        } else if (result.status === 'needs_second_factor') {
          setError('Two-factor authentication required.');
        } else {
          setError(`Sign in status: ${result.status}`);
        }
      } catch (err: any) {
        const errCode = err?.errors?.[0]?.code;
        const rawMsg = err?.errors?.[0]?.message || '';
        const longMsg = err?.errors?.[0]?.longMessage || '';
        const fullMsg = `${rawMsg} ${longMsg}`.toLowerCase();

        // 💡 Smart Detection: If account was created with Google OAuth
        if (
          errCode === 'strategy_for_user_invalid' ||
          errCode === 'form_identifier_not_found' ||
          fullMsg.includes('strategy') ||
          fullMsg.includes('oauth')
        ) {
          setSuggestGoogle(true);
          setError('This account was created with Google Sign-In.');
          return;
        }

        const message = longMsg || rawMsg || 'Invalid email or password.';
        setError(message);
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* ── LEFT SIDE (30% Width on Desktop): Custom Sign-In Form ── */}
      <div className="w-full lg:w-[35%] lg:min-w-[380px] xl:w-[30%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[var(--bg-card)] border-b lg:border-b-0 lg:border-r border-[var(--border)] min-h-screen">
        {/* Brand Home Link Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-xl hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🥑</span>
            <span className="text-text-primary">
              Cal<span className="text-mint-dark dark:text-mint">Pal</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-[var(--text-secondary)] hover:underline"
          >
            ← Home
          </Link>
        </div>

        {/* Center: Sign In Form Box */}
        <div className="my-auto py-8 space-y-6 w-full max-w-sm mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Welcome back 👋
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
              Please enter your details to log in to CalPal.
            </p>
          </div>

          {/* Social Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!clerk.loaded}
            className="w-full flex items-center justify-center gap-3 border-2 border-[var(--border)] bg-[var(--bg-input)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold text-xs sm:text-sm py-3 px-4 rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)]">
              or email
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Smart Google Suggestion Banner */}
          {suggestGoogle && (
            <div
              aria-live="polite"
              className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[var(--text-primary)] text-xs space-y-2 animate-fadeIn"
            >
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>Google Account Detected</span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                This account doesn&apos;t use a password because it was created with Google.
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Continue with Google</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Standard Error Alert Banner */}
          {error && !suggestGoogle && (
            <div
              aria-live="polite"
              className="p-3 rounded-2xl bg-[var(--peach-light)]/40 border border-[var(--peach)] text-[var(--text-primary)] text-xs font-bold text-center animate-fadeIn"
            >
              ⚠️ {error}
            </div>
          )}

          {/* Custom Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1"
              >
                Email Address
              </label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input font-semibold text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signin-password"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1"
              >
                Password
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input font-semibold text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!clerk.loaded || isPending}
              className="btn btn-primary btn-full !py-3 font-black text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Logging in...' : 'Log In to CalPal ✨'}
            </button>
          </form>

          {/* Switch Page */}
          <div className="text-center text-xs font-semibold text-[var(--text-secondary)] pt-2">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="text-[var(--mint-dark)] dark:text-[var(--mint)] font-extrabold hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[var(--text-tertiary)] font-medium">
          © {new Date().getFullYear()} CalPal Inc. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT SIDE (70% Width on Desktop): Hero Banner Showcase ── */}
      <div className="hidden lg:flex lg:w-[65%] xl:w-[70%] relative flex-col items-center justify-center p-12 bg-gradient-to-br from-[var(--mint-light)]/40 via-[var(--bg-primary)] to-[var(--peach-light)]/40 text-center overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[var(--mint)]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[var(--peach)]/20 blur-3xl" />

        <div className="relative z-10 max-w-xl space-y-8 animate-fadeIn">
          {/* Main Logo & Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--mint)]/30 shadow-md">
            <span className="text-3xl">🥑</span>
            <span className="font-black text-base text-[var(--text-primary)]">
              CalPal Fitness Platform
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
              Track Calories, <br />
              <span className="bg-gradient-to-r from-[var(--mint-dark)] via-[var(--mint)] to-[var(--peach)] bg-clip-text text-transparent">
                Hit Your Macros & Flourish.
              </span>
            </h2>

            <p className="text-base text-[var(--text-secondary)] font-semibold leading-relaxed max-w-md mx-auto">
              Join thousands of fitness enthusiasts taking control of their daily nutrition with
              cute, smart, and effortless tracking.
            </p>
          </div>

          {/* Dribbble Style Hero Fitness Preview Card */}
          <div className="card border border-[var(--border)] shadow-2xl bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)] p-6 rounded-3xl max-w-md mx-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="font-black text-xs sm:text-sm text-[var(--text-primary)]">
                  Daily Calorie Target
                </span>
              </div>
              <span className="pill bg-[var(--mint-light)]/60 text-[var(--mint-dark)] font-black text-xs">
                14-Day Streak
              </span>
            </div>

            <div className="my-3">
              <CalorieRing consumed={1650} goal={2100} size={160} strokeWidth={14} />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <MacroBadge label="Protein" value={120} unit="g" emoji="🥩" variant="protein" />
              <MacroBadge label="Carbs" value={190} unit="g" emoji="🌾" variant="carb" />
              <MacroBadge label="Fats" value={50} unit="g" emoji="🥑" variant="fat" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
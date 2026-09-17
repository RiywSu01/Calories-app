'use client';

import { SignUp, SignUpButton, useClerk } from '@clerk/nextjs';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CalorieRing from '../../components/common/CalorieRing';
import MacroBadge from '../../components/common/MacroBadge';

export default function CustomSignUpPage() {
    const clerk = useClerk();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Create Sign Up
    const handleSignUp = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!clerk.loaded) return;
        setError('');

        startTransition(async () => {
            try {
                const result = await clerk.client.signUp.create({
                    emailAddress: email,
                    password,
                });

                if (result.status === 'complete') {
                    await clerk.setActive({ session: result.createdSessionId });
                    router.push('/profile-setup');
                } else {
                    await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                    setVerifying(true);
                }
            } catch (err: any) {
                const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Sign up failed.';
                setError(message);
            }
        });
    };

    // Step 2: Verify Email Code
    const handleVerify = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!clerk.loaded) return;
        setError('');

        startTransition(async () => {
            try {
                const completeSignUp = await clerk.client.signUp.attemptEmailAddressVerification({
                    code,
                });

                if (completeSignUp.status === 'complete') {
                    await clerk.setActive({ session: completeSignUp.createdSessionId });
                    router.push('/profile-setup');
                } else {
                    setError(`Verification incomplete. Status: ${completeSignUp.status}`);
                }
            } catch (err: any) {
                const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid verification code.';
                setError(message);
            }
        });
    };

    const handleGoogleSignUp = () => {
        if (!clerk.loaded) return;
        clerk.client.signUp.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: '/sso-callback',
            redirectUrlComplete: '/profile-setup',
        });
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">

            {/* ── LEFT SIDE (30% Width on Desktop): Custom Sign-Up Form ── */}
            <div className="w-full lg:w-[35%] lg:min-w-[380px] xl:w-[30%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[var(--bg-card)] border-b lg:border-b-0 lg:border-r border-[var(--border)] min-h-screen">
                {/* Brand Home Link Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 font-black text-xl hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🥑</span>
                        <span className="text-text-primary">
                            Cal<span className="text-mint-dark dark:text-mint">Pal</span>
                        </span>
                    </Link>

                    <Link href="/" className="text-xs font-bold text-[var(--text-secondary)] hover:underline">
                        ← Home
                    </Link>
                </div>

                {/* Center: Sign Up Form Box */}
                <div className="my-auto py-8 space-y-6 w-full max-w-sm mx-auto">

                    {!verifying ? (
                        <>
                            <div className="space-y-1">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                                    Create Account ✨
                                </h1>
                                <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                                    Start tracking your daily calories with CalPal!
                                </p>
                            </div>

                            {/* Social Google Sign-Up Button */}
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
                                disabled={!clerk.loaded}
                                className="w-full flex items-center justify-center gap-3 border-2 border-[var(--border)] bg-[var(--bg-input)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold text-xs sm:text-sm py-3 px-4 rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Sign Up with Google</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-[var(--border)]" />
                                <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)]">or email</span>
                                <div className="flex-1 h-px bg-[var(--border)]" />
                            </div>

                            {/* Error Alert Banner */}
                            {error && (
                                <div aria-live="polite" className="p-3 rounded-2xl bg-[var(--peach-light)]/40 border border-[var(--peach)] text-[var(--text-primary)] text-xs font-bold text-center animate-fadeIn">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Custom Form */}
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div>
                                    <label htmlFor="signup-email" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                                        Email Address
                                    </label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">✉️</span>
                                        <input
                                            id="signup-email"
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
                                    <label htmlFor="signup-password" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                                        Password
                                    </label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            id="signup-password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input font-semibold text-sm"
                                        />
                                    </div>
                                </div>

                                <div id="clerk-captcha" />

                                <button
                                    type="submit"
                                    disabled={!clerk.loaded || isPending}
                                    className="btn btn-primary btn-full !py-3 font-black text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending ? 'Creating account...' : 'Create Account ✨'}
                                </button>
                            </form>

                            {/* Switch Page */}
                            <div className="text-center text-xs font-semibold text-[var(--text-secondary)] pt-2">
                                Already have an account?{' '}
                                <Link
                                    href="/sign-in"
                                    className="text-[var(--mint-dark)] dark:text-[var(--mint)] font-extrabold hover:underline"
                                >
                                    Log In
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* Step 2: Email Code Verification */
                        <div className="space-y-5 animate-fadeIn">
                            <div className="text-center space-y-1">
                                <div className="text-4xl mb-2">📩</div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">Verify Your Email</h2>
                                <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                                    We sent a verification code to <span className="font-bold text-[var(--text-primary)]">{email}</span>
                                </p>
                            </div>


                            {error && (
                                <div aria-live="polite" className="p-3 rounded-2xl bg-[var(--peach-light)]/40 border border-[var(--peach)] text-[var(--text-primary)] text-xs font-bold text-center">
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label htmlFor="verify-code" className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                                        Verification Code
                                    </label>
                                    <input
                                        id="verify-code"
                                        name="code"
                                        type="text"
                                        required
                                        autoComplete="one-time-code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        className="input font-extrabold text-center text-lg tracking-widest"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!clerk.loaded || isPending}
                                    className="btn btn-primary btn-full !py-3 font-black text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending ? 'Verifying...' : 'Verify & Complete Sign Up 🚀'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setVerifying(false)}
                                    className="w-full text-center text-xs text-[var(--text-tertiary)] font-bold hover:underline cursor-pointer"
                                >
                                    ← Back to Sign Up
                                </button>
                            </form>
                        </div>
                    )}

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
                        <span className="font-black text-base text-[var(--text-primary)]">CalPal Fitness Platform</span>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                            Start Your Journey, <br />
                            <span className="bg-gradient-to-r from-[var(--mint-dark)] via-[var(--mint)] to-[var(--peach)] bg-clip-text text-transparent">
                                Achieve Healthy Habit Goals.
                            </span>
                        </h2>

                        <p className="text-base text-[var(--text-secondary)] font-semibold leading-relaxed max-w-md mx-auto">
                            Calculate your personal BMR & TDEE goals in seconds. Take the first step toward a healthier, happier lifestyle.
                        </p>
                    </div>

                    {/* Dribbble Style Hero Fitness Preview Card */}
                    <div className="card border border-[var(--border)] shadow-2xl bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)] p-6 rounded-3xl max-w-md mx-auto">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🎯</span>
                                <span className="font-black text-xs sm:text-sm text-[var(--text-primary)]">Personal Calorie Target</span>
                            </div>
                            <span className="pill bg-[var(--mint-light)]/60 text-[var(--mint-dark)] font-black text-xs">
                                Target: 2,100 cal
                            </span>
                        </div>

                        <div className="my-3">
                            <CalorieRing consumed={1450} goal={2100} size={160} strokeWidth={14} />
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <MacroBadge label="Protein" value={110} unit="g" emoji="🥩" variant="protein" />
                            <MacroBadge label="Carbs" value={180} unit="g" emoji="🌾" variant="carb" />
                            <MacroBadge label="Fats" value={45} unit="g" emoji="🥑" variant="fat" />
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
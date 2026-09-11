'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, UserButton } from '@clerk/nextjs';
import ThemeToggle from './ThemeToggle';

export default function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide Navbar on Auth pages, onboarding, dashboard, add-food, and admin
  if (
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/sign-up') ||
    pathname?.startsWith('/sso-callback') ||
    pathname?.startsWith('/profile-setup') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/add-food') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-primary/85 border-b border-border px-4 sm:px-6 lg:px-10 py-3 transition-colors">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2.5 text-decoration-none group min-h-[40px]"
        >
          <span className="text-2xl sm:text-3xl transform group-hover:scale-110 transition-transform select-none">
            🥑
          </span>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tight text-text-primary leading-tight">
              Cal<span className="text-mint-dark dark:text-mint">Pal</span>
            </span>
            <span className="hidden sm:block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Calorie & Macro Tracker
            </span>
          </div>

        </Link>

        {/* Desktop Navigation Bar */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          <ThemeToggle />

          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-extrabold text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-full"
            >
              Sign Up
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-black bg-mint hover:bg-mint-dark text-text-on-dark shadow-xs hover:shadow-md transition-all rounded-full cursor-pointer active:scale-95"
            >
              Log In ✨
            </Link>
          </Show>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full bg-mint-light/60 text-mint-dark dark:text-mint font-extrabold text-xs sm:text-sm hover:bg-mint-light transition-all flex items-center gap-2 border border-mint/20"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center p-0.5 rounded-full border border-border shadow-2xs">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: '!w-9 !h-9',
                    userButtonTrigger: 'focus:shadow-none focus:outline-none flex items-center',
                  },
                }}
              />
            </div>
          </Show>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
            className="w-10 h-10 rounded-full bg-bg-input border border-border flex items-center justify-center cursor-pointer transition-all hover:bg-border/60 active:scale-95 shadow-2xs"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5 text-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden animate-fadeIn mt-3 pt-3 border-t border-border bg-bg-card rounded-2xl p-4 shadow-xl space-y-3">
          <Show when="signed-out">
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-bg-input border border-border text-xs font-extrabold text-text-primary hover:bg-border/60 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-mint hover:bg-mint-dark text-text-on-dark text-xs font-black shadow-xs transition-colors"
              >
                Log In ✨
              </Link>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center justify-between gap-3 pt-1">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-mint hover:bg-mint-dark text-text-on-dark text-xs font-black flex items-center justify-center gap-2 shadow-xs"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center p-0.5 rounded-full border border-border shadow-2xs">
                <UserButton />
              </div>
            </div>
          </Show>
        </div>
      )}
    </header>
  );
}

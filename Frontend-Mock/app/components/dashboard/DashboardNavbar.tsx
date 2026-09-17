'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  Settings,
  Sparkles,
  X,
  Flame,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import ThemeToggle from '@/app/components/common/ThemeToggle';

interface DashboardNavbarProps {
  calorieGoal?: number;
}

export default function DashboardNavbar({
  calorieGoal = 2200
}: DashboardNavbarProps) {
  const { user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg-primary/85 border-b border-border transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo and Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-mint rounded-xl px-1 py-0.5"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 bg-gradient-to-br from-mint-light to-mint">
              🥑
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-text-primary">
                Cal<span className="text-mint-dark dark:text-mint">Pal</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest -mt-1 hidden sm:inline-block text-text-tertiary">
                Metabolic Hub
              </span>
            </div>
          </Link>

          {/* Center Badge: Streak & Daily Target */}
          <div className="hidden md:flex items-center gap-3 bg-bg-input px-4 py-1.5 rounded-full border border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>GOAL</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="text-xs font-semibold text-text-secondary">
              Daily Target:{' '}
              <span className="font-bold text-text-primary">
                {calorieGoal.toLocaleString()} kcal
              </span>
            </div>
          </div>

          {/* Right: Settings Button & Clerk Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open Settings"
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-border bg-bg-card text-text-secondary hover:text-text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-mint cursor-pointer shadow-2xs"
            >
              <Settings className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
            </button>

            {/* Clerk User Button */}
            <div className="flex items-center p-0.5 rounded-full border border-border shadow-2xs min-w-[34px] min-h-[34px]">
              {mounted && (
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-8 h-8 rounded-full',
                      userButtonPopoverCard:
                        'shadow-2xl border border-border rounded-2xl bg-bg-card text-text-primary',
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal Dialog */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border bg-bg-card text-text-primary transition-all animate-scaleIn relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-mint-light/50 text-mint-dark dark:text-mint">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight text-text-primary">
                    Preferences & Settings
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Manage your appearance & profile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-xl hover:bg-bg-input text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4">
              {/* Account Quick Info */}
              <div className="p-3.5 rounded-2xl bg-bg-input border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text-secondary">Signed In As</div>
                  <div className="font-extrabold text-sm text-text-primary truncate max-w-[200px]">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'CalPal User'}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-mint-dark dark:text-mint bg-mint-light/60 px-2.5 py-1 rounded-full border border-mint/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active
                </span>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-bg-card">
                <div>
                  <div className="font-bold text-sm text-text-primary">Appearance</div>
                  <div className="text-xs text-text-secondary">
                    Switch between Light and Dark mode
                  </div>
                </div>
                <ThemeToggle showLabel={true} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-black bg-mint hover:bg-mint-dark text-text-on-dark shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

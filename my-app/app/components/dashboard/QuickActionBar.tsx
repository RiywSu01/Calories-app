'use client';

import Link from 'next/link';
import { PlusCircle, SlidersHorizontal, Sparkles, Utensils, ArrowUpRight } from 'lucide-react';

export default function QuickActionBar() {
  return (
    <div
      className="rounded-3xl p-5 sm:p-6 border shadow-sm transition-all duration-300 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
            Quick Actions & Logging
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Choose your preferred way to track nutrition
          </p>
        </div>
        <span className="text-xs font-bold text-white dark:bg-emerald-600/70 px-2.5 py-1 rounded-full">
          3 Modes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">

        {/* Option 1: Log Food */}
        <Link
          href="/add-food"
          className="group relative flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-98"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, var(--mint-dark, #5BB899) 0%, var(--mint, #7ECFB3) 100%)',
              }}
            >
              <PlusCircle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--mint-dark)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div>
            <div className="font-black text-sm text-[var(--text-primary)] group-hover:text-[var(--mint-dark)] transition-colors">
              Log Food
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
              Search the verified nutrition database & recent meals
            </div>
          </div>
        </Link>

        {/* Option 2: Customize */}
        <Link
          href="/add-food/customize"
          className="group relative flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-98"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #A8D8EA 0%, #70A1FF 100%)',
              }}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div>
            <div className="font-black text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
              Customize
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
              Create custom dishes, recipes & manual macro targets
            </div>
          </div>
        </Link>

        {/* Option 3: AI Analyze */}
        <Link
          href="/add-food/ai"
          className="group relative flex flex-col justify-between p-4.5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-98"

          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #FFB7A5 0%, #FF6B81 100%)',
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300">
              AI Smart
            </span>
          </div>
          <div>
            <div className="font-black text-sm text-[var(--text-primary)] group-hover:text-rose-500 transition-colors">
              AI Analyze
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
              Snap a photo or describe meal for instant macro breakdown
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-border bg-bg-input hover:bg-border/60 text-text-primary hover:text-mint-dark dark:hover:text-mint transition-all duration-200 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-mint shadow-2xs cursor-pointer ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300 fill-amber-400/20" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-500 animate-in spin-in-90 duration-300 fill-indigo-500/20" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-extrabold select-none">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}

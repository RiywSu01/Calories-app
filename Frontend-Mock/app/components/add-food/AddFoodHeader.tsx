'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AddFoodHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  rightElement?: React.ReactNode;
}

export default function AddFoodHeader({
  title = 'Add Food',
  subtitle,
  backHref = '/dashboard',
  rightElement,
}: AddFoodHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 mb-4 border-b border-border/40">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-bg-card border border-border shadow-xs hover:border-mint hover:bg-mint-light/20 transition-all text-text-primary group"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  );
}

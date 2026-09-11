'use client';

import React, { useEffect, useState } from 'react';
import { Flame, AlertCircle } from 'lucide-react';

interface CalorieMacroCenterProps {
  calorieGoal: number;
  calorieConsumed: number;
  proteinGoal: number;
  proteinConsumed: number;
  carbsGoal: number;
  carbsConsumed: number;
  fatGoal: number;
  fatConsumed: number;
}

export default function CalorieMacroCenter({
  calorieGoal,
  calorieConsumed,
  proteinGoal,
  proteinConsumed,
  carbsGoal,
  carbsConsumed,
  fatGoal,
  fatConsumed,
}: CalorieMacroCenterProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const safeGoal = Math.max(calorieGoal, 1);
  const rawRatio = calorieConsumed / safeGoal;
  const progress = Math.min(rawRatio, 1);
  const remaining = Math.max(0, calorieGoal - calorieConsumed);
  const isOver = calorieConsumed > calorieGoal;
  const overAmount = calorieConsumed - calorieGoal;

  // Circle Dimensions
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 150);
    return () => clearTimeout(timer);
  }, [progress]);

  // Macro calculations
  const pPercent = Math.min(100, Math.round((proteinConsumed / Math.max(1, proteinGoal)) * 100));
  const cPercent = Math.min(100, Math.round((carbsConsumed / Math.max(1, carbsGoal)) * 100));
  const fPercent = Math.min(100, Math.round((fatConsumed / Math.max(1, fatGoal)) * 100));

  return (
    <div className="rounded-3xl p-6 sm:p-7 border border-border bg-bg-card shadow-xs transition-all duration-300 relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Flame className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-text-primary">
              Daily Energy & Macros
            </h3>
            <p className="text-xs text-text-secondary">
              Real-time metabolic budget & macro breakdown
            </p>
          </div>
        </div>

        {isOver && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" /> Over Budget
          </span>
        )}
      </div>

      {/* Grid Layout: Left Circle Ring / Right Macro Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left / Center: Circular Progress Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 filter drop-shadow-2xs"
            >
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--bg-input)"
                strokeWidth={strokeWidth}
              />
              {/* Animated Foreground Progress */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={isOver ? 'var(--peach)' : 'var(--mint)'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - animatedProgress * circumference}
                style={{
                  transition:
                    'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
                }}
              />
            </svg>

            {/* Metric Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary leading-none">
                {calorieConsumed.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-text-secondary mt-1">
                / {calorieGoal.toLocaleString()} kcal
              </span>

              {isOver ? (
                <div className="mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30">
                  +{overAmount.toLocaleString()} kcal over
                </div>
              ) : (
                <div className="mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-mint-dark dark:text-mint bg-mint-light/60 border border-mint/20">
                  {remaining.toLocaleString()} kcal left
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Macro Distribution Progress Bars */}
        <div className="md:col-span-7 space-y-4">
          {/* Protein Bar */}
          <div className="p-3.5 rounded-2xl bg-bg-input border border-border space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--macro-protein)] shadow-2xs" />
                <span className="font-bold text-text-primary">Protein</span>
              </div>
              <div className="font-bold text-text-secondary">
                <span className="text-text-primary font-black">
                  {Math.round(proteinConsumed)}g
                </span>{' '}
                / {proteinGoal}g
                <span className="ml-2 text-xs font-extrabold text-text-tertiary">
                  ({pPercent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${pPercent}%`,
                  backgroundColor: 'var(--macro-protein)',
                }}
              />
            </div>
          </div>

          {/* Carbs Bar */}
          <div className="p-3.5 rounded-2xl bg-bg-input border border-border space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--macro-carb)] shadow-2xs" />
                <span className="font-bold text-text-primary">Carbohydrates</span>
              </div>
              <div className="font-bold text-text-secondary">
                <span className="text-text-primary font-black">
                  {Math.round(carbsConsumed)}g
                </span>{' '}
                / {carbsGoal}g
                <span className="ml-2 text-xs font-extrabold text-text-tertiary">
                  ({cPercent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${cPercent}%`,
                  backgroundColor: 'var(--macro-carb)',
                }}
              />
            </div>
          </div>

          {/* Fat Bar */}
          <div className="p-3.5 rounded-2xl bg-bg-input border border-border space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--macro-fat)] shadow-2xs" />
                <span className="font-bold text-text-primary">Fats</span>
              </div>
              <div className="font-bold text-text-secondary">
                <span className="text-text-primary font-black">{Math.round(fatConsumed)}g</span>{' '}
                / {fatGoal}g
                <span className="ml-2 text-xs font-extrabold text-text-tertiary">
                  ({fPercent}%)
                </span>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${fPercent}%`,
                  backgroundColor: 'var(--macro-fat)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

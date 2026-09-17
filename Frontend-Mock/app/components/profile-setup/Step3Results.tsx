'use client';

import { BMRResult } from '@/app/lib/types';
import { GoalMode, GOAL_LABELS, MacroResult } from '@/app/lib/calculations/macros';
import { GOAL_MODES } from '@/app/lib/database/profile';
import StatCard from '@/app/components/common/StatCard';
import MacroBar from '@/app/components/common/MacroBar';

interface Step3ResultsProps {
  metrics: BMRResult;
  macros: MacroResult;
  goalMode: GoalMode;
  isSubmitting: boolean;
  error: string | null;
  onGoalChange: (goal: GoalMode) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step3Results({
  metrics,
  macros,
  goalMode,
  isSubmitting,
  error,
  onGoalChange,
  onBack,
  onSubmit,
}: Step3ResultsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--mint)] transition-colors flex items-center gap-1 mb-2 cursor-pointer"
        >
          ← Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Your Numbers ✨
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Based on your stats and activity level.
        </p>
      </div>

      {/* Goal Mode Picker */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--text-primary)]">
          What&apos;s your goal?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_MODES.map((goal) => {
            const { label, emoji } = GOAL_LABELS[goal];
            return (
              <button
                key={goal}
                type="button"
                onClick={() => onGoalChange(goal)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${goalMode === goal
                  ? 'border-[var(--mint)] bg-[var(--mint-light)]/25 text-[var(--mint-dark)] dark:text-[var(--mint)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--mint)]/40'
                  }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[11px] font-black text-center leading-tight">
                  {label}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-tertiary)] text-center">
                  {GOAL_LABELS[goal].description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="BMR"
          value={metrics.bmr.toLocaleString()}
          unit="kcal/day"
          color="text-[var(--lavender)]"
        />
        <StatCard
          label="TDEE"
          value={metrics.tdee.toLocaleString()}
          unit="kcal/day"
          color="text-[var(--peach)]"
        />
        <StatCard
          label="Target"
          value={macros.targetCalories.toLocaleString()}
          unit="kcal/day"
          color="text-[var(--mint-dark)] dark:text-[var(--mint)]"
        />
        <StatCard
          label="BMI"
          value={metrics.bmi}
          unit={metrics.bmiCategory}
          color="text-[var(--text-primary)]"
        />
      </div>

      {/* Macros */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-3 shadow-sm">
        <p className="text-sm font-black text-[var(--text-primary)] mb-1">
          Daily Macro Targets
        </p>
        <MacroBar label="Protein" grams={macros.proteinG} emoji="🥩" color="bg-[var(--macro-protein)]" />
        <MacroBar label="Fat" grams={macros.fatG} emoji="🥑" color="bg-[var(--macro-fat)]" />
        <MacroBar label="Carbs" grams={macros.carbsG} emoji="🍞" color="bg-[var(--macro-carb)]" />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-semibold">
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-2xl bg-[var(--mint)] hover:bg-[var(--mint-dark)] text-white font-black text-base transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Saving…
          </>
        ) : (
          "Let's Begin Journey 🚀"
        )}
      </button>

      <p className="text-center text-[11px] text-[var(--text-tertiary)]">
        You can always update these in your profile settings later.
      </p>
    </div>
  );
}

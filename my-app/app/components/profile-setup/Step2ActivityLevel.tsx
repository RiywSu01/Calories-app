'use client';

import { ActivityLevel } from '@/app/lib/types';
import { ACTIVITY_CARDS } from '@/app/lib/database/profile';

interface Step2ActivityLevelProps {
  activityLevel: ActivityLevel | null;
  onSelectActivity: (level: ActivityLevel) => void;
  onBack: () => void;
  onCalculate: () => void;
}

export default function Step2ActivityLevel({
  activityLevel,
  onSelectActivity,
  onBack,
  onCalculate,
}: Step2ActivityLevelProps) {
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
          How active are you? 🏃
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Pick the level that best describes your typical week.
        </p>
      </div>

      {/* Activity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIVITY_CARDS.map(({ level, emoji, title, subtitle, detail }) => (
          <button
            key={level}
            type="button"
            onClick={() => onSelectActivity(level)}
            className={`text-left flex flex-col gap-1.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${activityLevel === level
                ? 'border-[var(--mint)] bg-[var(--mint-light)]/20 shadow-md'
                : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--mint)]/40 hover:shadow-sm'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p
                  className={`text-sm font-black ${activityLevel === level
                      ? 'text-[var(--mint-dark)] dark:text-[var(--mint)]'
                      : 'text-[var(--text-primary)]'
                    }`}
                >
                  {title}
                </p>
                <p className="text-[11px] font-bold text-[var(--text-tertiary)]">
                  {subtitle}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-0.5">
              {detail}
            </p>
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onCalculate}
        disabled={!activityLevel}
        className="w-full py-3.5 rounded-2xl bg-[var(--mint)] hover:bg-[var(--mint-dark)] text-white font-black text-base transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        Calculate for Your Goal 🧬
      </button>
    </div>
  );
}

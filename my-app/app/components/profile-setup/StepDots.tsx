'use client';

import { Step } from '@/app/lib/types';

interface StepDotsProps {
  current: Step;
  totalSteps?: number;
}

export default function StepDots({ current, totalSteps = 3 }: StepDotsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => (i + 1) as Step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s) => (
        <div
          key={s}
          className={`rounded-full transition-all duration-300 ${
            s === current
              ? 'w-6 h-2.5 bg-[var(--mint)]'
              : s < current
              ? 'w-2.5 h-2.5 bg-[var(--mint)]/60'
              : 'w-2.5 h-2.5 bg-[var(--border)]'
          }`}
        />
      ))}
    </div>
  );
}

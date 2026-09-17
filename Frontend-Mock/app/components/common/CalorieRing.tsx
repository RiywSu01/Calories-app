'use client';

import { useEffect, useRef, useState } from 'react';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export default function CalorieRing({
  consumed,
  goal,
  size = 180,
  strokeWidth = 14,
}: CalorieRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / goal, 1);
  const offset = circumference - progress * circumference;

  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const remaining = Math.max(goal - consumed, 0);
  const isOver = consumed > goal;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }} className="animate-scaleIn">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
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
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease',
          }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {consumed.toLocaleString()}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          / {goal.toLocaleString()} cal
        </div>
        {!isOver && (
          <div style={{ fontSize: '11px', color: 'var(--mint)', fontWeight: 700, marginTop: '4px' }}>
            {remaining} left
          </div>
        )}
        {isOver && (
          <div style={{ fontSize: '11px', color: 'var(--peach)', fontWeight: 700, marginTop: '4px' }}>
            {consumed - goal} over!
          </div>
        )}
      </div>
    </div>
  );
}

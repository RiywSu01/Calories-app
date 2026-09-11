'use client';

interface MacroBarProps {
  label: string;
  grams: number;
  color: string;
  emoji: string;
}

export default function MacroBar({
  label,
  grams,
  color,
  emoji,
}: MacroBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-6 text-center flex-shrink-0">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
            {label}
          </span>
          <span className="text-xs font-black text-[var(--text-primary)]">{grams}g</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)]">
          <div className={`h-2 rounded-full ${color}`} style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

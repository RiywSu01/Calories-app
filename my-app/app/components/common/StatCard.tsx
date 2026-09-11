'use client';

interface StatCardProps {
  label: string;
  value: number | string;
  unit: string;
  color: string;
}

export default function StatCard({ label, value, unit, color }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)]">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-xs font-bold text-[var(--text-secondary)]">{unit}</span>
      <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">
        {label}
      </span>
    </div>
  );
}

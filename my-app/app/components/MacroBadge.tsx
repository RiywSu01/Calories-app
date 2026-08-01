'use client';

interface MacroBadgeProps {
  label: string;
  value: number;
  unit: string;
  emoji: string;
  variant: 'protein' | 'fat' | 'carb';
}

export default function MacroBadge({ label, value, unit, emoji, variant }: MacroBadgeProps) {
  return (
    <span className={`pill pill-${variant}`}>
      <span>{emoji}</span>
      <span>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}{unit}</span>
    </span>
  );
}

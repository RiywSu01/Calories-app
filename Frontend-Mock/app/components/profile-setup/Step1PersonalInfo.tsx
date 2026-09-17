'use client';

import { Dispatch, SetStateAction } from 'react';
import { Gender, PersonalInfo } from '@/app/lib/types';

interface Step1PersonalInfoProps {
  info: PersonalInfo;
  setInfo: Dispatch<SetStateAction<PersonalInfo>>;
  errors: Partial<Record<keyof PersonalInfo, string>>;
  onNext: () => void;
}

const GENDERS: Gender[] = ['female', 'male'];

export default function Step1PersonalInfo({
  info,
  setInfo,
  errors,
  onNext,
}: Step1PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Tell us about yourself 👋
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          We&apos;ll use this to calculate your personal nutrition targets.
        </p>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--text-primary)]">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setInfo((p) => ({ ...p, gender: g }))}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold text-sm ${
                info.gender === g
                  ? 'border-[var(--mint)] bg-[var(--mint-light)]/30 text-[var(--mint-dark)] dark:text-[var(--mint)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--mint)]/50'
              }`}
            >
              <span className="text-3xl">{g === 'female' ? '👩' : '👨'}</span>
              <span className="capitalize">{g}</span>
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-xs text-red-400 font-semibold">{errors.gender}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <label htmlFor="dob" className="text-sm font-bold text-[var(--text-primary)]">
          Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          value={info.dateOfBirth}
          onChange={(e) => setInfo((p) => ({ ...p, dateOfBirth: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:border-[var(--mint)] transition-colors"
        />
        {errors.dateOfBirth && (
          <p className="text-xs text-red-400 font-semibold">{errors.dateOfBirth}</p>
        )}
      </div>

      {/* Height & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="height" className="text-sm font-bold text-[var(--text-primary)]">
            Height
          </label>
          <div className="relative">
            <input
              id="height"
              type="number"
              min={50}
              max={250}
              placeholder="170"
              value={info.heightCm}
              onChange={(e) => setInfo((p) => ({ ...p, heightCm: e.target.value }))}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:border-[var(--mint)] transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-tertiary)]">
              cm
            </span>
          </div>
          {errors.heightCm && (
            <p className="text-xs text-red-400 font-semibold">{errors.heightCm}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="weight" className="text-sm font-bold text-[var(--text-primary)]">
            Weight
          </label>
          <div className="relative">
            <input
              id="weight"
              type="number"
              min={20}
              max={300}
              step="0.1"
              placeholder="65"
              value={info.weightKg}
              onChange={(e) => setInfo((p) => ({ ...p, weightKg: e.target.value }))}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:border-[var(--mint)] transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-tertiary)]">
              kg
            </span>
          </div>
          {errors.weightKg && (
            <p className="text-xs text-red-400 font-semibold">{errors.weightKg}</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        className="w-full py-3.5 rounded-2xl bg-[var(--mint)] hover:bg-[var(--mint-dark)] text-white font-black text-base transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
      >
        Go Next →
      </button>
    </div>
  );
}

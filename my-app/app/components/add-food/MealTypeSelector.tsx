'use client';

import React from 'react';
import { MealType } from '@/app/lib/types';

interface MealTypeSelectorProps {
  selectedMeal: MealType;
  onChange: (meal: MealType) => void;
  className?: string;
}

const MEAL_OPTIONS: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch', label: 'Lunch', emoji: '☀️' },
  { type: 'dinner', label: 'Dinner', emoji: '🌙' },
];

export default function MealTypeSelector({
  selectedMeal,
  onChange,
  className = '',
}: MealTypeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 p-1.5 bg-bg-card border border-border rounded-2xl shadow-xs ${className}`}>
      {MEAL_OPTIONS.map((option) => {
        const isActive = selectedMeal === option.type;
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isActive
                ? 'bg-mint text-text-on-dark shadow-xs scale-[1.02]'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'
            }`}
          >
            <span>{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

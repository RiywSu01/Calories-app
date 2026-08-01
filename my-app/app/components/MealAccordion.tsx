'use client';

import { useState } from 'react';
import { MealType, MealEntry } from '../lib/types';
import FoodCard from './FoodCard';

interface MealAccordionProps {
  mealType: MealType;
  entries: MealEntry[];
  onRemoveEntry?: (id: string) => void;
  defaultOpen?: boolean;
}

const MEAL_CONFIG: Record<MealType, { emoji: string; label: string }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast' },
  lunch: { emoji: '☀️', label: 'Lunch' },
  dinner: { emoji: '🌙', label: 'Dinner' },
};

export default function MealAccordion({
  mealType,
  entries,
  onRemoveEntry,
  defaultOpen = false,
}: MealAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = MEAL_CONFIG[mealType];
  const totalCal = entries.reduce((sum, e) => sum + e.foodItem.calories * e.quantity, 0);

  return (
    <div className="animate-fadeIn" style={{ marginBottom: '8px' }}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: isOpen ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
          border: 'none',
          cursor: 'pointer',
          background: 'var(--bg-meal-header)',
          color: '#FFFFFF',
          fontFamily: "'Nunito', sans-serif",
          fontSize: '15px',
          fontWeight: 700,
          transition: 'border-radius 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{config.emoji}</span>
          <span>{config.label}</span>
          {entries.length > 0 && (
            <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 600 }}>
              ({entries.length} items · {Math.round(totalCal)} cal)
            </span>
          )}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Content */}
      <div
        style={{
          maxHeight: isOpen ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          background: 'var(--bg-card)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          boxShadow: isOpen ? '0 4px 12px var(--shadow)' : 'none',
        }}
      >
        <div style={{ padding: '8px' }}>
          {entries.length === 0 ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              No food added yet ✨
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {entries.map((entry) => (
                <FoodCard key={entry.id} entry={entry} onRemove={onRemoveEntry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

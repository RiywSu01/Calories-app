'use client';

import { useState } from 'react';
import { formatDate } from '../lib/storage';

interface WeekCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the week surrounding today (3 days before, today, 3 days after)
  const days: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  return (
    <div
      className="animate-fadeIn"
      style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        padding: '16px 8px',
        overflowX: 'auto',
      }}
    >
      {days.map((day) => {
        const dateStr = formatDate(day);
        const isSelected = dateStr === selectedDate;
        const isToday = formatDate(day) === formatDate(today);

        return (
          <button
            key={dateStr}
            onClick={() => onDateSelect(dateStr)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer',
              background: isSelected ? 'var(--mint)' : 'var(--bg-card)',
              color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
              boxShadow: isSelected ? '0 4px 12px rgba(126, 207, 179, 0.4)' : '0 1px 4px var(--shadow)',
              transition: 'all 0.2s ease',
              minWidth: '48px',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, opacity: isSelected ? 1 : 0.6 }}>
              {DAY_NAMES[day.getDay()]}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800 }}>
              {day.getDate()}
            </span>
            {isToday && (
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: isSelected ? '#FFFFFF' : 'var(--mint)',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

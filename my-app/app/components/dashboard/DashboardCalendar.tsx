'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, Lock } from 'lucide-react';
import { formatDateKey } from '@/app/lib/api/dashboard';

interface DashboardCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DashboardCalendar({ selectedDate, onSelectDate }: DashboardCalendarProps) {
  // 1. Current today's date from local system clock
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateKey(today);

  // Direction of date transition ('forward' | 'backward' | 'jump')
  const [animDirection, setAnimDirection] = useState<'forward' | 'backward' | 'jump'>('jump');
  const prevDateRef = useRef<string>(selectedDate);

  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
      if (selectedDate > prevDateRef.current) {
        setAnimDirection('forward');
      } else if (selectedDate < prevDateRef.current) {
        setAnimDirection('backward');
      } else {
        setAnimDirection('jump');
      }
      prevDateRef.current = selectedDate;
    }
  }, [selectedDate]);

  // 2. Parse selected date into Date object
  const parts = selectedDate.split('-');
  const selectedObj =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : today;

  // 3. Generate 7-day strip centered around the selected date (3 days before, 3 days after)
  const weekDays: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(selectedObj);
    d.setDate(selectedObj.getDate() + i);
    weekDays.push(d);
  }

  //-------- DAY Checker -------------------------------
  const isSelectedToday = selectedDate === todayStr;
  const isPast = selectedDate < todayStr;
  const isFuture = selectedDate > todayStr;

  //handle previous day
  const handlePrevDay = () => {
    const prev = new Date(selectedObj);
    prev.setDate(selectedObj.getDate() - 1);
    setAnimDirection('backward');
    onSelectDate(formatDateKey(prev));
  };

  //handle next day
  const handleNextDay = () => {
    const next = new Date(selectedObj);
    next.setDate(selectedObj.getDate() + 1);
    setAnimDirection('forward');
    onSelectDate(formatDateKey(next));
  };

  //handle jump today
  const handleJumpToday = () => {
    setAnimDirection('jump');
    onSelectDate(todayStr);
  };

  const handleSelectDay = (dateStr: string) => {
    if (dateStr > selectedDate) {
      setAnimDirection('forward');
    } else if (dateStr < selectedDate) {
      setAnimDirection('backward');
    } else {
      setAnimDirection('jump');
    }
    onSelectDate(dateStr);
  };

  // Animation class based on direction
  const animationClass =
    animDirection === 'forward'
      ? 'animate-slideFromRight'
      : animDirection === 'backward'
        ? 'animate-slideFromLeft'
        : 'animate-calendarPop';

  return (
    <div
      className="rounded-3xl p-4 sm:p-5 border transition-all duration-300 shadow-sm select-none"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header Info: Month, Year, and Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Month & Year Title with Navigation Chevrons */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div key={`header-${selectedDate}`} className="animate-fadeIn">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              {MONTH_NAMES[selectedObj.getMonth()]} {selectedObj.getFullYear()}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {DAY_NAMES[selectedObj.getDay()]}, {selectedObj.getDate()} {MONTH_NAMES[selectedObj.getMonth()]}
            </p>
          </div>
        </div>

        {/* Status Indicators & Jump to Today */}
        <div className="flex items-center gap-2">
          {isSelectedToday ? (
            <span
              key="status-today"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/25 text-emerald-700 border border-emerald-500/30 dark:bg-emerald-900/80 dark:text-emerald-300 dark:border-emerald-500/30 shadow-2xs animate-scaleIn"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Today
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span
                key={`status-${isPast ? 'past' : 'future'}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs animate-scaleIn ${isPast
                  ? 'bg-amber-400/25 text-amber-100 border-amber-500/30 dark:bg-amber-700 dark:text-amber-200 dark:border-amber-500/30'
                  : 'bg-blue-400/25 text-blue-700 border-blue-500/30 dark:bg-blue-900/80 dark:text-blue-300 dark:border-blue-500/30'
                  }`}
              >
                <Lock className={`w-3.5 h-3.5 shrink-0 ${isPast ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`} />
                {isPast ? 'History (View Only)' : 'Future Date (View Only)'}
              </span>

              <button
                type="button"
                onClick={handleJumpToday}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/25 text-xs font-bold border border-[var(--border)] text-[var(--mint-dark)] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                Today
              </button>
            </div>
          )}

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-all active:scale-80 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-all active:scale-80 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Date Carousel Strip with dynamic directional animation key */}
      <div key={`calendar-strip-${selectedDate}`} className={`grid grid-cols-7 items-center gap-1 sm:gap-2 pt-1 pb-1 ${animationClass}`}>
        {weekDays.map((day) => {
          const dateStr = formatDateKey(day);
          const isSelected = dateStr === selectedDate;
          const isCurrentToday = dateStr === todayStr;

          return (
            <button
              key={`${dateStr}-${isSelected ? 'active' : 'idle'}`}
              type="button"
              onClick={() => handleSelectDay(dateStr)}
              className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none ${isSelected
                ? 'relative z-10 py-3.5 sm:py-4 px-1.5 sm:px-2 rounded-2xl sm:rounded-3xl scale-110 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/60 font-black animate-popUp'
                : 'py-2 sm:py-2.5 px-0.5 sm:px-1 rounded-xl sm:rounded-2xl scale-95 opacity-75 hover:opacity-100 hover:scale-100 font-medium active:scale-90'
                }`}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, var(--mint-dark, #5BB899) 0%, var(--mint, #7ECFB3) 100%)'
                  : 'var(--bg-input)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: isSelected
                  ? '2px solid transparent'
                  : isCurrentToday
                    ? '2px solid var(--mint)'
                    : '1px solid var(--border)',
              }}
            >
              <span
                className={`uppercase tracking-wider transition-all ${isSelected
                  ? 'text-[11px] sm:text-xs font-black text-white'
                  : 'text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)]'
                  }`}
              >
                {DAY_NAMES[day.getDay()]}
              </span>
              <span
                className={`mt-0.5 font-black transition-all ${isSelected
                  ? 'text-lg sm:text-xl text-white'
                  : 'text-sm sm:text-base'
                  }`}
              >
                {day.getDate()}
              </span>

              {/* Status Dot */}
              <div className="mt-1 flex items-center justify-center">
                {isCurrentToday ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${isSelected ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'bg-[var(--mint-dark)]'
                      }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

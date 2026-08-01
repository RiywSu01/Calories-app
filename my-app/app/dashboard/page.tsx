'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUser, getDailyLog, getMealsForType, removeFoodFromMeal, getTodayDate, logout } from '../lib/storage';
import { UserProfile, DailyLog, MealType } from '../lib/types';
import ThemeToggle from '../components/ThemeToggle';
import WeekCalendar from '../components/WeekCalendar';
import CalorieRing from '../components/CalorieRing';
import MacroBadge from '../components/MacroBadge';
import MealAccordion from '../components/MealAccordion';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
  }, [router]);

  useEffect(() => {
    setDailyLog(getDailyLog(selectedDate));
  }, [selectedDate]);

  const refreshLog = () => {
    setDailyLog(getDailyLog(selectedDate));
  };

  const handleRemoveEntry = (entryId: string) => {
    removeFoodFromMeal(selectedDate, entryId);
    refreshLog();
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user || !dailyLog) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-scaleIn" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🥑</div>
          <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  const isToday = selectedDate === getTodayDate();

  return (
    <div className="page-container page-padding">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {isToday ? `Hi, ${user.name.split(' ')[0]}! 👋` : selectedDate}
          </h1>
          {isToday && (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
              Let&apos;s track your meals today
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ThemeToggle />
          {/* Menu button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'var(--bg-input)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ☰
            </button>
            {menuOpen && (
              <div
                className="animate-fadeIn"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 20px var(--shadow-md)',
                  padding: '8px',
                  zIndex: 50,
                  minWidth: '160px',
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--peach)',
                    fontFamily: "'Nunito', sans-serif",
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-input)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  🚪 Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Week Calendar */}
      <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      {/* Calorie Ring */}
      <div style={{ margin: '20px 0 16px' }}>
        <CalorieRing consumed={dailyLog.totalCalories} goal={user.dailyCalorieGoal} />
      </div>

      {/* Macro Badges */}
      <div className="animate-fadeIn" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <MacroBadge emoji="🥩" label="Protein" value={dailyLog.totalProtein} unit="g" variant="protein" />
        <MacroBadge emoji="🥑" label="Fat" value={dailyLog.totalFat} unit="g" variant="fat" />
        <MacroBadge emoji="🌾" label="Carb" value={dailyLog.totalCarbs} unit="g" variant="carb" />
      </div>

      {/* Meal Accordions */}
      <div>
        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType, i) => (
          <MealAccordion
            key={mealType}
            mealType={mealType}
            entries={getMealsForType(dailyLog, mealType)}
            onRemoveEntry={handleRemoveEntry}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        className="fab"
        onClick={() => router.push(`/add-food?date=${selectedDate}`)}
        aria-label="Add food"
      >
        +
      </button>

      {/* Click-away for menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
        />
      )}
    </div>
  );
}

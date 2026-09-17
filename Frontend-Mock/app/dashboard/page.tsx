'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/app/components/dashboard/DashboardNavbar';
import DashboardCalendar from '@/app/components/dashboard/DashboardCalendar';
import CalorieMacroCenter from '@/app/components/dashboard/CalorieMacroCenter';
import MealCategoryList from '@/app/components/dashboard/MealCategoryList';
import QuickActionBar from '@/app/components/dashboard/QuickActionBar';
import TipsCarousel from '@/app/components/dashboard/TipsCarousel';
import {
  DashboardSummary,
  fetchDashboardData,
  formatDateKey,
} from '@/app/lib/api/dashboard';
import { deleteFoodLog } from '@/app/lib/api/foods';
import FatSecretAttribution from '@/app/components/common/FatSecretAttribution';
import { Loader2, Sparkles } from 'lucide-react';


export default function DashboardPage() {
  const router = useRouter();
  const { userId, getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateKey(new Date())
  );
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load dashboard data whenever selectedDate, userId or auth token changes
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const data = await fetchDashboardData(selectedDate, token, userId);
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, getToken, userId]);

  useEffect(() => {
    if (isUserLoaded && user?.publicMetadata?.role === 'admin') {
      router.replace('/admin');
      return;
    }

    if (isAuthLoaded && !isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    if (isAuthLoaded && isSignedIn) {
      loadData();
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, selectedDate, loadData, router]);


  // Handle real database deletion of food item with optimistic UI update
  const handleDeleteItem = useCallback(
    async (mealType: string, itemId: string) => {
      if (!dashboardData) return;

      const mType = mealType as keyof typeof dashboardData.meals;
      const targetCategory = dashboardData.meals[mType];
      if (!targetCategory) return;

      const previousData = dashboardData;

      // 1. Optimistically update local UI immediately
      const updatedItems = targetCategory.items.filter(
        (item) => item.id !== itemId
      );
      const updatedCategory = {
        ...targetCategory,
        items: updatedItems,
      };

      const updatedMeals = {
        ...dashboardData.meals,
        [mType]: updatedCategory,
      };

      // Recalculate totals
      const allItems = Object.values(updatedMeals).flatMap((cat) => cat.items);
      const calorieConsumed = allItems.reduce(
        (acc, i) => acc + i.calories * i.quantity,
        0
      );
      const proteinConsumed = allItems.reduce(
        (acc, i) => acc + i.protein * i.quantity,
        0
      );
      const carbsConsumed = allItems.reduce(
        (acc, i) => acc + i.carbs * i.quantity,
        0
      );
      const fatConsumed = allItems.reduce(
        (acc, i) => acc + i.fat * i.quantity,
        0
      );

      setDashboardData({
        ...dashboardData,
        calorieConsumed,
        calorieRemaining: Math.max(
          0,
          dashboardData.calorieGoal - calorieConsumed
        ),
        proteinConsumed,
        carbsConsumed,
        fatConsumed,
        meals: updatedMeals,
      });

      // 2. Call backend DELETE endpoint to remove from PostgreSQL
      try {
        const token = await getToken();
        await deleteFoodLog(itemId, token);
      } catch (err) {
        console.error('Failed to delete food log from database:', err);
        // Rollback to previous state on failure
        setDashboardData(previousData);
      }
    },
    [dashboardData, getToken]
  );

  const calorieGoal = dashboardData?.calorieGoal ?? 2500;
  const calorieConsumed = dashboardData?.calorieConsumed ?? 0;
  const proteinGoal = dashboardData?.proteinGoal ?? 0;
  const proteinConsumed = dashboardData?.proteinConsumed ?? 0;
  const carbsGoal = dashboardData?.carbsGoal ?? 0;
  const carbsConsumed = dashboardData?.carbsConsumed ?? 0;
  const fatGoal = dashboardData?.fatGoal ?? 0;
  const fatConsumed = dashboardData?.fatConsumed ?? 0;
  const isToday = dashboardData?.isToday ?? selectedDate === formatDateKey(new Date());

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-emerald-200 dark:selection:bg-emerald-900">
      {/* 1. New Navbar */}
      <DashboardNavbar calorieGoal={calorieGoal} />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">

        {/* Welcome Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 text-[var(--text-primary)]">
              Welcome back, {user?.firstName || 'Friend'}! 🥑
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Here is your daily metabolic overview and food tracking journal.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--bg-card)] border border-[var(--border)] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[var(--text-secondary)]">Target:</span>
            <span className="font-black text-[var(--mint-dark)]">{calorieGoal} kcal</span>
          </div>
        </div>

        {/* 2. Calendar at Top */}
        <section aria-label="Date Navigation Calendar">
          <DashboardCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </section>

        {/* 3. Central Calorie Ring & Macro Bars */}
        <section aria-label="Energy and Macro Overview">
          {isLoading && !dashboardData ? (
            <div className="h-64 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--mint-dark)]" />
            </div>
          ) : (
            <CalorieMacroCenter
              calorieGoal={calorieGoal}
              calorieConsumed={calorieConsumed}
              proteinGoal={proteinGoal}
              proteinConsumed={proteinConsumed}
              carbsGoal={carbsGoal}
              carbsConsumed={carbsConsumed}
              fatGoal={fatGoal}
              fatConsumed={fatConsumed}
            />
          )}
        </section>

        {/* 5. Quick Actions Option Bar (Placed prominently between macros & meals) */}
        <section aria-label="Quick Actions">
          <QuickActionBar />
        </section>

        {/* 4. Meal Type Categories (Breakfast, Lunch, Dinner) */}
        <section aria-label="Logged Meals">
          {dashboardData && (
            <MealCategoryList
              meals={dashboardData.meals}
              isToday={isToday}
              onDeleteItem={handleDeleteItem}
            />
          )}
        </section>

        {/* 6. Tips & Suggestions Carousel */}
        <section aria-label="Daily Nutrition Tips">
          <TipsCarousel />
        </section>

      </main>

      {/* FatSecret API Attribution & Medical Disclaimer Footer */}
      <FatSecretAttribution variant="footer" className="mt-8" />
    </div>
  );
}


import { ActivityLevel, DashboardFoodItem, DashboardSummary, MealType, ProfilePayload } from "../types";
import { demoStore, isDemoMode } from "./demoStore";

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


// --------------------------------------- Data Fetching --------------------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Used to check that profile is existing on /profile-setup.
 * used on /dashboard.
 **/
export async function getUserProfile(userId: string, token: string | null): Promise<ProfilePayload | null> {
  if (isDemoMode()) {
    return demoStore.getProfile(userId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok || response.status === 404) {
      return demoStore.getProfile(userId);
    }
    const body = await response.json();
    return body?.data ?? body;
  } catch (err) {
    return demoStore.getProfile(userId);
  }
}

/**
 * Fetch dashboard data for a specific date from NestJS backend (with resilient fallback)
 * 1. Retrieves user macro goals from GET /profile/:userId
 * 2. Retrieves food logs from GET /food-logs?date=YYYY-MM-DD
 */
export async function fetchDashboardData(
  dateStr: string,
  token: string | null,
  userId?: string | null
): Promise<DashboardSummary> {
  const todayStr = formatDateKey(new Date());
  const isToday = dateStr === todayStr;

  //boilerplate for Goal
  let savedGoals = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 70,
  };

  // ─── Retrieve Personalized Goals ───
  if (userId) {
    try {
      const profile = await getUserProfile(userId, token);
      if (profile) {
        if (profile.targetCalories) savedGoals.calories = profile.targetCalories;
        if (profile.targetProtein) savedGoals.protein = profile.targetProtein;
        if (profile.targetCarbs) savedGoals.carbs = profile.targetCarbs;
        if (profile.targetFat) savedGoals.fat = profile.targetFat;
      }
    } catch (err) {
      console.warn('Could not load user profile goals, using defaults:', err);
    }
  }

  // If in demo mode, directly load from demoStore
  if (isDemoMode()) {
    const demoLogs = demoStore.getLogs(dateStr, userId);
    return transformBackendLogs(dateStr, isToday, demoLogs, savedGoals);
  }

  try {
    // Only fetch logs if both token and userId are present
    if (token && userId) {
      const url = `${API_BASE_URL}/food-logs?date=${dateStr}&userId=${encodeURIComponent(userId)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const json = await response.json();
        const logs = Array.isArray(json?.data) ? json.data : [];
        return transformBackendLogs(dateStr, isToday, logs, savedGoals);
      }
    }
  } catch (err) {
    console.warn('Backend food-logs fetch failed, using local demo fallback:', err);
  }

  // Fallback to demo logs if backend is unreachable
  const fallbackLogs = demoStore.getLogs(dateStr, userId);
  return transformBackendLogs(dateStr, isToday, fallbackLogs, savedGoals);
}

function transformBackendLogs(
  dateStr: string,
  isToday: boolean,
  logs: any[],
  savedGoals: { calories: number; protein: number; carbs: number; fat: number }
): DashboardSummary {
  const breakfastItems: DashboardFoodItem[] = [];
  const lunchItems: DashboardFoodItem[] = [];
  const dinnerItems: DashboardFoodItem[] = [];

  // If logs = [] , it will skip this forEach().
  logs.forEach((log) => {
    const qty = Number(log.quantity) || 1;

    // Per-unit macros:
    // If backend provided caloriesPerServing on food object, use that.
    // Otherwise, derive per-unit macro by dividing total by quantity to prevent double-multiplication.
    const unitCalories = log.food?.caloriesPerServing != null
      ? log.food.caloriesPerServing
      : log.totalCalories != null
        ? Math.round(log.totalCalories / qty)
        : 0;

    const unitProtein = log.food?.protein != null
      ? log.food.protein
      : log.totalProtein != null
        ? Number((log.totalProtein / qty).toFixed(1))
        : 0;

    const unitCarbs = log.food?.carbs != null
      ? log.food.carbs
      : log.totalCarbs != null
        ? Number((log.totalCarbs / qty).toFixed(1))
        : 0;

    const unitFat = log.food?.fat != null
      ? log.food.fat
      : log.totalFat != null
        ? Number((log.totalFat / qty).toFixed(1))
        : 0;

    const item: DashboardFoodItem = {
      id: log.foodLogId || log.id || Math.random().toString(),
      name: log.food?.foodName || log.name || 'Verified Food Item',
      calories: unitCalories,
      protein: unitProtein,
      carbs: unitCarbs,
      fat: unitFat,
      servingSize: log.food?.servingSize || 1,
      servingUnit: log.food?.servingUnit || 'serving',
      quantity: qty,
    };

    const mealType = String(log.mealType || '').toUpperCase();
    if (mealType === 'BREAKFAST') breakfastItems.push(item);
    else if (mealType === 'LUNCH') lunchItems.push(item);
    else if (mealType === 'DINNER') dinnerItems.push(item);
  });


  const allItems = [...breakfastItems, ...lunchItems, ...dinnerItems];
  const calorieConsumed = allItems.reduce((acc, item) => acc + item.calories * item.quantity, 0);
  const proteinConsumed = allItems.reduce((acc, item) => acc + item.protein * item.quantity, 0);
  const carbsConsumed = allItems.reduce((acc, item) => acc + item.carbs * item.quantity, 0);
  const fatConsumed = allItems.reduce((acc, item) => acc + item.fat * item.quantity, 0);

  return {
    date: dateStr,
    isToday,
    calorieGoal: savedGoals.calories,
    calorieConsumed,
    calorieRemaining: Math.max(0, savedGoals.calories - calorieConsumed),
    proteinGoal: savedGoals.protein,
    proteinConsumed,
    carbsGoal: savedGoals.carbs,
    carbsConsumed,
    fatGoal: savedGoals.fat,
    fatConsumed,
    meals: {
      breakfast: {
        type: 'breakfast',
        label: 'Breakfast',
        emoji: '🌅',
        items: breakfastItems,
      },
      lunch: {
        type: 'lunch',
        label: 'Lunch',
        emoji: '☀️',
        items: lunchItems,
      },
      dinner: {
        type: 'dinner',
        label: 'Dinner',
        emoji: '🌙',
        items: dinnerItems,
      },
    },
  };
}

// Re-exports: Make other files can both imports type and the functions in one file.
export type { DashboardSummary };


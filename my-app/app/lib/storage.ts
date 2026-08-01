// ============================================================
// CalPal — Data Service (Abstraction Layer)
// All data access goes through this service.
// Currently uses localStorage — swap these functions for
// API calls when connecting to a real backend.
// ============================================================

import { UserProfile, DailyLog, MealEntry, MealType, FoodItem } from './types';

const KEYS = {
  USER: 'calpal_user',
  DAILY_LOG_PREFIX: 'calpal_log_',
  AUTH: 'calpal_auth',
} as const;

// ── Helpers ──

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Auth Service ──
// Replace these with real auth (Firebase/Supabase) later

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.AUTH) === 'true';
}

export function login(email: string, _password: string): boolean {
  // Mock login — just check if user profile exists with matching email
  const user = getUser();
  if (user && user.email === email) {
    localStorage.setItem(KEYS.AUTH, 'true');
    return true;
  }
  return false;
}

export function signup(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
  const user: UserProfile = {
    ...profile,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  localStorage.setItem(KEYS.AUTH, 'true');
  return user;
}

export function logout(): void {
  localStorage.removeItem(KEYS.AUTH);
}

// ── User Profile ──

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function updateUser(updates: Partial<UserProfile>): UserProfile | null {
  const user = getUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  saveUser(updated);
  return updated;
}

// ── Daily Logs ──

function logKey(date: string): string {
  return `${KEYS.DAILY_LOG_PREFIX}${date}`;
}

export function getDailyLog(date: string): DailyLog {
  if (typeof window === 'undefined') {
    return { date, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
  }
  const data = localStorage.getItem(logKey(date));
  if (data) return JSON.parse(data);
  return {
    date,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };
}

function recalculateTotals(log: DailyLog): DailyLog {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of log.meals) {
    const qty = meal.quantity;
    totalCalories += meal.foodItem.calories * qty;
    totalProtein += meal.foodItem.protein * qty;
    totalCarbs += meal.foodItem.carbs * qty;
    totalFat += meal.foodItem.fat * qty;
  }

  return {
    ...log,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
  };
}

export function saveDailyLog(log: DailyLog): void {
  localStorage.setItem(logKey(log.date), JSON.stringify(log));
}

export function addFoodToMeal(
  date: string,
  foodItem: FoodItem,
  mealType: MealType,
  quantity: number = 1
): DailyLog {
  const log = getDailyLog(date);
  const entry: MealEntry = {
    id: generateId(),
    foodItem,
    quantity,
    mealType,
    addedAt: new Date().toISOString(),
  };
  log.meals.push(entry);
  const updated = recalculateTotals(log);
  saveDailyLog(updated);
  return updated;
}

export function removeFoodFromMeal(date: string, entryId: string): DailyLog {
  const log = getDailyLog(date);
  log.meals = log.meals.filter((m) => m.id !== entryId);
  const updated = recalculateTotals(log);
  saveDailyLog(updated);
  return updated;
}

export function getMealsForType(log: DailyLog, mealType: MealType): MealEntry[] {
  return log.meals.filter((m) => m.mealType === mealType);
}

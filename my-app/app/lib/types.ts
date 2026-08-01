// ============================================================
// CalPal — Type Definitions
// All data interfaces used across the app.
// Designed for easy backend migration: each entity has an `id`
// and timestamps, matching typical REST/DB patterns.
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  dailyCalorieGoal: number; // auto-calculated from BMR + activity
  createdAt: string; // ISO date
}

export type ActivityLevel =
  | 'sedentary'       // little or no exercise
  | 'light'           // exercise 1-3 times/week
  | 'moderate'        // exercise 4-5 times/week
  | 'active'          // daily exercise or intense 3-4 times/week
  | 'very_active'     // intense exercise 6-7 times/week
  | 'extra_active';   // very intense daily or physical job

export interface FoodItem {
  id: string;
  name: string;
  calories: number; // kcal per serving
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  servingSize?: string; // e.g. "1 medium", "100g"
  imageUrl?: string;
  category?: string; // e.g. "fruit", "grain", "meat"
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number; // number of servings
  mealType: MealType;
  addedAt: string;  // ISO date-time
}

export interface DailyLog {
  date: string; // ISO date (YYYY-MM-DD)
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface BMRResult {
  bmr: number;
  tdee: number; // Total Daily Energy Expenditure
  bmi: number;
  bmiCategory: string;
}

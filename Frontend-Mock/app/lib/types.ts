// ============================================================
// CalPal — Type Definitions
// All data interfaces used across the app.
// Designed for easy backend migration: each entity has an `id`
// and timestamps, matching typical REST/DB patterns.
// ============================================================



// ----------- profile-setup ---------------------------
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

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface BMRResult {
  bmr: number;
  tdee: number; // Total Daily Energy Expenditure
  bmi: number;
  bmiCategory: string;
}

// For profile setup
export type Gender = 'male' | 'female';
export type Step = 1 | 2 | 3;

export interface PersonalInfo {
  gender: Gender | null;
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
}

export interface ActivityCard {
  level: ActivityLevel;
  emoji: string;
  title: string;
  subtitle: string;
  detail: string;
}

export interface ProfilePayload {
  userId: string | null | undefined;
  gender: Gender;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalMode: string;
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategory: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

// --------- Dashboard ---------------------
export interface DashboardFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  quantity: number;
}

export interface MealCategoryData {
  type: MealType;
  label: string;
  emoji: string;
  items: DashboardFoodItem[];
}

export interface DashboardSummary {
  date: string;
  isToday: boolean;
  calorieGoal: number;
  calorieConsumed: number;
  calorieRemaining: number;
  proteinGoal: number;
  proteinConsumed: number;
  carbsGoal: number;
  carbsConsumed: number;
  fatGoal: number;
  fatConsumed: number;
  meals: Record<MealType, MealCategoryData>;
}

export interface HealthTip {
  id: string;
  title: string;
  category: string;
  tagColor: string;
  detail: string;
  imageUrl: string;
  readTime: string;
}

// ============================================================
// 1. Food Search & FatSecret API Types
// ============================================================

export interface FatSecretSearchResultItem {
  food_id: string;
  food_name: string;
  food_type: string;
  food_description: string;
  food_url?: string;
  brand_name?: string;
}

export interface FatSecretSearchResponse {
  foods: FatSecretSearchResultItem[];
  max_results: number;
  page_number: number;
  total_results: number;
}

export interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  measurement_description?: string;
  number_of_units?: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  saturated_fat?: string;
  polyunsaturated_fat?: string;
  monounsaturated_fat?: string;
  cholesterol?: string;
  sodium?: string;
  potassium?: string;
  fiber?: string;
  sugar?: string;
  vitamin_a?: string;
  vitamin_c?: string;
  calcium?: string;
  iron?: string;
}

export interface FatSecretFoodDetail {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url?: string;
  brand_name?: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

// ============================================================
// 2. Custom User Food Types
// ============================================================

export interface CustomFoodInput {
  foodName: string;
  caloriesPerServing: number;
  servingSize: number;
  servingUnit: string;
  protein: number;
  fat: number;
  carbs: number;
  category?: string;
  imageUrl?: string;
}

export interface CustomFoodItem {
  foodId: string;
  foodName: string;
  caloriesPerServing: number;
  servingSize: number;
  servingUnit: string;
  protein: number;
  fat: number;
  carbs: number;
  category?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 3. Food Diary Log Payloads
// ============================================================

export interface CreateFoodLogPayload {
  userId: string;
  foodId?: string;
  fatsecretFoodId?: string;
  fatsecretServingId?: string;
  quantity: number;
  totalCalories?: number;
  totalProtein?: number;
  totalFat?: number;
  totalCarbs?: number;
  mealType: MealType | string;
}



export interface FoodLogRecord {
  foodLogId: string;
  userId: string;
  foodId?: string | null;
  fatsecretFoodId?: string | null;
  fatsecretServingId?: string | null;
  quantity: number;
  totalCalories?: number | null;
  totalProtein?: number | null;
  totalFat?: number | null;
  totalCarbs?: number | null;
  mealType: MealType;
  createdAt: string;
  updatedAt: string;
  food?: CustomFoodItem | null;
}

// ============================================================
// 4. AI Food Analysis Types
// ============================================================

export interface AIParsedFoodItem {
  foodName: string;
  quantity: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidenceScore?: number;
}

export interface AIAnalysisResult {
  rawPrompt: string;
  foodName: string;
  thinking: string;
  confidenceScore: number;
  foods: FatSecretSearchResultItem[];
  totalResults: number;
}

// ============================================================
// 5. Admin Dashboard Types
// ============================================================

export type UserRole = 'admin' | 'user';

export interface AdminUserGoals {
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  goalMode: string | null;
  activityLevel: string | null;
  bmi: number | null;
  bmiCategory: string | null;
  bmr: number | null;
  tdee: number | null;
  weightKg: number | null;
  heightCm: number | null;
  gender: string | null;
}

export interface AdminUserSummary {
  userId: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role: UserRole;
  createdAt: string;
  lastSignInAt?: string | null;
  goals: AdminUserGoals | null;
}

export interface AdminUserStats {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  profilesCompleted: number;
}





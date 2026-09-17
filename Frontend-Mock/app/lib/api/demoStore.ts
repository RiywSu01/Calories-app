import {
  ActivityLevel,
  AIAnalysisResult,
  CreateFoodLogPayload,
  CustomFoodInput,
  CustomFoodItem,
  FatSecretFoodDetail,
  FatSecretSearchResponse,
  FoodLogRecord,
  ProfilePayload,
} from '@/app/lib/types';
import { formatDateKey } from './dashboard';

// Key prefixes for localStorage persistence
const STORAGE_PREFIX = 'calpal_mock_';

export function isDemoMode(): boolean {
  // In Frontend-Mock, we are mock-first by default!
  if (typeof window === 'undefined') return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') return false;
  return true;
}

// ─── Curated Seed Foods for Instant Rich Search ───
const SEED_FOODS: Array<FatSecretFoodDetail & { searchTerms: string[] }> = [
  {
    food_id: 'demo-1',
    food_name: 'Avocado Toast with Poached Egg',
    food_type: 'Generic',
    searchTerms: ['avocado', 'toast', 'egg', 'breakfast', 'bread'],
    servings: {
      serving: [
        {
          serving_id: 'srv-1',
          serving_description: '1 slice (120g)',
          metric_serving_amount: '120',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'slice',
          calories: '290',
          carbohydrate: '22',
          protein: '11',
          fat: '18',
          saturated_fat: '3.5',
          polyunsaturated_fat: '2.5',
          monounsaturated_fat: '10',
          cholesterol: '185',
          sodium: '320',
          potassium: '450',
          fiber: '7',
          sugar: '2',
        },
      ],
    },
  },
  {
    food_id: 'demo-2',
    food_name: 'Grilled Salmon Fillet',
    food_type: 'Generic',
    searchTerms: ['salmon', 'fish', 'grilled', 'seafood', 'protein'],
    servings: {
      serving: [
        {
          serving_id: 'srv-2',
          serving_description: '1 fillet (180g)',
          metric_serving_amount: '180',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'fillet',
          calories: '360',
          carbohydrate: '0',
          protein: '39',
          fat: '22',
          saturated_fat: '4.5',
          polyunsaturated_fat: '6.5',
          monounsaturated_fat: '8',
          cholesterol: '110',
          sodium: '120',
          potassium: '820',
          fiber: '0',
          sugar: '0',
        },
      ],
    },
  },
  {
    food_id: 'demo-3',
    food_name: 'Grilled Chicken Breast',
    food_type: 'Generic',
    searchTerms: ['chicken', 'breast', 'grilled', 'poultry', 'protein'],
    servings: {
      serving: [
        {
          serving_id: 'srv-3',
          serving_description: '1 breast (150g)',
          metric_serving_amount: '150',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'breast',
          calories: '248',
          carbohydrate: '0',
          protein: '46',
          fat: '5.4',
          saturated_fat: '1.5',
          polyunsaturated_fat: '1.1',
          monounsaturated_fat: '1.8',
          cholesterol: '135',
          sodium: '110',
          potassium: '580',
          fiber: '0',
          sugar: '0',
        },
      ],
    },
  },
  {
    food_id: 'demo-4',
    food_name: 'Greek Yogurt 0% Fat',
    food_type: 'Generic',
    searchTerms: ['yogurt', 'greek', 'dairy', 'snack', 'protein'],
    servings: {
      serving: [
        {
          serving_id: 'srv-4',
          serving_description: '1 cup (200g)',
          metric_serving_amount: '200',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'cup',
          calories: '130',
          carbohydrate: '7',
          protein: '22',
          fat: '0',
          saturated_fat: '0',
          polyunsaturated_fat: '0',
          monounsaturated_fat: '0',
          cholesterol: '10',
          sodium: '70',
          potassium: '300',
          fiber: '0',
          sugar: '6',
        },
      ],
    },
  },
  {
    food_id: 'demo-5',
    food_name: 'Rolled Oats with Berries',
    food_type: 'Generic',
    searchTerms: ['oats', 'oatmeal', 'berries', 'breakfast', 'cereal'],
    servings: {
      serving: [
        {
          serving_id: 'srv-5',
          serving_description: '1 bowl (60g dry oats + berries)',
          metric_serving_amount: '220',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'bowl',
          calories: '280',
          carbohydrate: '52',
          protein: '9',
          fat: '4.5',
          saturated_fat: '0.8',
          polyunsaturated_fat: '1.6',
          monounsaturated_fat: '1.5',
          cholesterol: '0',
          sodium: '5',
          potassium: '320',
          fiber: '8',
          sugar: '9',
        },
      ],
    },
  },
  {
    food_id: 'demo-6',
    food_name: 'Steamed Jasmine Rice',
    food_type: 'Generic',
    searchTerms: ['rice', 'jasmine', 'grain', 'carbs'],
    servings: {
      serving: [
        {
          serving_id: 'srv-6',
          serving_description: '1 cup cooked (160g)',
          metric_serving_amount: '160',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'cup',
          calories: '210',
          carbohydrate: '45',
          protein: '4.2',
          fat: '0.5',
          saturated_fat: '0.1',
          polyunsaturated_fat: '0.1',
          monounsaturated_fat: '0.1',
          cholesterol: '0',
          sodium: '2',
          potassium: '55',
          fiber: '1',
          sugar: '0',
        },
      ],
    },
  },
  {
    food_id: 'demo-7',
    food_name: 'Mixed Garden Salad with Olive Oil',
    food_type: 'Generic',
    searchTerms: ['salad', 'greens', 'vegetable', 'lunch', 'olive oil'],
    servings: {
      serving: [
        {
          serving_id: 'srv-7',
          serving_description: '1 bowl (150g)',
          metric_serving_amount: '150',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'bowl',
          calories: '165',
          carbohydrate: '8',
          protein: '2.5',
          fat: '14',
          saturated_fat: '2',
          polyunsaturated_fat: '1.5',
          monounsaturated_fat: '10',
          cholesterol: '0',
          sodium: '90',
          potassium: '340',
          fiber: '3.5',
          sugar: '3',
        },
      ],
    },
  },
  {
    food_id: 'demo-8',
    food_name: 'Whey Protein Shake (Vanilla)',
    food_type: 'Generic',
    searchTerms: ['whey', 'protein', 'shake', 'supplement', 'powder'],
    servings: {
      serving: [
        {
          serving_id: 'srv-8',
          serving_description: '1 scoop (32g with water)',
          metric_serving_amount: '300',
          metric_serving_unit: 'ml',
          number_of_units: '1',
          measurement_description: 'shake',
          calories: '130',
          carbohydrate: '3',
          protein: '25',
          fat: '1.5',
          saturated_fat: '0.5',
          polyunsaturated_fat: '0.2',
          monounsaturated_fat: '0.3',
          cholesterol: '45',
          sodium: '140',
          potassium: '160',
          fiber: '1',
          sugar: '1.5',
        },
      ],
    },
  },
  {
    food_id: 'demo-9',
    food_name: 'Fresh Banana',
    food_type: 'Generic',
    searchTerms: ['banana', 'fruit', 'snack', 'potassium'],
    servings: {
      serving: [
        {
          serving_id: 'srv-9',
          serving_description: '1 medium (118g)',
          metric_serving_amount: '118',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'medium',
          calories: '105',
          carbohydrate: '27',
          protein: '1.3',
          fat: '0.3',
          saturated_fat: '0.1',
          polyunsaturated_fat: '0.1',
          monounsaturated_fat: '0',
          cholesterol: '0',
          sodium: '1',
          potassium: '422',
          fiber: '3.1',
          sugar: '14',
        },
      ],
    },
  },
  {
    food_id: 'demo-10',
    food_name: 'Scrambled Eggs (2 Large)',
    food_type: 'Generic',
    searchTerms: ['egg', 'eggs', 'scrambled', 'breakfast'],
    servings: {
      serving: [
        {
          serving_id: 'srv-10',
          serving_description: '2 large eggs (100g)',
          metric_serving_amount: '100',
          metric_serving_unit: 'g',
          number_of_units: '1',
          measurement_description: 'serving',
          calories: '180',
          carbohydrate: '1.5',
          protein: '12.5',
          fat: '13',
          saturated_fat: '3.8',
          polyunsaturated_fat: '2.1',
          monounsaturated_fat: '5.2',
          cholesterol: '370',
          sodium: '170',
          potassium: '150',
          fiber: '0',
          sugar: '1',
        },
      ],
    },
  },
];

// Helper to safely read from localStorage
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Helper to safely write to localStorage
function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

// ─── Initial Demo Seed Data ───
export function getInitialDemoLogs(dateStr: string): any[] {
  return [
    {
      foodLogId: 'log-seed-1',
      date: dateStr,
      mealType: 'BREAKFAST',
      quantity: 1,
      totalCalories: 290,
      totalProtein: 11,
      totalCarbs: 22,
      totalFat: 18,
      food: {
        foodName: 'Avocado Toast with Poached Egg',
        caloriesPerServing: 290,
        protein: 11,
        carbs: 22,
        fat: 18,
        servingSize: 1,
        servingUnit: 'slice',
      },
    },
    {
      foodLogId: 'log-seed-2',
      date: dateStr,
      mealType: 'LUNCH',
      quantity: 1,
      totalCalories: 360,
      totalProtein: 39,
      totalCarbs: 0,
      totalFat: 22,
      food: {
        foodName: 'Grilled Salmon Fillet',
        caloriesPerServing: 360,
        protein: 39,
        carbs: 0,
        fat: 22,
        servingSize: 1,
        servingUnit: 'fillet',
      },
    },
    {
      foodLogId: 'log-seed-3',
      date: dateStr,
      mealType: 'LUNCH',
      quantity: 1,
      totalCalories: 210,
      totalProtein: 4.2,
      totalCarbs: 45,
      totalFat: 0.5,
      food: {
        foodName: 'Steamed Jasmine Rice',
        caloriesPerServing: 210,
        protein: 4.2,
        carbs: 45,
        fat: 0.5,
        servingSize: 1,
        servingUnit: 'cup',
      },
    },
  ];
}

// ─── Demo Store API Implementation ───
export const demoStore = {
  // 1. Profile Management
  getProfile(userId: string): ProfilePayload | null {
    const key = `profile_${userId}`;
    const stored = getStorage<ProfilePayload | null>(key, null);
    if (stored) return stored;

    // Default mock profile
    return {
      userId,
      gender: 'female',
      dateOfBirth: '1998-05-15',
      heightCm: 165,
      weightKg: 58,
      activityLevel: 'moderate' as ActivityLevel,
      goalMode: 'maintain',
      bmr: 1360,
      tdee: 2108,
      bmi: 21.3,
      bmiCategory: 'Normal weight',
      targetCalories: 2100,
      targetProtein: 140,
      targetFat: 65,
      targetCarbs: 240,
    };
  },

  hasProfile(userId: string): boolean {
    const key = `profile_${userId}`;
    return getStorage<ProfilePayload | null>(key, null) !== null;
  },

  saveProfile(payload: ProfilePayload): void {
    const key = `profile_${payload.userId}`;
    setStorage(key, payload);
  },

  // 2. Food Logs Management
  getLogs(dateStr: string, userId?: string | null): any[] {
    const key = `logs_${userId || 'guest'}_${dateStr}`;
    const stored = getStorage<any[] | null>(key, null);
    if (stored !== null) return stored;

    // First time for today? Provide rich initial seed meals
    const today = formatDateKey(new Date());
    if (dateStr === today) {
      const initial = getInitialDemoLogs(dateStr);
      setStorage(key, initial);
      return initial;
    }
    return [];
  },

  addLog(payload: CreateFoodLogPayload, userId?: string | null): FoodLogRecord {
    const todayStr = formatDateKey(new Date());
    const key = `logs_${userId || 'guest'}_${todayStr}`;
    const current = demoStore.getLogs(todayStr, userId);

    const qty = payload.quantity || 1;
    const calories = payload.totalCalories ?? 250;
    const protein = payload.totalProtein ?? 15;
    const carbs = payload.totalCarbs ?? 25;
    const fat = payload.totalFat ?? 8;

    let foodName = 'Nutritious Food Item';
    if (payload.fatsecretFoodId) {
      const match = SEED_FOODS.find((f) => f.food_id === payload.fatsecretFoodId);
      if (match) foodName = match.food_name;
    }

    const newLogId = 'demo-log-' + Date.now();
    const newRecord: any = {
      foodLogId: newLogId,
      date: todayStr,
      mealType: payload.mealType,
      quantity: qty,
      totalCalories: calories,
      totalProtein: protein,
      totalCarbs: carbs,
      totalFat: fat,
      food: {
        foodName: foodName,
        caloriesPerServing: Math.round(calories / qty),
        protein: Number((protein / qty).toFixed(1)),
        carbs: Number((carbs / qty).toFixed(1)),
        fat: Number((fat / qty).toFixed(1)),
        servingSize: 1,
        servingUnit: 'serving',
      },
    };

    setStorage(key, [newRecord, ...current]);
    return newRecord;
  },

  deleteLog(foodLogId: string, userId?: string | null): void {
    const todayStr = formatDateKey(new Date());
    const key = `logs_${userId || 'guest'}_${todayStr}`;
    const current = demoStore.getLogs(todayStr, userId);
    const filtered = current.filter((item) => (item.foodLogId || item.id) !== foodLogId);
    setStorage(key, filtered);
  },

  // 3. FatSecret Food Catalog Search
  searchFoods(query: string, page: number = 0, maxResults: number = 20): FatSecretSearchResponse {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      return { foods: [], max_results: maxResults, page_number: page, total_results: 0 };
    }

    const matches = SEED_FOODS.filter((food) => {
      if (food.food_name.toLowerCase().includes(cleanQuery)) return true;
      return food.searchTerms.some((term) => term.includes(cleanQuery));
    });

    const start = page * maxResults;
    const paginated = matches.slice(start, start + maxResults).map((food) => {
      const s = Array.isArray(food.servings.serving) ? food.servings.serving[0] : food.servings.serving;
      return {
        food_id: food.food_id,
        food_name: food.food_name,
        food_type: food.food_type,
        food_url: '',
        food_description: `Per ${s.serving_description} - Calories: ${s.calories}kcal | Fat: ${s.fat}g | Carbs: ${s.carbohydrate}g | Protein: ${s.protein}g`,
      };
    });

    return {
      foods: paginated,
      max_results: maxResults,
      page_number: page,
      total_results: matches.length,
    };
  },

  getFoodDetail(foodId: string): FatSecretFoodDetail {
    const match = SEED_FOODS.find((f) => f.food_id === foodId);
    if (match) return match;

    // Generic fallback if user clicked custom or arbitrary ID
    return {
      food_id: foodId,
      food_name: 'Nutritious Food Item',
      food_type: 'Generic',
      servings: {
        serving: [
          {
            serving_id: 'srv-gen',
            serving_description: '1 standard serving (100g)',
            calories: '150',
            carbohydrate: '15',
            protein: '8',
            fat: '4',
          },
        ],
      },
    };
  },

  // 4. Custom Foods Management
  getCustomFoods(userId?: string | null): CustomFoodItem[] {
    const key = `custom_foods_${userId || 'guest'}`;
    const custom = getStorage<CustomFoodItem[]>(key, []);
    return custom;
  },

  createCustomFood(payload: CustomFoodInput, userId?: string | null): CustomFoodItem {
    const key = `custom_foods_${userId || 'guest'}`;
    const current = demoStore.getCustomFoods(userId);
    const newFood: CustomFoodItem = {
      foodId: 'custom-' + Date.now(),
      foodName: payload.foodName,
      caloriesPerServing: payload.caloriesPerServing,
      servingSize: payload.servingSize,
      servingUnit: payload.servingUnit,
      protein: payload.protein,
      fat: payload.fat,
      carbs: payload.carbs,
      category: payload.category || 'Homemade',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStorage(key, [newFood, ...current]);
    return newFood;
  },

  // 5. AI Food Analysis Simulation (Gemini Flash Multimodal Mock)
  analyzeFoodWithAI(payload: { prompt?: string; imageBase64?: string }): AIAnalysisResult {
    const promptText = (payload.prompt || '').toLowerCase();

    let detectedName = 'Avocado Toast with Poached Egg';
    let thinking =
      'Zero-Storage Vision AI analyzed meal image: Sourdough toast, sliced creamy avocado, and poached egg. High micronutrient and protein density.';
    let confidence = 0.95;

    if (promptText.includes('egg') || promptText.includes('breakfast')) {
      detectedName = 'Avocado Toast with Poached Egg';
      thinking =
        'Detected toasted artisan sourdough topped with mashed seasoned Hass avocado and two organic soft-poached eggs with chili flakes.';
      confidence = 0.96;
    } else if (promptText.includes('salmon') || promptText.includes('fish')) {
      detectedName = 'Grilled Salmon Fillet';
      thinking =
        'Identified wild Atlantic salmon fillet with visible grill char marks, rich omega-3 fatty acids, and steamed vegetables.';
      confidence = 0.94;
    } else if (promptText.includes('chicken') || promptText.includes('salad')) {
      detectedName = 'Grilled Chicken Breast';
      thinking =
        'Identified lean roasted chicken breast sliced over crisp romaine greens with virgin olive oil drizzle.';
      confidence = 0.92;
    }

    const searchRes = demoStore.searchFoods(detectedName);

    return {
      rawPrompt: payload.prompt || 'Uploaded Food Photo',
      foodName: detectedName,
      thinking,
      confidenceScore: confidence,
      foods: searchRes.foods,
      totalResults: searchRes.total_results,
    };
  },
};

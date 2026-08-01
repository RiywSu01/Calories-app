// ============================================================
// CalPal — Built-in Food Database
// ~50 common foods with nutritional data per serving.
// This will eventually be replaced by backend API calls.
// ============================================================

import { FoodItem } from './types';

export const FOOD_DATABASE: FoodItem[] = [
  // ── Fruits ──
  { id: 'f1',  name: 'Apple',         calories: 95,  protein: 0.5, carbs: 25,  fat: 0.3, servingSize: '1 medium',  category: 'fruit' },
  { id: 'f2',  name: 'Banana',        calories: 105, protein: 1.3, carbs: 27,  fat: 0.4, servingSize: '1 medium',  category: 'fruit' },
  { id: 'f3',  name: 'Orange',        calories: 62,  protein: 1.2, carbs: 15,  fat: 0.2, servingSize: '1 medium',  category: 'fruit' },
  { id: 'f4',  name: 'Strawberries',  calories: 49,  protein: 1.0, carbs: 12,  fat: 0.5, servingSize: '1 cup',     category: 'fruit' },
  { id: 'f5',  name: 'Grapes',        calories: 104, protein: 1.1, carbs: 27,  fat: 0.2, servingSize: '1 cup',     category: 'fruit' },
  { id: 'f6',  name: 'Watermelon',    calories: 86,  protein: 1.7, carbs: 22,  fat: 0.4, servingSize: '2 cups',    category: 'fruit' },
  { id: 'f7',  name: 'Mango',         calories: 99,  protein: 1.4, carbs: 25,  fat: 0.6, servingSize: '1 cup',     category: 'fruit' },
  { id: 'f8',  name: 'Blueberries',   calories: 84,  protein: 1.1, carbs: 21,  fat: 0.5, servingSize: '1 cup',     category: 'fruit' },

  // ── Vegetables ──
  { id: 'v1',  name: 'Broccoli',      calories: 55,  protein: 3.7, carbs: 11,  fat: 0.6, servingSize: '1 cup',     category: 'vegetable' },
  { id: 'v2',  name: 'Carrot',        calories: 25,  protein: 0.6, carbs: 6,   fat: 0.1, servingSize: '1 medium',  category: 'vegetable' },
  { id: 'v3',  name: 'Spinach',       calories: 7,   protein: 0.9, carbs: 1.1, fat: 0.1, servingSize: '1 cup raw', category: 'vegetable' },
  { id: 'v4',  name: 'Sweet Potato',  calories: 103, protein: 2.3, carbs: 24,  fat: 0.1, servingSize: '1 medium',  category: 'vegetable' },
  { id: 'v5',  name: 'Tomato',        calories: 22,  protein: 1.1, carbs: 4.8, fat: 0.2, servingSize: '1 medium',  category: 'vegetable' },

  // ── Grains & Bread ──
  { id: 'g1',  name: 'White Rice',       calories: 206, protein: 4.3, carbs: 45,  fat: 0.4, servingSize: '1 cup cooked', category: 'grain' },
  { id: 'g2',  name: 'Brown Rice',       calories: 216, protein: 5.0, carbs: 45,  fat: 1.8, servingSize: '1 cup cooked', category: 'grain' },
  { id: 'g3',  name: 'Bread (White)',     calories: 79,  protein: 2.7, carbs: 15,  fat: 1.0, servingSize: '1 slice',     category: 'grain' },
  { id: 'g4',  name: 'Bread (Whole Wheat)', calories: 81, protein: 4.0, carbs: 14, fat: 1.1, servingSize: '1 slice',    category: 'grain' },
  { id: 'g5',  name: 'Oatmeal',          calories: 154, protein: 5.0, carbs: 27,  fat: 2.6, servingSize: '1 cup cooked', category: 'grain' },
  { id: 'g6',  name: 'Pasta',            calories: 220, protein: 8.1, carbs: 43,  fat: 1.3, servingSize: '1 cup cooked', category: 'grain' },

  // ── Protein ──
  { id: 'p1',  name: 'Chicken Breast',    calories: 165, protein: 31,  carbs: 0,   fat: 3.6, servingSize: '100g',        category: 'protein' },
  { id: 'p2',  name: 'Salmon',            calories: 208, protein: 20,  carbs: 0,   fat: 13,  servingSize: '100g',        category: 'protein' },
  { id: 'p3',  name: 'Egg',               calories: 78,  protein: 6.3, carbs: 0.6, fat: 5.3, servingSize: '1 large',    category: 'protein' },
  { id: 'p4',  name: 'Ground Beef',       calories: 250, protein: 26,  carbs: 0,   fat: 15,  servingSize: '100g',        category: 'protein' },
  { id: 'p5',  name: 'Tuna (Canned)',     calories: 116, protein: 26,  carbs: 0,   fat: 0.8, servingSize: '100g',        category: 'protein' },
  { id: 'p6',  name: 'Tofu',              calories: 76,  protein: 8.0, carbs: 1.9, fat: 4.8, servingSize: '100g',        category: 'protein' },
  { id: 'p7',  name: 'Shrimp',            calories: 85,  protein: 20,  carbs: 0.2, fat: 0.5, servingSize: '100g',        category: 'protein' },
  { id: 'p8',  name: 'Pork Chop',         calories: 231, protein: 25,  carbs: 0,   fat: 14,  servingSize: '100g',        category: 'protein' },

  // ── Dairy ──
  { id: 'd1',  name: 'Milk (Whole)',      calories: 149, protein: 8.0, carbs: 12,  fat: 8.0, servingSize: '1 cup',      category: 'dairy' },
  { id: 'd2',  name: 'Milk (Skim)',       calories: 83,  protein: 8.3, carbs: 12,  fat: 0.2, servingSize: '1 cup',      category: 'dairy' },
  { id: 'd3',  name: 'Greek Yogurt',      calories: 100, protein: 17,  carbs: 6,   fat: 0.7, servingSize: '170g',       category: 'dairy' },
  { id: 'd4',  name: 'Cheddar Cheese',    calories: 113, protein: 7.0, carbs: 0.4, fat: 9.3, servingSize: '1 oz',       category: 'dairy' },
  { id: 'd5',  name: 'Cottage Cheese',    calories: 206, protein: 28,  carbs: 6.2, fat: 9.0, servingSize: '1 cup',      category: 'dairy' },

  // ── Snacks & Others ──
  { id: 's1',  name: 'Almonds',           calories: 164, protein: 6.0, carbs: 6,   fat: 14,  servingSize: '1 oz (23 nuts)', category: 'snack' },
  { id: 's2',  name: 'Peanut Butter',     calories: 188, protein: 8.0, carbs: 6,   fat: 16,  servingSize: '2 tbsp',     category: 'snack' },
  { id: 's3',  name: 'Granola Bar',       calories: 190, protein: 3.0, carbs: 29,  fat: 7.0, servingSize: '1 bar',      category: 'snack' },
  { id: 's4',  name: 'Dark Chocolate',    calories: 170, protein: 2.2, carbs: 13,  fat: 12,  servingSize: '1 oz',       category: 'snack' },
  { id: 's5',  name: 'Popcorn (Air-popped)', calories: 31, protein: 1.0, carbs: 6, fat: 0.4, servingSize: '1 cup',     category: 'snack' },
  { id: 's6',  name: 'Trail Mix',         calories: 260, protein: 8.0, carbs: 23,  fat: 17,  servingSize: '1/4 cup',    category: 'snack' },

  // ── Drinks ──
  { id: 'dr1', name: 'Orange Juice',      calories: 112, protein: 1.7, carbs: 26,  fat: 0.5, servingSize: '1 cup',      category: 'drink' },
  { id: 'dr2', name: 'Coffee (Black)',     calories: 2,   protein: 0.3, carbs: 0,   fat: 0,   servingSize: '1 cup',      category: 'drink' },
  { id: 'dr3', name: 'Green Tea',         calories: 0,   protein: 0,   carbs: 0,   fat: 0,   servingSize: '1 cup',      category: 'drink' },
  { id: 'dr4', name: 'Smoothie (Fruit)',   calories: 230, protein: 4.0, carbs: 54,  fat: 0.5, servingSize: '16 oz',     category: 'drink' },
  { id: 'dr5', name: 'Coca-Cola',         calories: 140, protein: 0,   carbs: 39,  fat: 0,   servingSize: '12 oz can',  category: 'drink' },

  // ── Meals / Fast Food ──
  { id: 'm1',  name: 'Caesar Salad',      calories: 360, protein: 14,  carbs: 18,  fat: 26,  servingSize: '1 bowl',     category: 'meal' },
  { id: 'm2',  name: 'Cheeseburger',      calories: 540, protein: 28,  carbs: 40,  fat: 29,  servingSize: '1 burger',   category: 'meal' },
  { id: 'm3',  name: 'Pizza Slice',       calories: 285, protein: 12,  carbs: 36,  fat: 10,  servingSize: '1 slice',    category: 'meal' },
  { id: 'm4',  name: 'Fried Rice',        calories: 238, protein: 5.5, carbs: 36,  fat: 8.5, servingSize: '1 cup',      category: 'meal' },
  { id: 'm5',  name: 'Chicken Wrap',      calories: 410, protein: 22,  carbs: 38,  fat: 18,  servingSize: '1 wrap',     category: 'meal' },
  { id: 'm6',  name: 'Sushi Roll',        calories: 255, protein: 9.0, carbs: 38,  fat: 7.0, servingSize: '6 pieces',   category: 'meal' },
  { id: 'm7',  name: 'Pad Thai',          calories: 400, protein: 16,  carbs: 48,  fat: 16,  servingSize: '1 plate',    category: 'meal' },
  { id: 'm8',  name: 'Pancakes',          calories: 450, protein: 10,  carbs: 60,  fat: 18,  servingSize: '3 pancakes', category: 'meal' },
];

/**
 * Search the food database by name (case-insensitive)
 */
export function searchFoods(query: string): FoodItem[] {
  if (!query.trim()) return FOOD_DATABASE;
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.filter((food) =>
    food.name.toLowerCase().includes(q)
  );
}

/**
 * Get a food item by ID
 */
export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_DATABASE.find((food) => food.id === id);
}

/**
 * Get foods by category
 */
export function getFoodsByCategory(category: string): FoodItem[] {
  return FOOD_DATABASE.filter((food) => food.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return [...new Set(FOOD_DATABASE.map((f) => f.category).filter(Boolean))] as string[];
}

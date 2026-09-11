// ============================================================
// CalPal — Macro Split Calculator
// Derives protein / fat / carb gram targets from a calorie goal
// Split: Protein 30%, Fat 25%, Carbs 45%
// Calories per gram: Protein=4, Fat=9, Carbs=4
// ============================================================

export type GoalMode = 'lose' | 'maintain' | 'gain';

/** kcal offset applied to TDEE based on chosen goal */
const GOAL_OFFSETS: Record<GoalMode, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export const GOAL_LABELS: Record<GoalMode, { label: string; emoji: string; description: string }> = {
  lose:     { label: 'Lose Weight',   emoji: '📉', description: '−500 kcal/day deficit' },
  maintain: { label: 'Maintain',      emoji: '⚖️',  description: 'Keep current weight'   },
  gain:     { label: 'Gain Muscle',   emoji: '📈', description: '+300 kcal/day surplus'  },
};

export interface MacroResult {
  targetCalories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

/**
 * Calculate macro targets from TDEE and goal mode.
 * @param tdee  — Total Daily Energy Expenditure (kcal)
 * @param goal  — 'lose' | 'maintain' | 'gain'
 */
export function calculateMacros(tdee: number, goal: GoalMode): MacroResult {
  const targetCalories = Math.max(1200, tdee + GOAL_OFFSETS[goal]);

  const proteinG = Math.round((targetCalories * 0.30) / 4);
  const fatG     = Math.round((targetCalories * 0.25) / 9);
  const carbsG   = Math.round((targetCalories * 0.45) / 4);

  return { targetCalories, proteinG, fatG, carbsG };
}

export { GOAL_OFFSETS };

'use client';

import React, { useState } from 'react';
import { CustomFoodItem, MealType } from '@/app/lib/types';
import { Plus, Flame, Sparkles, Loader2, Utensils } from 'lucide-react';
import MealTypeSelector from './MealTypeSelector';

interface CustomFoodListProps {
  foods: CustomFoodItem[];
  loading: boolean;
  selectedMeal: MealType;
  onMealChange: (meal: MealType) => void;
  onLogCustomFood: (food: CustomFoodItem, mealType: MealType, quantity: number) => Promise<void>;

  onCreateNewClick: () => void;
}

export default function CustomFoodList({
  foods,
  loading,
  selectedMeal,
  onMealChange,
  onLogCustomFood,
  onCreateNewClick,
}: CustomFoodListProps) {
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const handleLog = async (food: CustomFoodItem) => {
    setLoggingId(food.foodId);
    try {
      await onLogCustomFood(food, selectedMeal, 1);
    } finally {
      setLoggingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-mint" />
        <p className="text-sm font-medium">Loading your custom recipes & foods...</p>
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-lavender-light/40 text-lavender flex items-center justify-center mx-auto text-2xl">
          🍳
        </div>
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-text-primary">
            No Custom Foods Yet
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-sm mx-auto">
            You haven't created any custom homemade foods or recipes. Create your first one to log it anytime!
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNewClick}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-mint hover:bg-mint-dark text-text-on-dark font-extrabold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Custom Food</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-card p-3.5 rounded-2xl border border-border">
        <span className="text-xs font-bold text-text-secondary">
          Target Meal Category:
        </span>
        <MealTypeSelector
          selectedMeal={selectedMeal}
          onChange={onMealChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="grid gap-3">
        {foods.map((food) => {
          const isLogging = loggingId === food.foodId;
          return (
            <div
              key={food.foodId}
              className="p-4 bg-bg-card border border-border rounded-2xl hover:border-mint hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-text-primary truncate">
                    {food.foodName}
                  </h4>
                  <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-lavender-light/40 text-text-secondary border border-lavender/30">
                    {food.servingSize} {food.servingUnit}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {food.caloriesPerServing} kcal
                  </span>
                  <span>•</span>
                  <span>P: {food.protein}g</span>
                  <span>C: {food.carbs}g</span>
                  <span>F: {food.fat}g</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLogging}
                onClick={() => handleLog(food)}
                className="shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-mint hover:bg-mint-dark text-text-on-dark font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                aria-label={`Log ${food.foodName}`}
              >
                {isLogging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Log</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

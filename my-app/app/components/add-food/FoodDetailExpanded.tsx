'use client';

import React, { useEffect, useState } from 'react';
import {
  FatSecretFoodDetail,
  FatSecretServing,
  FatSecretSearchResultItem,
  MealType,
} from '@/app/lib/types';
import { getFatSecretFoodDetail } from '@/app/lib/api/foods';
import { ArrowLeft, Plus, Minus, Check, Flame, Loader2, Sparkles } from 'lucide-react';
import MealTypeSelector from './MealTypeSelector';
import FatSecretAttribution from '@/app/components/common/FatSecretAttribution';


interface FoodDetailExpandedProps {
  foodItem: FatSecretSearchResultItem;
  selectedMeal: MealType;
  onMealChange: (meal: MealType) => void;
  onBack: () => void;
  onLogFood: (payload: {
    fatsecretFoodId: string;
    fatsecretServingId: string;
    foodName: string;
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingUnit: string;
  }) => Promise<void>;
  token?: string | null;
}

export default function FoodDetailExpanded({
  foodItem,
  selectedMeal,
  onMealChange,
  onBack,
  onLogFood,
  token,
}: FoodDetailExpandedProps) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<FatSecretFoodDetail | null>(null);
  const [selectedServing, setSelectedServing] = useState<FatSecretServing | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFatSecretFoodDetail(foodItem.food_id, token);
        if (!isMounted) return;

        setDetail(data);

        // Normalize servings array
        const rawServings = data?.servings?.serving;
        const servingsList: FatSecretServing[] = Array.isArray(rawServings)
          ? rawServings
          : rawServings
          ? [rawServings]
          : [];

        if (servingsList.length > 0) {
          setSelectedServing(servingsList[0]);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load detailed servings');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [foodItem.food_id, token]);

  const servingsList: FatSecretServing[] = detail?.servings?.serving
    ? Array.isArray(detail.servings.serving)
      ? detail.servings.serving
      : [detail.servings.serving]
    : [];

  // Macro calculations with quantity multiplier
  const baseCalories = selectedServing ? parseFloat(selectedServing.calories) || 0 : 0;
  const baseProtein = selectedServing ? parseFloat(selectedServing.protein) || 0 : 0;
  const baseCarbs = selectedServing ? parseFloat(selectedServing.carbohydrate) || 0 : 0;
  const baseFat = selectedServing ? parseFloat(selectedServing.fat) || 0 : 0;

  const totalCalories = Math.round(baseCalories * quantity);
  const totalProtein = Number((baseProtein * quantity).toFixed(1));
  const totalCarbs = Number((baseCarbs * quantity).toFixed(1));
  const totalFat = Number((baseFat * quantity).toFixed(1));

  const handleLog = async () => {
    if (!selectedServing || submitting) return;
    setSubmitting(true);
    try {
      await onLogFood({
        fatsecretFoodId: foodItem.food_id,
        fatsecretServingId: selectedServing.serving_id,
        foodName: foodItem.food_name,
        quantity,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        servingUnit: selectedServing.serving_description || selectedServing.measurement_description || 'serving',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to log food entry');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-lg animate-in fade-in zoom-in-95 duration-200">
      {/* Top action header with Back to Results */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-xl bg-bg-input hover:bg-border transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search results</span>
        </button>

        {foodItem.brand_name && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-peach-light/40 text-text-secondary border border-peach/30">
            {foodItem.brand_name}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 className="w-8 h-8 animate-spin text-mint" />
          <p className="text-sm font-medium">Fetching verified nutrition facts...</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-sm text-red-500 font-semibold mb-3">{error}</p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold bg-bg-input rounded-xl hover:bg-border text-text-primary"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Food Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {foodItem.food_name}
            </h2>
            <p className="text-xs sm:text-sm text-text-tertiary mt-1">
              Select serving unit and quantity to log
            </p>
          </div>

          {/* Serving Unit Dropdown Selector */}
          {servingsList.length > 0 && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
                Serving Size & Portion
              </label>
              <select
                className="w-full p-3.5 bg-bg-input border border-border rounded-2xl text-sm font-bold text-text-primary focus:outline-none focus:border-mint transition-all"
                value={selectedServing?.serving_id || ''}
                onChange={(e) => {
                  const s = servingsList.find((item) => item.serving_id === e.target.value);
                  if (s) setSelectedServing(s);
                }}
              >
                {servingsList.map((serving) => (
                  <option key={serving.serving_id} value={serving.serving_id}>
                    {serving.serving_description} ({Math.round(parseFloat(serving.calories))} kcal)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between p-4 bg-bg-input rounded-2xl border border-border">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary block">
                Number of Servings
              </span>
              <span className="text-xs text-text-tertiary">
                Multiplier for selected portion
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(0.25, Number((prev - (prev <= 1 ? 0.25 : 1)).toFixed(2))))}
                className="w-9 h-9 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-primary hover:bg-border transition-all active:scale-95 shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                step="0.25"
                min="0.1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-14 text-center font-black text-base sm:text-lg bg-transparent text-text-primary focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setQuantity((prev) => Number((prev + (prev < 1 ? 0.25 : 1)).toFixed(2)))}
                className="w-9 h-9 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-primary hover:bg-border transition-all active:scale-95 shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Macro Nutrition Summary Cards */}
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2.5">
              Nutritional Breakdown
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {/* Calories */}
              <div className="p-3 bg-peach-light/30 border border-peach/30 rounded-2xl text-center">
                <span className="text-[10px] sm:text-xs font-bold text-text-secondary block">Calories</span>
                <span className="text-base sm:text-xl font-black text-amber-700 dark:text-amber-300 block mt-0.5">
                  {totalCalories}
                </span>
                <span className="text-[9px] text-text-tertiary">kcal</span>
              </div>

              {/* Protein */}
              <div className="p-3 bg-[#FFB5C2]/20 border border-[#FFB5C2]/30 rounded-2xl text-center">
                <span className="text-[10px] sm:text-xs font-bold text-text-secondary block">Protein</span>
                <span className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-300 block mt-0.5">
                  {totalProtein}g
                </span>
                <span className="text-[9px] text-text-tertiary">muscle</span>
              </div>

              {/* Carbs */}
              <div className="p-3 bg-[#A8D8EA]/25 border border-[#A8D8EA]/40 rounded-2xl text-center">
                <span className="text-[10px] sm:text-xs font-bold text-text-secondary block">Carbs</span>
                <span className="text-base sm:text-xl font-black text-sky-600 dark:text-sky-300 block mt-0.5">
                  {totalCarbs}g
                </span>
                <span className="text-[9px] text-text-tertiary">energy</span>
              </div>

              {/* Fat */}
              <div className="p-3 bg-[#FFE0A3]/25 border border-[#FFE0A3]/40 rounded-2xl text-center">
                <span className="text-[10px] sm:text-xs font-bold text-text-secondary block">Fat</span>
                <span className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                  {totalFat}g
                </span>
                <span className="text-[9px] text-text-tertiary">essential</span>
              </div>
            </div>
          </div>

          {/* Meal Type Picker */}
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
              Add to Meal Category
            </span>
            <MealTypeSelector selectedMeal={selectedMeal} onChange={onMealChange} />
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleLog}
            className="w-full py-4 px-6 rounded-2xl bg-mint hover:bg-mint-dark text-text-on-dark font-extrabold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging to {selectedMeal}...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add {totalCalories} kcal to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}</span>
              </>
            )}
          </button>

          {/* FatSecret Attribution & Medical Disclaimer */}
          <FatSecretAttribution variant="inline" className="mt-4" />
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { MealType, CustomFoodInput } from '@/app/lib/types';
import { AlertTriangle, Plus, Loader2, Sparkles } from 'lucide-react';
import MealTypeSelector from './MealTypeSelector';

interface CustomFoodFormProps {
  selectedMeal: MealType;
  onMealChange: (meal: MealType) => void;
  onSubmit: (foodData: CustomFoodInput, mealType: MealType) => Promise<void>;
  onCancel: () => void;
}

export default function CustomFoodForm({
  selectedMeal,
  onMealChange,
  onSubmit,
  onCancel,
}: CustomFoodFormProps) {
  const [foodName, setFoodName] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState('Custom Meal');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Please enter a food name.');
      return;
    }
    if (!calories || isNaN(Number(calories)) || Number(calories) < 0) {
      setError('Please enter valid calories per serving.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(
        {
          foodName: foodName.trim(),
          servingSize: Number(servingSize) || 100,
          servingUnit: servingUnit.trim() || 'g',
          caloriesPerServing: Math.round(Number(calories)),
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
          category: category.trim() || 'Custom',
        },
        selectedMeal
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create and log custom food');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* ⚠️ Warning Notice Box */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-amber-500/15 dark:bg-yellow-500 border-2 border-amber-500/40 flex items-start gap-3 shadow-2xs">
        <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-100 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm">
          <span className="font-black block text-amber-950 dark:text-amber-100 text-sm mb-0.5">
            Important Notice
          </span>
          <p className="text-amber-950 dark:text-amber-100 font-bold leading-relaxed">
            If you create this custom food, <span className="text-red-700 font-bold"> it cannot be deleted. </span> Please check your food name, portion sizes, and nutritional details carefully before adding.
          </p>
        </div>
      </div>


      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        {/* Food Name */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Food Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Homemade Chicken Fried Rice"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full p-3.5 bg-bg-input border border-border rounded-2xl text-sm font-semibold text-text-primary focus:outline-none focus:border-mint transition-all"
          />
        </div>

        {/* Serving Portion & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
              Serving Size
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              placeholder="100"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full p-3.5 bg-bg-input border border-border rounded-2xl text-sm font-semibold text-text-primary focus:outline-none focus:border-mint transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
              Serving Unit
            </label>
            <input
              type="text"
              placeholder="e.g. g, bowl, slice, oz"
              value={servingUnit}
              onChange={(e) => setServingUnit(e.target.value)}
              className="w-full p-3.5 bg-bg-input border border-border rounded-2xl text-sm font-semibold text-text-primary focus:outline-none focus:border-mint transition-all"
            />
          </div>
        </div>

        {/* Calories Per Serving */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Calories per Serving (kcal) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            placeholder="e.g. 350"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full p-3.5 bg-bg-input border border-border rounded-2xl text-sm font-bold text-text-primary focus:outline-none focus:border-mint transition-all"
          />
        </div>

        {/* Macros Breakdown */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Macronutrients (Optional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div>
              <span className="text-[11px] font-bold text-text-secondary block mb-1">Protein (g)</span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full p-3 bg-bg-input border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:border-[#FFB5C2] transition-all"
              />
            </div>

            {/* Carbs */}
            <div>
              <span className="text-[11px] font-bold text-text-secondary block mb-1">Carbs (g)</span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full p-3 bg-bg-input border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:border-[#A8D8EA] transition-all"
              />
            </div>

            {/* Fat */}
            <div>
              <span className="text-[11px] font-bold text-text-secondary block mb-1">Fat (g)</span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full p-3 bg-bg-input border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:border-[#FFE0A3] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Meal Type Selection */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2">
            Log to Meal Category
          </label>
          <MealTypeSelector selectedMeal={selectedMeal} onChange={onMealChange} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-bg-input hover:bg-border text-text-secondary hover:text-text-primary font-bold text-sm transition-all"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="flex-2 py-3.5 px-6 rounded-2xl bg-mint hover:bg-mint-dark text-text-on-dark font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving & Logging...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Create & Log Food</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { MealType } from '@/app/lib/types';
import { logFoodToMeal } from '@/app/lib/api/foods';
import AddFoodHeader from '@/app/components/add-food/AddFoodHeader';
import AIAnalyzeInput from '@/app/components/add-food/AIAnalyzeInput';
import FatSecretAttribution from '@/app/components/common/FatSecretAttribution';
import { CheckCircle2, AlertCircle } from 'lucide-react';


function AIAnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialMeal = (searchParams.get('meal') as MealType) || 'breakfast';

  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Handle logging a FatSecret food item
  const handleLogFatSecretFood = async (payload: {
    fatsecretFoodId: string;
    fatsecretServingId: string;
    foodName: string;
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingUnit: string;
  }) => {
    if (!user?.id) {
      setError('Please sign in to log meals.');
      return;
    }

    try {
      const token = await getToken();

      await logFoodToMeal(
        {
          userId: user.id,
          fatsecretFoodId: payload.fatsecretFoodId,
          fatsecretServingId: payload.fatsecretServingId,
          quantity: payload.quantity,
          mealType: selectedMeal,
          totalCalories: payload.calories,
          totalProtein: payload.protein,
          totalCarbs: payload.carbs,
          totalFat: payload.fat,
        },
        token
      );

      setSuccessToast(`Logged "${payload.foodName}" to ${selectedMeal}!`);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to log food to meal.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <AddFoodHeader
        title="AI Meal Vision"
        subtitle={`Visual recognition & verified FatSecret database • Adding to ${selectedMeal}`}
        backHref={`/add-food?date=${dateParam}&meal=${selectedMeal}`}
      />

      {/* Success Toast */}
      {successToast && (
        <div className="mb-4 p-4 rounded-2xl bg-mint-light/50 border border-mint text-mint-dark font-extrabold text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-mint-dark" />
          <span>{successToast}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Analyzer Component */}
      <AIAnalyzeInput
        selectedMeal={selectedMeal}
        onMealChange={setSelectedMeal}
        onLogFatSecretFood={handleLogFatSecretFood}
      />

      {/* FatSecret API Attribution & Medical Disclaimer */}
      <FatSecretAttribution variant="card" className="mt-6" />
    </div>
  );
}


export default function AIAnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-text-secondary text-sm font-semibold">
          Loading AI Analyzer...
        </div>
      }
    >
      <AIAnalyzeContent />
    </Suspense>
  );
}

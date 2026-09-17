'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { CustomFoodInput, CustomFoodItem, MealType } from '@/app/lib/types';
import {
  getCustomFoods,
  createCustomFood,
  logFoodToMeal,
} from '@/app/lib/api/foods';
import AddFoodHeader from '@/app/components/add-food/AddFoodHeader';
import CustomFoodForm from '@/app/components/add-food/CustomFoodForm';
import CustomFoodList from '@/app/components/add-food/CustomFoodList';
import { Plus, ListFilter, CheckCircle2, AlertCircle } from 'lucide-react';

type TabMode = 'create' | 'list';

function CustomizeFoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialMeal = (searchParams.get('meal') as MealType) || 'breakfast';

  const [activeTab, setActiveTab] = useState<TabMode>('create');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const [customFoods, setCustomFoods] = useState<CustomFoodItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch custom foods list
  const loadCustomFoods = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await getCustomFoods(token);
      setCustomFoods(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch custom foods');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCustomFoods();
  }, []);

  // Handle Creating New Custom Food and Immediately Logging it to today's diary
  const handleCreateCustomFood = async (
    foodData: CustomFoodInput,
    mealType: MealType
  ) => {
    if (!user?.id) {
      setError('Please sign in to create custom foods.');
      return;
    }

    const token = await getToken();

    // 1. Create custom food in PostgreSQL `foods` table
    const createdFood = await createCustomFood(foodData, token);

    // 2. Log this newly created custom food to today's `food_logs` table
    await logFoodToMeal(
      {
        userId: user.id,
        foodId: createdFood.foodId,
        quantity: 1,
        totalCalories: createdFood.caloriesPerServing,
        totalProtein: createdFood.protein,
        totalCarbs: createdFood.carbs,
        totalFat: createdFood.fat,
        mealType,
      },
      token
    );

    setSuccessToast(`Created "${createdFood.foodName}" and logged to ${mealType}!`);

    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  // Handle Logging an Existing Custom Food from the list
  const handleLogExistingCustomFood = async (
    food: CustomFoodItem,
    mealType: MealType,
    quantity: number = 1
  ) => {
    if (!user?.id) {
      setError('Please sign in to log meals.');
      return;
    }

    const token = await getToken();

    await logFoodToMeal(
      {
        userId: user.id,
        foodId: food.foodId,
        quantity,
        totalCalories: Math.round(food.caloriesPerServing * quantity),
        totalProtein: Number((food.protein * quantity).toFixed(1)),
        totalCarbs: Number((food.carbs * quantity).toFixed(1)),
        totalFat: Number((food.fat * quantity).toFixed(1)),
        mealType,
      },
      token
    );

    setSuccessToast(`Added ${food.foodName} to ${mealType}!`);

    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <AddFoodHeader
        title="Customize Foods"
        subtitle={`Create custom recipe or choose from saved • ${selectedMeal}`}
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

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-bg-card border border-border rounded-2xl mb-6 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'create'
              ? 'bg-lavender text-text-primary shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'
            }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create New Food</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('list');
            loadCustomFoods();
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'list'
              ? 'bg-lavender text-text-primary shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'
            }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>My Custom Foods ({customFoods.length})</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'create' ? (
        <CustomFoodForm
          selectedMeal={selectedMeal}
          onMealChange={setSelectedMeal}
          onSubmit={handleCreateCustomFood}
          onCancel={() => router.push(`/add-food?date=${dateParam}&meal=${selectedMeal}`)}
        />
      ) : (
        <CustomFoodList
          foods={customFoods}
          loading={loadingList}
          selectedMeal={selectedMeal}
          onMealChange={setSelectedMeal}
          onLogCustomFood={handleLogExistingCustomFood}
          onCreateNewClick={() => setActiveTab('create')}
        />
      )}
    </div>
  );
}

export default function CustomizeFoodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-text-secondary text-sm font-semibold">
          Loading Custom Foods...
        </div>
      }
    >
      <CustomizeFoodContent />
    </Suspense>
  );
}

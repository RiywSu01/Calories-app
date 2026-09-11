'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  FatSecretSearchResultItem,
  FatSecretSearchResponse,
  MealType,
} from '@/app/lib/types';
import { searchFatSecretFoods, logFoodToMeal } from '@/app/lib/api/foods';
import AddFoodHeader from '@/app/components/add-food/AddFoodHeader';
import FoodSearchResultCard from '@/app/components/add-food/FoodSearchResultCard';
import FoodDetailExpanded from '@/app/components/add-food/FoodDetailExpanded';
import FatSecretAttribution from '@/app/components/common/FatSecretAttribution';
import { Search, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';


function SearchFoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialMeal = (searchParams.get('meal') as MealType) || 'breakfast';

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<FatSecretSearchResponse | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const [selectedFood, setSelectedFood] = useState<FatSecretSearchResultItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Trigger search on Enter key or Search button click only (NOT keystroke)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || searching) return;

    setSearching(true);
    setError(null);
    setSelectedFood(null);

    try {
      const token = await getToken();
      const result = await searchFatSecretFoods(query.trim(), 0, 20, token);
      setSearchResponse(result);

      if (result.foods.length === 0) {
        setError(`No foods found matching "${query.trim()}". Try another keyword.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search foods from database');
    } finally {
      setSearching(false);
    }
  };

  // Log food to user's meal diary
  const handleLogFood = async (payload: {
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

    const token = await getToken();
    await logFoodToMeal(
      {
        userId: user.id,
        fatsecretFoodId: payload.fatsecretFoodId,
        fatsecretServingId: payload.fatsecretServingId,
        quantity: payload.quantity,
        totalCalories: payload.calories,
        totalProtein: payload.protein,
        totalCarbs: payload.carbs,
        totalFat: payload.fat,
        mealType: selectedMeal,
      },
      token
    );

    setSuccessToast(`Added ${payload.foodName} to ${selectedMeal}!`);

    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <AddFoodHeader
        title="Search Food"
        subtitle={`Search 1,000,000+ foods • Adding to ${selectedMeal}`}
        backHref={`/add-food?date=${dateParam}&meal=${selectedMeal}`}
      />

      {/* Success Toast */}
      {successToast && (
        <div className="mb-4 p-4 rounded-2xl bg-mint-light/50 border border-mint text-mint-dark font-extrabold text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-mint-dark" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Detail View Mode (When an item is clicked) */}
      {selectedFood ? (
        <FoodDetailExpanded
          foodItem={selectedFood}
          selectedMeal={selectedMeal}
          onMealChange={setSelectedMeal}
          onBack={() => setSelectedFood(null)}
          onLogFood={handleLogFood}
        />
      ) : (
        /* Search Input & Results Mode */
        <div className="space-y-5">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search food by name (e.g. Chicken Breast, Egg, Oatmeal)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 bg-bg-card border border-border rounded-2xl text-sm font-semibold text-text-primary focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all shadow-xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSearchResponse(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!query.trim() || searching}
              className="py-3.5 px-5 sm:px-6 rounded-2xl bg-mint hover:bg-mint-dark text-text-on-dark font-extrabold text-sm shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results List */}
          {searchResponse && searchResponse.foods.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                  Found {searchResponse.total_results || searchResponse.foods.length} Results
                </span>
                <span className="text-xs text-text-tertiary">
                  Click an item to view serving sizes & macros
                </span>
              </div>

              <div className="grid gap-2.5">
                {searchResponse.foods.map((item) => (
                  <FoodSearchResultCard
                    key={item.food_id}
                    item={item}
                    onSelect={(food) => setSelectedFood(food)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Initial State / Search Helper */}
          {!searchResponse && !searching && (
            <div className="bg-bg-card border border-border rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-mint-light/40 text-mint-dark flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <h3 className="font-extrabold text-base text-text-primary">
                Instant Nutritional Search
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                Type a food name above and press <strong>Search</strong> or <strong>Enter</strong> to explore calorie counts, verified portion options, and exact macro facts.
              </p>
            </div>
          )}

          {/* FatSecret API Attribution & Medical Disclaimer */}
          <FatSecretAttribution variant="card" className="mt-6" />
        </div>
      )}
    </div>
  );
}


export default function SearchFoodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-text-secondary text-sm font-semibold">
          Loading Search...
        </div>
      }
    >
      <SearchFoodContent />
    </Suspense>
  );
}

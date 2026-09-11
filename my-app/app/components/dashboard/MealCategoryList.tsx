'use client';

import { MealCategoryData } from '@/app/lib/types';
import { MealType } from '@/app/lib/types';
import MealCategoryCard from './MealCategoryCard';
import { UtensilsCrossed } from 'lucide-react';

interface MealCategoryListProps {
  meals: Record<MealType, MealCategoryData>;
  isToday: boolean;
  onDeleteItem?: (mealType: string, itemId: string) => void;
}

export default function MealCategoryList({
  meals,
  isToday,
  onDeleteItem,
}: MealCategoryListProps) {
  const mealOrder: MealType[] = ['breakfast', 'lunch', 'dinner'];

  const safeMeals: Record<MealType, MealCategoryData> = {
    breakfast: meals?.breakfast ?? {
      type: 'breakfast',
      label: 'Breakfast',
      emoji: '🌅',
      items: [],
    },
    lunch: meals?.lunch ?? {
      type: 'lunch',
      label: 'Lunch',
      emoji: '☀️',
      items: [],
    },
    dinner: meals?.dinner ?? {
      type: 'dinner',
      label: 'Dinner',
      emoji: '🌙',
      items: [],
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
              Meals & Nutrition Log
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Breakdown by breakfast, lunch, and dinner
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {mealOrder.map((type) => {
          const cat = safeMeals[type];
          if (!cat) return null;
          return (
            <MealCategoryCard
              key={type}
              category={cat}
              isToday={isToday}
              onDeleteItem={onDeleteItem}
              defaultOpen={cat.items.length > 0}
            />
          );
        })}
      </div>
    </div>
  );
}

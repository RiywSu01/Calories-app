'use client';

import React from 'react';
import { FatSecretSearchResultItem } from '@/app/lib/types';
import { ChevronRight, Flame } from 'lucide-react';

interface FoodSearchResultCardProps {
  item: FatSecretSearchResultItem;
  onSelect: (item: FatSecretSearchResultItem) => void;
}

export default function FoodSearchResultCard({
  item,
  onSelect,
}: FoodSearchResultCardProps) {
  // Parse calories from food_description string if available
  // e.g. "Per 100g - Calories: 165kcal | Fat: 3.60g | Carbs: 0.00g | Protein: 31.00g"
  const caloriesMatch = item.food_description?.match(/Calories:\s*(\d+)kcal/i);
  const calories = caloriesMatch ? caloriesMatch[1] : null;

  return (
    <div
      onClick={() => onSelect(item)}
      className="flex items-center justify-between p-4 bg-bg-card border border-border rounded-2xl hover:border-mint hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
    >
      <div className="flex-1 pr-3 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-extrabold text-sm sm:text-base text-text-primary group-hover:text-mint-dark dark:group-hover:text-mint transition-colors truncate">
            {item.food_name}
          </h3>
          {item.brand_name && (
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-peach-light/50 text-text-secondary border border-peach/30">
              {item.brand_name}
            </span>
          )}
          {item.food_type && item.food_type !== 'Generic' && !item.brand_name && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg-input text-text-tertiary">
              {item.food_type}
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary line-clamp-1">
          {item.food_description}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {calories && (
          <div className="flex items-center gap-1 text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span>{calories} kcal</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-xl bg-bg-input flex items-center justify-center text-text-tertiary group-hover:bg-mint group-hover:text-text-on-dark transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

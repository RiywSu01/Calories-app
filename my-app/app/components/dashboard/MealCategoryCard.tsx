'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronDown, Trash2, Utensils } from 'lucide-react';
import { MealCategoryData } from '@/app/lib/types';

interface MealCategoryCardProps {
  category: MealCategoryData;
  isToday: boolean;
  onDeleteItem?: (mealType: string, itemId: string) => void;
  defaultOpen?: boolean;
}

function formatPortionDisplay(quantity: number, servingSize: number, servingUnit: string): string {
  const unit = (servingUnit || 'serving').trim();
  if (/\d/.test(unit)) {
    return `${quantity} × ${unit}`;
  }
  return `${quantity} × ${servingSize} ${unit}`.trim();
}

export default function MealCategoryCard({
  category,
  isToday,
  onDeleteItem,
  defaultOpen = true,
}: MealCategoryCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalCalories = category.items.reduce(
    (sum, item) => sum + item.calories * item.quantity,
    0
  );
  const totalProtein = category.items.reduce(
    (sum, item) => sum + item.protein * item.quantity,
    0
  );
  const totalCarbs = category.items.reduce(
    (sum, item) => sum + item.carbs * item.quantity,
    0
  );
  const totalFat = category.items.reduce(
    (sum, item) => sum + item.fat * item.quantity,
    0
  );

  return (
    <div className="rounded-3xl border border-border bg-bg-card transition-all duration-200 overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-bg-card">
        {/* Clickable Title & Subtotals to Toggle Expand */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 text-left focus:outline-hidden group flex-1 cursor-pointer min-w-0"
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-bg-input border border-border group-hover:scale-105 transition-transform shrink-0">
            {category.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-base sm:text-lg text-text-primary leading-tight truncate">
                {category.label}
              </h4>
              <span className="text-xs font-bold text-text-secondary">
                ({category.items.length})
              </span>
            </div>
            <div className="text-xs font-bold text-text-secondary mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-black text-mint-dark dark:text-mint">
                {Math.round(totalCalories)} kcal
              </span>
              <span>·</span>
              <span>P: {Math.round(totalProtein)}g</span>
              <span>·</span>
              <span>C: {Math.round(totalCarbs)}g</span>
              <span>·</span>
              <span>F: {Math.round(totalFat)}g</span>
            </div>
          </div>
        </button>

        {/* Action Controls: Log Button & Accordion Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* "+ Log" Button - Only visible when viewing today */}
          {isToday && (
            <Link
              href={`/add-food?meal=${category.type}`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-mint hover:bg-mint-dark text-text-on-dark shadow-2xs transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log</span>
            </Link>
          )}

          {/* Chevron Accordion Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle meal details"
            className="p-1.5 rounded-xl border border-border hover:bg-bg-input text-text-secondary transition-transform duration-300 cursor-pointer"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content List */}
      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-border bg-bg-input/40 animate-fadeIn">
          {category.items.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-2xl bg-bg-input border border-border text-text-tertiary mb-2">
                <Utensils className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-sm font-bold text-text-secondary">No items logged</p>
              {isToday ? (
                <p className="text-xs text-text-tertiary mt-0.5">
                  Click &ldquo;Log&rdquo; above to add your {category.label.toLowerCase()} meal
                </p>
              ) : (
                <p className="text-xs text-text-tertiary mt-0.5">
                  No food entries recorded for this date
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text-primary truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-text-secondary font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span>
                        {formatPortionDisplay(item.quantity, item.servingSize, item.servingUnit)}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-text-primary">
                        {item.calories * item.quantity} kcal
                      </span>
                      <span>·</span>
                      <span className="text-text-tertiary">
                        P: {item.protein * item.quantity}g | C: {item.carbs * item.quantity}g | F:{' '}
                        {item.fat * item.quantity}g
                      </span>
                    </div>
                  </div>

                  {/* Delete Button (Allowed for today's logs) */}
                  {isToday && onDeleteItem && (
                    <button
                      type="button"
                      onClick={() => onDeleteItem(category.type, item.id)}
                      aria-label="Remove item"
                      className="p-1.5 rounded-lg text-text-tertiary hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

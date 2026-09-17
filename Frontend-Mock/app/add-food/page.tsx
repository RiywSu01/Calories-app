'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MealType } from '@/app/lib/types';
import { Search, Utensils, Sparkles, ChevronRight } from 'lucide-react';
import AddFoodHeader from '@/app/components/add-food/AddFoodHeader';
import MealTypeSelector from '@/app/components/add-food/MealTypeSelector';

function AddFoodHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialMeal = (searchParams.get('meal') as MealType) || 'breakfast';

  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);

  const options = [
    {
      id: 'search',
      title: 'Search Food Database',
      subtitle: 'Instant search across 1,000,000+ verified foods & brands',
      icon: Search,
      badge: 'Fast & Verified',
      accentColor: 'var(--mint)',
      lightBg: 'var(--mint-light)',
      href: `/add-food/search?date=${dateParam}&meal=${selectedMeal}`,
    },
    {
      id: 'customize',
      title: 'Customize Foods',
      subtitle: 'Create & save custom homemade recipes or view your custom foods',
      icon: Utensils,
      badge: 'Personal Recipes',
      accentColor: 'var(--lavender)',
      lightBg: 'var(--lavender-light)',
      href: `/add-food/customize?date=${dateParam}&meal=${selectedMeal}`,
    },
    {
      id: 'ai',
      title: 'AI Meal Analyzer',
      subtitle: 'Type what you ate in natural text and let AI extract calories & macros',
      icon: Sparkles,
      badge: 'Smart NLP',
      accentColor: 'var(--peach)',
      lightBg: 'var(--peach-light)',
      href: `/add-food/ai?date=${dateParam}&meal=${selectedMeal}`,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Clean Header */}
      <AddFoodHeader
        title="Add Food"
        subtitle={`Logging for ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} • ${dateParam}`}
        backHref="/dashboard"
      />

      {/* Meal Category Picker */}
      <div className="mb-6">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-2.5">
          Select Meal Time
        </label>
        <MealTypeSelector selectedMeal={selectedMeal} onChange={setSelectedMeal} />
      </div>

      {/* 3 Main Method Options */}
      <div className="space-y-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => router.push(opt.href)}
              className="w-full p-5 sm:p-6 bg-bg-card border border-border rounded-3xl hover:border-mint hover:shadow-lg transition-all duration-200 text-left flex items-center justify-between gap-4 group cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `color-mix(in srgb, ${opt.lightBg} 45%, transparent)` }}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: opt.accentColor }} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-black text-base sm:text-lg text-text-primary group-hover:text-mint-dark transition-colors">
                      {opt.title}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-input text-text-secondary border border-border">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {opt.subtitle}
                  </p>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-bg-input flex items-center justify-center text-text-tertiary group-hover:bg-mint group-hover:text-text-on-dark transition-all shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AddFoodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-text-secondary text-sm font-semibold">
          Loading Add Food Hub...
        </div>
      }
    >
      <AddFoodHubContent />
    </Suspense>
  );
}

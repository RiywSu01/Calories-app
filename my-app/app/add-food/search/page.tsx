'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchFoods } from '../../lib/food-database';
import { addFoodToMeal, getTodayDate } from '../../lib/storage';
import { FoodItem, MealType } from '../../lib/types';
import { getFoodEmoji } from '../../components/FoodCard';
import BackButton from '../../components/BackButton';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || getTodayDate();
  const mealParam = searchParams.get('meal') as MealType | null;

  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [mealType, setMealType] = useState<MealType>(mealParam || 'breakfast');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const results = useMemo(() => searchFoods(query), [query]);

  const handleAdd = () => {
    if (!selectedFood) return;
    addFoodToMeal(date, selectedFood, mealType, quantity);
    setAdded(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="page-container page-padding" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <BackButton label="Back" />

      <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Search Food 🔍
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Find your food from our database
        </p>
      </div>

      {/* Search Input */}
      <div className="input-with-icon" style={{ marginBottom: '12px' }}>
        <span className="input-icon">🔍</span>
        <input
          className="input"
          type="text"
          placeholder="Search for food..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Meal Type Selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mt) => (
          <button
            key={mt}
            onClick={() => setMealType(mt)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '2px solid',
              borderColor: mealType === mt ? 'var(--mint)' : 'var(--border)',
              background: mealType === mt ? 'var(--mint)' : 'var(--bg-input)',
              color: mealType === mt ? '#FFFFFF' : 'var(--text-secondary)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {mt === 'breakfast' ? '🌅' : mt === 'lunch' ? '☀️' : '🌙'} {mt}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {results.map((food) => {
            const isSelected = selectedFood?.id === food.id;
            return (
              <button
                key={food.id}
                onClick={() => setSelectedFood(isSelected ? null : food)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: isSelected ? 'var(--mint-light)' : 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--mint)' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Nunito', sans-serif",
                  width: '100%',
                  boxShadow: '0 1px 4px var(--shadow)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Food emoji */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                >
                  {getFoodEmoji(food.name)}
                </div>

                {/* Name & cal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {food.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: 700 }}>
                    {food.calories} cal
                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}> · {food.servingSize}</span>
                  </div>
                </div>

                {/* Macros */}
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'right', lineHeight: 1.6, flexShrink: 0 }}>
                  <div>P: {food.protein}g</div>
                  <div>F: {food.fat}g</div>
                  <div>C: {food.carbs}g</div>
                </div>

                {/* Select circle */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--mint)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--mint)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {results.length === 0 && query && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🤷</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>No food found for &quot;{query}&quot;</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Try a different search or add it manually</div>
          </div>
        )}
      </div>

      {/* Bottom Bar — Quantity & Add Button */}
      {selectedFood && (
        <div className="animate-slideUp" style={{ padding: '16px 0 8px', borderTop: '1px solid var(--border)' }}>
          {/* Quantity selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border)',
                background: 'var(--bg-input)', cursor: 'pointer', fontSize: '18px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)',
              }}
            >
              −
            </button>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', minWidth: '60px', textAlign: 'center' }}>
              {quantity} {quantity > 1 ? 'servings' : 'serving'}
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--mint)',
                background: 'var(--mint-light)', cursor: 'pointer', fontSize: '18px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint)',
              }}
            >
              +
            </button>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleAdd}
            disabled={added}
            style={{ opacity: added ? 0.7 : 1 }}
          >
            {added ? 'Added! ✅' : `Add to ${mealType} — ${Math.round(selectedFood.calories * quantity)} cal`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

'use client';

import { MealEntry } from '../lib/types';

interface FoodCardProps {
  entry: MealEntry;
  onRemove?: (id: string) => void;
}

// Simple emoji map for food categories
function getFoodEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('apple')) return '🍎';
  if (n.includes('banana')) return '🍌';
  if (n.includes('orange') && !n.includes('juice')) return '🍊';
  if (n.includes('strawberr')) return '🍓';
  if (n.includes('grape')) return '🍇';
  if (n.includes('watermelon')) return '🍉';
  if (n.includes('mango')) return '🥭';
  if (n.includes('blueberr')) return '🫐';
  if (n.includes('broccoli')) return '🥦';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('spinach')) return '🥬';
  if (n.includes('potato')) return '🍠';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('rice') || n.includes('fried rice')) return '🍚';
  if (n.includes('bread')) return '🍞';
  if (n.includes('oatmeal')) return '🥣';
  if (n.includes('pasta')) return '🍝';
  if (n.includes('chicken')) return '🍗';
  if (n.includes('salmon') || n.includes('tuna') || n.includes('shrimp')) return '🐟';
  if (n.includes('egg')) return '🥚';
  if (n.includes('beef') || n.includes('pork')) return '🥩';
  if (n.includes('tofu')) return '🧈';
  if (n.includes('milk')) return '🥛';
  if (n.includes('yogurt')) return '🍦';
  if (n.includes('cheese')) return '🧀';
  if (n.includes('almond') || n.includes('trail mix')) return '🥜';
  if (n.includes('peanut butter')) return '🥜';
  if (n.includes('chocolate')) return '🍫';
  if (n.includes('popcorn')) return '🍿';
  if (n.includes('granola')) return '🍪';
  if (n.includes('juice') || n.includes('smoothie')) return '🧃';
  if (n.includes('coffee')) return '☕';
  if (n.includes('tea')) return '🍵';
  if (n.includes('cola') || n.includes('coca')) return '🥤';
  if (n.includes('salad')) return '🥗';
  if (n.includes('burger')) return '🍔';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('wrap')) return '🌯';
  if (n.includes('sushi')) return '🍣';
  if (n.includes('pad thai')) return '🍜';
  if (n.includes('pancake')) return '🥞';
  return '🍽️';
}

export default function FoodCard({ entry, onRemove }: FoodCardProps) {
  const { foodItem, quantity } = entry;
  const emoji = getFoodEmoji(foodItem.name);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Food emoji */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-input)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>

      {/* Name & calories */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {foodItem.name}
          {quantity > 1 && <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}> ×{quantity}</span>}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: 700 }}>
          {Math.round(foodItem.calories * quantity)} cal
        </div>
      </div>

      {/* Macros */}
      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'right', lineHeight: 1.6 }}>
        <div>P: {(foodItem.protein * quantity).toFixed(1)}g</div>
        <div>F: {(foodItem.fat * quantity).toFixed(1)}g</div>
        <div>C: {(foodItem.carbs * quantity).toFixed(1)}g</div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(entry.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            fontSize: '16px',
            padding: '4px',
            borderRadius: '50%',
            transition: 'color 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--peach)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          aria-label={`Remove ${foodItem.name}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export { getFoodEmoji };

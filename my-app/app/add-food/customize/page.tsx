'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { addFoodToMeal, getTodayDate } from '../../lib/storage';
import { MealType } from '../../lib/types';
import BackButton from '../../components/BackButton';

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || getTodayDate();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories.trim()) return;

    addFoodToMeal(
      date,
      {
        id: 'custom_' + Date.now(),
        name: name.trim(),
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        servingSize: '1 serving',
        imageUrl: imagePreview || undefined,
        category: 'meal',
      },
      mealType
    );

    setSaved(true);
    setTimeout(() => router.push('/dashboard'), 800);
  };

  const nutritionFields = [
    { key: 'calories', emoji: '🔥', label: 'Calories', unit: 'kcal', value: calories, setter: setCalories, bg: '#FFF0EB' },
    { key: 'protein', emoji: '🥩', label: 'Protein', unit: 'g', value: protein, setter: setProtein, bg: '#FFE8ED' },
    { key: 'carbs', emoji: '🌾', label: 'Carbs', unit: 'g', value: carbs, setter: setCarbs, bg: '#E8F4FD' },
    { key: 'fat', emoji: '🥑', label: 'Fat', unit: 'g', value: fat, setter: setFat, bg: '#E8F8E8' },
  ];

  return (
    <div className="page-container page-padding">
      <BackButton label="Back" />

      {/* Header */}
      <div className="animate-scaleIn" style={{ textAlign: 'center', margin: '12px 0 20px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--peach-light), var(--mint-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 10px',
          }}
        >
          ✨🍴
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Create Your Food
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          What did you eat?
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Main Card */}
        <div className="card animate-fadeIn" style={{ padding: '20px', marginBottom: '16px' }}>
          {/* Photo Upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100px',
              height: '80px',
              borderRadius: 'var(--radius-md)',
              border: imagePreview ? 'none' : '2px dashed var(--mint)',
              background: imagePreview ? 'transparent' : 'var(--mint-light)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              overflow: 'hidden',
              marginBottom: '16px',
              transition: 'all 0.2s ease',
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Food" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            ) : (
              <>
                <span style={{ fontSize: '22px' }}>📷</span>
                <span style={{ fontSize: '10px', color: 'var(--mint)', fontWeight: 700 }}>Add photo</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

          {/* Food Name */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Homemade Pasta"
              required
              style={{
                width: '100%',
                padding: '10px 0',
                border: 'none',
                borderBottom: '2px solid var(--border)',
                background: 'transparent',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'var(--mint)')}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
            />
          </div>

          {/* Nutrition Section */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '12px', letterSpacing: '0.5px' }}>
              NUTRITION INFO
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              {nutritionFields.map((field) => (
                <div
                  key={field.key}
                  style={{
                    background: field.bg,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 8px',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{field.emoji}</div>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder="0"
                    min={0}
                    step="0.1"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '18px',
                      fontWeight: 800,
                      fontFamily: "'Nunito', sans-serif",
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {field.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="animate-fadeIn" style={{ marginBottom: '16px' }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="📝 Notes (optional)"
            rows={2}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border)',
              background: 'var(--bg-input)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '14px',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--mint)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Meal Type Pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mt) => (
            <button
              key={mt}
              type="button"
              onClick={() => setMealType(mt)}
              style={{
                flex: 1,
                padding: '10px 12px',
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

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={!name.trim() || !calories.trim() || saved}
          style={{
            opacity: (!name.trim() || !calories.trim() || saved) ? 0.5 : 1,
          }}
        >
          {saved ? 'Added! ✅' : 'Add to Diary 🎉'}
        </button>
      </form>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Loading...</div>
      </div>
    }>
      <CustomizeContent />
    </Suspense>
  );
}

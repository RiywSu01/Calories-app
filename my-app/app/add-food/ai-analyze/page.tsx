'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { addFoodToMeal, getTodayDate } from '../../lib/storage';
import { MealType } from '../../lib/types';
import BackButton from '../../components/BackButton';

function AiAnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || getTodayDate();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      // Simulate AI analysis
      setAnalyzing(true);
      setTimeout(() => {
        setResult({
          name: 'Grilled Chicken Salad',
          calories: 320,
          protein: 28,
          carbs: 15,
          fat: 18,
        });
        setAnalyzing(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!result) return;
    addFoodToMeal(
      date,
      {
        id: 'ai_' + Date.now(),
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        servingSize: '1 serving',
        category: 'meal',
      },
      mealType
    );
    setSaved(true);
    setTimeout(() => router.push('/dashboard'), 800);
  };

  return (
    <div className="page-container page-padding">
      <BackButton label="Back" />

      <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          AI Food Scan 📸
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Take a photo and let AI analyze it
        </p>
      </div>

      {/* Photo Upload Area */}
      <button
        onClick={() => fileRef.current?.click()}
        className="animate-fadeIn"
        style={{
          width: '100%',
          height: imagePreview ? 'auto' : '220px',
          borderRadius: 'var(--radius-xl)',
          border: imagePreview ? 'none' : '3px dashed var(--mint)',
          background: imagePreview ? 'transparent' : 'var(--mint-light)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '20px',
          transition: 'all 0.3s ease',
        }}
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Food preview"
            style={{
              width: '100%',
              maxHeight: '260px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-xl)',
            }}
          />
        ) : (
          <>
            <div style={{ fontSize: '44px' }}>📷</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mint)' }}>
              Take a photo or upload
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Tap here to get started
            </div>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Analyzing State */}
      {analyzing && (
        <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖✨</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analyzing your meal...
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Our AI is identifying the food
          </div>
          {/* Simple loading dots */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--mint)',
                  animation: `scaleIn 0.6s ease ${i * 0.2}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !analyzing && (
        <div className="animate-slideUp">
          {/* Detected Food Name */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Detected</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{result.name}</div>
          </div>

          {/* Nutrition Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { emoji: '🔥', label: 'Calories', value: result.calories, unit: 'kcal', bg: 'var(--peach-light)' },
              { emoji: '🌾', label: 'Carbs', value: result.carbs, unit: 'g', bg: 'var(--macro-carb)' },
              { emoji: '🥩', label: 'Protein', value: result.protein, unit: 'g', bg: 'var(--macro-protein)' },
              { emoji: '🥑', label: 'Fat', value: result.fat, unit: 'g', bg: 'var(--macro-fat)' },
            ].map((item) => (
              <div
                key={item.label}
                className="card"
                style={{
                  background: item.bg,
                  padding: '14px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{item.emoji}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {item.label} ({item.unit})
                </div>
              </div>
            ))}
          </div>

          {/* Meal Type Selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mt) => (
              <button
                key={mt}
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

          <button
            className="btn btn-primary btn-full"
            onClick={handleSave}
            disabled={saved}
            style={{ opacity: saved ? 0.7 : 1 }}
          >
            {saved ? 'Saved! ✅' : 'Save to Diary 🎉'}
          </button>

          {/* Disclaimer */}
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '12px' }}>
            ⚠️ AI analysis is a demo. Connect your AI backend for real results.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AiAnalyzePage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Loading...</div>
      </div>
    }>
      <AiAnalyzeContent />
    </Suspense>
  );
}

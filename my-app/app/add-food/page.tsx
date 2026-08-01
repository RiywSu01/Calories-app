'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import BackButton from '../components/BackButton';

function AddFoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const mealType = searchParams.get('meal') || '';

  const methods = [
    {
      id: 'search',
      emoji: '🔍',
      title: 'Search',
      subtitle: 'Browse our food database',
      bgColor: 'var(--mint-light)',
      borderColor: 'var(--mint)',
      href: `/add-food/search?date=${date}&meal=${mealType}`,
    },
    {
      id: 'ai',
      emoji: '📸',
      title: 'AI Picture Analyze',
      subtitle: "Snap a photo, we'll do the rest",
      bgColor: 'var(--peach-light)',
      borderColor: 'var(--peach)',
      href: `/add-food/ai-analyze?date=${date}&meal=${mealType}`,
    },
    {
      id: 'customize',
      emoji: '✏️',
      title: 'Customize',
      subtitle: 'Enter food details manually',
      bgColor: 'var(--lavender-light)',
      borderColor: 'var(--lavender)',
      href: `/add-food/customize?date=${date}&meal=${mealType}`,
    },
  ];

  return (
    <div className="page-container page-padding">
      <BackButton label="Back" />

      {/* Logo */}
      <div className="animate-scaleIn" style={{ textAlign: 'center', margin: '24px 0 32px' }}>
        <div style={{ fontSize: '44px', marginBottom: '12px' }}>🍽️</div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          How would you like to add food?
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '6px 0 0' }}>
          Choose a method below
        </p>
      </div>

      {/* Method Cards */}
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => router.push(method.href)}
            className="card card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '22px 20px',
              background: method.bgColor,
              border: `2px solid transparent`,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'Nunito', sans-serif",
              width: '100%',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = method.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                flexShrink: 0,
                boxShadow: '0 2px 8px var(--shadow)',
              }}
            >
              {method.emoji}
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {method.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {method.subtitle}
              </div>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: 'auto', flexShrink: 0 }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AddFoodPage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Loading...</div>
      </div>
    }>
      <AddFoodContent />
    </Suspense>
  );
}

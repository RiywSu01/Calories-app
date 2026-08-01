'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from './lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Show a cute loading state while redirecting
  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-scaleIn" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥑</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--mint)' }}>CalPal</div>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Loading...</div>
      </div>
    </div>
  );
}

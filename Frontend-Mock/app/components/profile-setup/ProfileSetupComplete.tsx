'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const MESSAGES = [
  'Setting up your profile…',
  'Crunching your macros…',
  'Personalising your CalPal experience…',
  "You're all set! 🥑",
];

export default function ProfileSetupComplete() {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  // ── Cycle through status messages ─────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1 < MESSAGES.length ? i + 1 : i));
    }, 550);
    return () => clearInterval(interval);
  }, []);

  // ── Animate trailing dots ──────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // ── Smooth redirect to dashboard after 2 seconds ──────────
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-10 px-6 animate-fade-in">
      {/* Pulsing Logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow rings */}
        <div className="absolute w-32 h-32 rounded-full bg-[var(--mint)]/15 animate-ping" />
        <div className="absolute w-24 h-24 rounded-full bg-[var(--mint)]/20 animate-pulse" />
        {/* Logo */}
        <div className="relative w-20 h-20 rounded-full bg-[var(--mint-light)]/40 border-2 border-[var(--mint)]/50 flex items-center justify-center shadow-lg">
          <span className="text-4xl animate-bounce">🥑</span>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] transition-all duration-300">
          {MESSAGES[msgIndex]}
          <span className="text-[var(--mint)]">{dots}</span>
        </h1>
        <p className="text-sm font-semibold text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
          Preparing your customized nutrition targets and dashboard.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--mint)] transition-all"
            style={{
              animation: 'loading-bar 2s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes loading-bar {
          0%   { width: 0%;   }
          50%  { width: 70%;  }
          85%  { width: 92%;  }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

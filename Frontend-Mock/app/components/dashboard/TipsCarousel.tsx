'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, ChevronRight, X, BookOpen, HeartHandshake } from 'lucide-react';
import { HEALTH_TIPS } from '@/app/lib/database/dashboard';
import { HealthTip } from '@/app/lib/types';

export default function TipsCarousel() {
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef<boolean>(false);
  const startX = React.useRef<number>(0);
  const scrollLeftStart = React.useRef<number>(0);
  const hasDragged = React.useRef<boolean>(false);

  // Auto-swipe timer
  useEffect(() => {
    if (!isAutoPlay || selectedTip) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const cardWidth = 300; // approximate width + gap
      const maxScrollLeft = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScrollLeft - 10) {
        // Loop back to start
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlay, selectedTip]);

  // Scroll step controls (Left / Right chevrons)
  const scrollPrev = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // Mouse drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    setIsAutoPlay(true);
  };

  return (
    <>
      <div
        className="rounded-3xl p-5 sm:p-6 border shadow-sm transition-all duration-300 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={onMouseLeave}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>

              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
                  Daily Tips & Nutrition Hacks
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Science-backed advice to optimize your metabolism
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous tip"
              className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next tip"
              className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-input)] text-[var(--text-secondary)] transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable / Draggable Feed */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-1 px-1 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
        >
          {HEALTH_TIPS.map((tip) => (
            <div
              key={tip.id}
              onClick={() => {
                if (!hasDragged.current) {
                  setSelectedTip(tip);
                }
              }}
              className="flex-shrink-0 w-64 sm:w-72 snap-start rounded-2xl border text-left p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer group focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Image Thumbnail */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-zinc-200 dark:bg-zinc-800 pointer-events-none">
                <img
                  src={tip.imageUrl}
                  alt={tip.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white">
                  {tip.category}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md bg-black/50 text-white/90">
                  {tip.readTime}
                </div>
              </div>

              {/* Title & Preview */}
              <h4 className="font-black text-sm text-[var(--text-primary)] group-hover:text-[var(--mint-dark)] transition-colors line-clamp-1">
                {tip.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                {tip.detail}
              </p>

              <div className="mt-3 flex items-center justify-between text-xs font-bold text-[var(--mint-dark)] pt-2 border-t border-[var(--border)]">
                <span>Read Full Tip</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Detail Modal Dialog */}
      {selectedTip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedTip(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border transition-all animate-scaleIn relative"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-48 sm:h-56 w-full bg-zinc-200 dark:bg-zinc-800">
              <img
                src={selectedTip.imageUrl}
                alt={selectedTip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedTip(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-xs"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--mint-dark)] text-white">
                  {selectedTip.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-snug">
                  {selectedTip.title}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                <BookOpen className="w-4 h-4 text-[var(--mint-dark)]" />
                <span>{selectedTip.readTime}</span>
                <span>•</span>
                <span>CalPal Nutrition Advisory</span>
              </div>

              <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-medium">
                {selectedTip.detail}
              </p>

              <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Key Takeaway:
                </div>
                <p>
                  Consistency beats perfection. Integrate small nutritional adjustments into your daily routine to see sustainable metabolic benefits.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTip(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--mint-dark, #5BB899) 0%, var(--mint, #7ECFB3) 100%)',
                  }}
                >
                  Got it, Thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

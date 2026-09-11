import React from 'react';
import Link from 'next/link';
import { ExternalLink, Info, ShieldAlert } from 'lucide-react';

interface FatSecretAttributionProps {
  className?: string;
  variant?: 'inline' | 'card' | 'footer';
  showDisclaimer?: boolean;
}

export default function FatSecretAttribution({
  className = '',
  variant = 'inline',
  showDisclaimer = true,
}: FatSecretAttributionProps) {
  if (variant === 'card') {
    return (
      <div
        className={`p-4 rounded-2xl bg-bg-card border border-border/80 text-xs space-y-2 shadow-xs ${className}`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-text-primary">
            <Info className="w-3.5 h-3.5 text-mint shrink-0" />
            <span>Nutritional Data Attribution</span>
          </div>
          <a
            href="https://www.fatsecret.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-mint-dark dark:text-mint hover:underline font-extrabold text-[11px] group"
          >
            <span>Powered by FatSecret</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {showDisclaimer && (
          <p className="text-[11px] text-text-tertiary leading-relaxed">
            <strong className="text-text-secondary">Medical Disclaimer:</strong> Nutritional
            calculations and food database entries are provided for informational purposes only and
            are not a substitute for professional medical advice, clinical diagnosis, or physician
            consultation.
          </p>
        )}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <footer
        className={`py-6 px-4 border-t border-border/60 text-center space-y-2 text-xs text-text-tertiary ${className}`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span>Food data</span>
          <a
            href="https://www.fatsecret.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-mint-dark dark:text-mint hover:underline font-extrabold"
          >
            <span>Powered by FatSecret</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {showDisclaimer && (
          <p className="text-[11px] max-w-xl mx-auto text-text-tertiary leading-relaxed">
            Nutritional calculations and dietary estimates are for informational purposes only and
            do not constitute medical advice or substitute for consultation with a licensed
            physician or registered dietitian.
          </p>
        )}
      </footer>
    );
  }

  // Default 'inline' variant
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-text-tertiary pt-3 pb-1 border-t border-border/50 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>Food data</span>
        <a
          href="https://www.fatsecret.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-mint-dark dark:text-mint hover:underline font-extrabold"
        >
          <span>Powered by FatSecret</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {showDisclaimer && (
        <span className="text-[10px] text-text-tertiary italic">
          Informational only • Not medical advice
        </span>
      )}
    </div>
  );
}

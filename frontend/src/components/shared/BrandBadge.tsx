import React from 'react';

interface BrandBadgeProps {
  brand: 'teluguai' | 'genai99' | 'both' | 'TeluguAI' | 'GenAI99' | 'Platform';
  size?: 'sm' | 'md';
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ brand, size = 'md' }) => {
  const normalized = brand.toLowerCase();
  
  if (normalized === 'teluguai') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } bg-emerald-50 text-emerald-700 border-emerald-200`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        TeluguAI
      </span>
    );
  }

  if (normalized === 'genai99') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } bg-sky-50 text-sky-700 border-sky-200`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
        GenAI99
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } bg-slate-100 text-slate-700 border-slate-200`}
    >
      Platform
    </span>
  );
};

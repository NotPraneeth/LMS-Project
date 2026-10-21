'use client';

import React from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface LoadingPanelProps {
  label?: string;
}

export const LoadingPanel: React.FC<LoadingPanelProps> = ({ label = 'Loading portal data…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
    <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

interface ErrorPanelProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
    <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
      <AlertCircle className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800">Could not load data</p>
      <p className="text-xs text-slate-500 mt-1 max-w-md">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
    )}
  </div>
);

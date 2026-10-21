import React from 'react';

interface StatusBadgeProps {
  status:
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'maintenance'
    | 'pending'
    | 'completed'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'SUCCESS'
    | 'WARNING'
    | 'FAILED';
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const label = text || status;
  
  const getStyle = () => {
    switch (status) {
      case 'active':
      case 'APPROVED':
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
      case 'PENDING':
      case 'WARNING':
      case 'maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'inactive':
      case 'suspended':
      case 'REJECTED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()} capitalize`}>
      {label.toLowerCase()}
    </span>
  );
};

import React from 'react';

interface ScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md', showLabel = false }) => {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        N/A
      </span>
    );
  }

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  if (score >= 80) {
    colorClasses = 'bg-teal-50 text-teal-700 border-teal-200 font-semibold';
  } else if (score >= 65) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
  } else if (score >= 50) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
  } else {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5'
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center justify-center rounded-lg border font-mono tracking-tight shadow-sm ${sizeClasses} ${colorClasses}`}>
        {score.toFixed(1)}
      </span>
      {showLabel && (
        <span className="text-xs text-slate-500 font-normal">/ 100</span>
      )}
    </div>
  );
};

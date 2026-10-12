import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: 'High' | 'Moderate' | 'Low' | 'Insufficient Data' | string;
  type?: 'Academic' | 'Placement';
  showType?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, type, showType = false }) => {
  const normLevel = level?.toLowerCase() || '';

  if (normLevel === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        {showType && type ? `${type}: ` : ''}High Concern
      </span>
    );
  }

  if (normLevel === 'moderate') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        {showType && type ? `${type}: ` : ''}Moderate
      </span>
    );
  }

  if (normLevel === 'low') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {showType && type ? `${type}: ` : ''}Low Risk
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal bg-slate-100 text-slate-600 border border-slate-200">
      <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
      {showType && type ? `${type}: ` : ''}Insufficient Data
    </span>
  );
};

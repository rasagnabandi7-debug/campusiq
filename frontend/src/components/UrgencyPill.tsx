import React from 'react';
import { Flame, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface UrgencyPillProps {
  urgency: 'Critical' | 'High' | 'Moderate' | 'Low' | string;
}

export const UrgencyPill: React.FC<UrgencyPillProps> = ({ urgency }) => {
  const norm = urgency?.toLowerCase() || '';

  if (norm === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-600 text-white shadow-sm animate-pulse">
        <Flame className="w-3.5 h-3.5 text-yellow-300" />
        CRITICAL
      </span>
    );
  }

  if (norm === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        HIGH PRIORITY
      </span>
    );
  }

  if (norm === 'moderate') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        MODERATE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      LOW
    </span>
  );
};

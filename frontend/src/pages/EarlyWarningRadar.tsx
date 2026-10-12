import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  Flame,
  AlertTriangle,
  Clock,
  Filter,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { RadarAlertItem } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { RiskBadge } from '../components/RiskBadge';
import { UrgencyPill } from '../components/UrgencyPill';

interface EarlyWarningRadarProps {
  selectedDept: string;
  onSelectStudent: (studentId: string) => void;
  onAssignIntervention: (studentId: string) => void;
}

export const EarlyWarningRadar: React.FC<EarlyWarningRadarProps> = ({
  selectedDept,
  onSelectStudent,
  onAssignIntervention
}) => {
  const [alerts, setAlerts] = useState<RadarAlertItem[]>([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [highCount, setHighCount] = useState(0);
  const [moderateCount, setModerateCount] = useState(0);
  const [riskType, setRiskType] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getEarlyWarnings({
        department: selectedDept || undefined,
        risk_type: riskType || undefined,
        urgency: urgencyFilter || undefined
      });
      setAlerts(data.alerts);
      setTotalAlerts(data.total_alerts);
      setCriticalCount(data.critical_count);
      setHighCount(data.high_count);
      setModerateCount(data.moderate_count);
    } catch (err) {
      console.error('Failed to fetch radar alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedDept, riskType, urgencyFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-rose-900/40 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Proactive Early Warning Radar
            </span>
            <span className="text-xs text-slate-400">Institutional Safety Net</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Student Success Radar & Triage Board
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Multi-factor threshold alerts prioritize students facing attendance debarment, assessment failures, multiple backlogs, or acute placement deficits before semester stakes compound.
          </p>
        </div>

        {/* Urgency Summary Chips */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-red-950/80 border border-red-800/60 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-red-300 uppercase block">Critical</span>
            <span className="text-xl font-black font-mono text-red-200">{criticalCount}</span>
          </div>

          <div className="p-3 bg-rose-950/80 border border-rose-800/60 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-rose-300 uppercase block">High Priority</span>
            <span className="text-xl font-black font-mono text-rose-200">{highCount}</span>
          </div>

          <div className="p-3 bg-amber-950/80 border border-amber-800/60 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-amber-300 uppercase block">Moderate</span>
            <span className="text-xl font-black font-mono text-amber-200">{moderateCount}</span>
          </div>
        </div>
      </div>

      {/* Triage Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            Radar Filters:
          </div>

          <div className="flex items-center gap-1">
            {['', 'Critical', 'High', 'Moderate'].map((u) => (
              <button
                key={u}
                onClick={() => setUrgencyFilter(u)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  urgencyFilter === u
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {u || 'All Urgencies'}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1">
            {[
              { id: '', label: 'All Risks' },
              { id: 'academic', label: 'Academic Risk Only' },
              { id: 'placement', label: 'Placement Risk Only' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRiskType(r.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  riskType === r.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{alerts.length}</strong> urgent cases
        </span>
      </div>

      {/* Radar Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Primary Risk Trigger</th>
                <th className="py-3 px-4">Success Score</th>
                <th className="py-3 px-4">Academic Risk</th>
                <th className="py-3 px-4">Placement Risk</th>
                <th className="py-3 px-4">Recommended Next Action</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Scanning student registries for threshold triggers...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No active radar alerts match the selected urgency criteria.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert.student_id}
                    onClick={() => onSelectStudent(alert.student_id)}
                    className="hover:bg-rose-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <UrgencyPill urgency={alert.urgency} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {alert.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {alert.student_id} • {alert.department.replace('Engineering', 'Engg')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-rose-700 line-clamp-2 leading-snug">
                        {alert.primary_indicator}
                      </p>
                      {alert.triggered_rules.length > 1 && (
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          +{alert.triggered_rules.length - 1} other concurrent threshold flags
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <ScoreBadge score={alert.success_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={alert.academic_risk} type="Academic" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={alert.placement_risk} type="Placement" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-700 font-medium">
                      <p className="line-clamp-2 text-[11px]">{alert.recommended_action}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        alert.intervention_status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : alert.intervention_status === 'Assigned'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : alert.intervention_status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {alert.intervention_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onAssignIntervention(alert.student_id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs flex items-center gap-1"
                          title="Assign Support Plan"
                        >
                          <PlusCircle className="w-3 h-3" /> Intervene
                        </button>
                        <button
                          onClick={() => onSelectStudent(alert.student_id)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                          title="View 360° Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

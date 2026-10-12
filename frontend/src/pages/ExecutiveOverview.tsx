import React, { useEffect, useState } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  ClipboardList,
  Database,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import { DashboardSummary, DashboardDistributions, PriorityActionItem } from '../types';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { UrgencyPill } from '../components/UrgencyPill';
import { ScoreBadge } from '../components/ScoreBadge';

interface ExecutiveOverviewProps {
  selectedDept: string;
  selectedYear: string;
  onSelectStudent: (studentId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

const RISK_COLORS = {
  High: '#E11D48',     // Rose 600
  Moderate: '#D97706', // Amber 600
  Low: '#0D9488'       // Teal 600
};

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  selectedDept,
  selectedYear,
  onSelectStudent,
  onNavigateToTab
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [distributions, setDistributions] = useState<DashboardDistributions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters = {
          department: selectedDept || undefined,
          academic_year: selectedYear ? Number(selectedYear) : undefined
        };
        const [sumRes, distRes] = await Promise.all([
          api.getDashboardSummary(filters),
          api.getDashboardDistributions(filters)
        ]);
        setSummary(sumRes);
        setDistributions(distRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDept, selectedYear]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Calculating real-time institutional metrics across databases...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Enrolled Students',
      value: summary?.total_students || 0,
      subtext: selectedDept || 'Institution-wide Cohort',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Average Success Score',
      value: summary?.average_success_score ? `${summary.average_success_score.toFixed(1)}/100` : '0',
      subtext: '40% Acad, 20% Att, 15% LMS, 25% Plc',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Academic Risk Attention',
      value: summary?.academic_risk_count || 0,
      subtext: `${summary?.academic_risk_percentage || 0}% of cohort (Att <60% / Marks <40)`,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      title: 'Placement Gap Alert',
      value: summary?.placement_risk_count || 0,
      subtext: `${summary?.placement_risk_percentage || 0}% of cohort (Coding/Aptitude Deficits)`,
      icon: Briefcase,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Active Support Cases',
      value: summary?.open_interventions || 0,
      subtext: `${summary?.completed_interventions || 0} documented outcomes completed`,
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      title: 'Multi-Source Data Coverage',
      value: `${summary?.data_coverage_percentage || 0}%`,
      subtext: 'Unified: Academics, Attendance, LMS, Placement',
      icon: Database,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Decision Support System
            </span>
            <span className="text-xs text-slate-400">Institutional Intelligence v1.0</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Student Success & Early Intervention Cockpit
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Integrating academic records, lecture attendance, LMS digital footprint, and placement assessment readiness into proactive, explainable student support pathways.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateToTab('radar')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            Triage Early Warnings ({summary?.priority_actions_count || 0})
          </button>
          <button
            onClick={() => onNavigateToTab('copilot')}
            className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4" />
            Ask Copilot
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                  {kpi.title}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-2">
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {kpi.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid 1: Success Score Distribution & Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Success Score Distribution (0-100) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Success Score Distribution</h3>
              <p className="text-xs text-slate-500">Cohort scores normalized across 4 pillars (0-100 scale)</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Avg: {summary?.average_success_score || 0}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributions?.score_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} Students`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(distributions?.score_distribution || []).map((entry, index) => {
                    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#059669'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dual Risk Distributions (Academic vs Placement) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic & Placement Risk Profiles</h3>
            <p className="text-xs text-slate-500">Independent evaluation prevents conflating marks with coding skill</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Academic Risk Pie */}
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Academic Risk</span>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributions?.academic_risk_distribution || []}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={55}
                    >
                      {(distributions?.academic_risk_distribution || []).map((entry, index) => (
                        <Cell key={`acad-cell-${index}`} fill={(RISK_COLORS as any)[entry.level] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 text-[10px] font-medium text-slate-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600" /> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Mod</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-600" /> Low</span>
              </div>
            </div>

            {/* Placement Risk Pie */}
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Placement Risk</span>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributions?.placement_risk_distribution || []}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={55}
                    >
                      {(distributions?.placement_risk_distribution || []).map((entry, index) => (
                        <Cell key={`plc-cell-${index}`} fill={(RISK_COLORS as any)[entry.level] || '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 text-[10px] font-medium text-slate-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-600" /> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" /> Mod</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-600" /> Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid 2: Department-wise Benchmarks & Behavioral Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Comparison Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Performance & Vulnerability</h3>
              <p className="text-xs text-slate-500">Average Success Score vs At-Risk Student Count</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributions?.department_performance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="department" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="avg_success_score" name="Avg Success Score" fill="#2563EB" radius={[0, 4, 4, 0]} />
                <Bar dataKey="at_risk_students" name="At-Risk Count" fill="#E11D48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Segment Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Behavioral Cohort Segments</h3>
              <p className="text-xs text-slate-500">Targeted groups requiring differentiated action</p>
            </div>
            <button
              onClick={() => onNavigateToTab('segments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {(distributions?.segment_distribution || []).map((seg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 line-clamp-1">{seg.segment}</span>
                  <span className="font-mono text-slate-600 font-bold">{seg.count} ({seg.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      seg.segment.includes('Risk')
                        ? 'bg-rose-500'
                        : seg.segment.includes('Placement Unready')
                        ? 'bg-amber-500'
                        : seg.segment.includes('Underperforming')
                        ? 'bg-purple-500'
                        : seg.segment.includes('Low Recorded')
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${seg.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Action Alerts Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Priority Action Queue — Immediate Faculty Follow-up Recommended
            </h3>
            <p className="text-xs text-slate-500">
              Students automatically prioritized by multiple threshold breaches and severe attendance or backlog concerns.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('radar')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            Open Full Radar <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(distributions?.priority_actions || []).slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectStudent(item.student_id)}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">
                  {item.student_id}
                </span>
                <UrgencyPill urgency={item.urgency} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{item.department}</p>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                <p className="font-medium text-rose-700 line-clamp-2 leading-tight">
                  {item.primary_reason}
                </p>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-semibold line-clamp-1">
                  Next Step: {item.recommended_action}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500">Success Score:</span>
                <ScoreBadge score={item.success_score} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

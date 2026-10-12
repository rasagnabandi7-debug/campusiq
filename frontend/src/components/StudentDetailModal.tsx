import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  PlusCircle,
  Edit3,
  BrainCircuit,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

import { StudentDetail, Intervention } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from './ScoreBadge';
import { RiskBadge } from './RiskBadge';
import { UrgencyPill } from './UrgencyPill';
import { InterventionModal } from './InterventionModal';

interface StudentDetailModalProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInterventionUpdated?: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  isOpen,
  onClose,
  onInterventionUpdated
}) => {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'360' | 'academics' | 'placement' | 'risks' | 'interventions'>('360');

  // Intervention modal states
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  const fetchDetails = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStudentProfile(studentId);
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      fetchDetails();
    } else {
      setStudent(null);
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handleOpenNewIntervention = () => {
    setSelectedIntervention(null);
    setIsInterventionModalOpen(true);
  };

  const handleEditIntervention = (inv: Intervention) => {
    setSelectedIntervention(inv);
    setIsInterventionModalOpen(true);
  };

  const handleInterventionSaved = () => {
    fetchDetails();
    if (onInterventionUpdated) onInterventionUpdated();
  };

  // Radar chart data preparation
  const radarData = student
    ? [
        {
          subject: 'Academic (40%)',
          score: student.score_breakdown.academic_score || 0,
          fullMark: 100
        },
        {
          subject: 'Attendance (20%)',
          score: student.score_breakdown.attendance_score || 0,
          fullMark: 100
        },
        {
          subject: 'Engagement (15%)',
          score: student.score_breakdown.engagement_score || 0,
          fullMark: 100
        },
        {
          subject: 'Placement (25%)',
          score: student.score_breakdown.placement_score || 0,
          fullMark: 100
        }
      ]
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold text-lg font-mono">
                {student?.student_id.slice(-4) || 'STU'}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-white">{student?.name || 'Loading Profile...'}</h2>
                  {student && <UrgencyPill urgency={student.overall_urgency} />}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium flex-wrap">
                  <span className="font-mono text-blue-400">{student?.student_id}</span>
                  <span>•</span>
                  <span>{student?.department}</span>
                  <span>•</span>
                  <span>Year {student?.academic_year} (Sem {student?.semester})</span>
                  <span>•</span>
                  <span>Section {student?.section || 'A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenNewIntervention}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Assign Intervention
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader KPI Banner */}
          {student && (
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Success Score</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ScoreBadge score={student.success_score} size="lg" showLabel />
                    {student.score_breakdown.is_provisional && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                        Provisional
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Academic Risk</span>
                  <div className="mt-0.5">
                    <RiskBadge level={student.academic_risk_level} type="Academic" />
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Placement Risk</span>
                  <div className="mt-0.5">
                    <RiskBadge level={student.placement_risk_level} type="Placement" />
                  </div>
                </div>
              </div>

              {/* Segments Pill list */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {student.segments.map((seg) => (
                  <span
                    key={seg}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 shadow-2xs"
                  >
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-slate-200 px-6 bg-white">
            <nav className="flex space-x-6" aria-label="Modal Tabs">
              {[
                { id: '360', label: '360° Overview & Radar' },
                { id: 'academics', label: 'Academics & Attendance' },
                { id: 'placement', label: 'Placement & Skills' },
                { id: 'risks', label: 'Explainable Risk Evidence' },
                { id: 'interventions', label: `Interventions (${student?.interventions?.length || 0})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === t.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
            {loading && (
              <div className="py-20 text-center text-slate-500 text-sm">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Aggregating multi-source student records...
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading && student && (
              <>
                {/* TAB 1: 360° Overview & Radar */}
                {activeTab === '360' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Radar Chart Component Breakdown */}
                      <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-blue-600" />
                            Multi-Domain Competency Radar
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium">0 - 100 Scale</span>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#E2E8F0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                              <Radar
                                name="Student Profile"
                                dataKey="score"
                                stroke="#2563EB"
                                fill="#3B82F6"
                                fillOpacity={0.4}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Academic</span>
                            <span className="font-bold text-slate-800">{student.score_breakdown.academic_score ?? 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Attendance</span>
                            <span className="font-bold text-slate-800">{student.score_breakdown.attendance_score ?? 'N/A'}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Engagement</span>
                            <span className="font-bold text-slate-800">{student.score_breakdown.engagement_score ?? 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Placement</span>
                            <span className="font-bold text-slate-800">{student.score_breakdown.placement_score ?? 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Formula & Explainability Breakdown */}
                      <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-indigo-600" />
                            Score Engine Explainability
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">Weights Configured</span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 leading-relaxed">
                          <span className="text-blue-600 font-bold">Success Score</span> = 
                          (0.40 × Academic) + (0.20 × Attendance) + (0.15 × Engagement) + (0.25 × Placement)
                        </div>

                        {/* Positive & Negative Indicators */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Observed Signals</span>
                          {student.score_breakdown.positive_indicators.map((p, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{p}</span>
                            </div>
                          ))}
                          {student.score_breakdown.negative_indicators.map((n, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50/80 p-2 rounded-lg border border-rose-100">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span>{n}</span>
                            </div>
                          ))}
                        </div>

                        {/* Suggested Improvement Opportunities */}
                        {student.score_breakdown.improvement_opportunities.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              Actionable Growth Focus
                            </span>
                            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                              {student.score_breakdown.improvement_opportunities.map((opp, idx) => (
                                <li key={idx}>{opp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Historical Trends Longitudinal Strip */}
                    {student.trends && student.trends.length > 0 && (
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingDown className="w-4 h-4 text-amber-600" />
                            Proactive Trend Detection (Historical Delta)
                          </h4>
                          <span className="text-[11px] text-slate-400">Longitudinal Monitoring</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {student.trends.map((t, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border text-xs ${
                                t.direction === 'Declining'
                                  ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold mb-1">
                                <span>{t.indicator}</span>
                                <span className="font-mono text-xs">
                                  {t.delta > 0 ? `+${t.delta}` : t.delta} pts
                                </span>
                              </div>
                              <p className="text-[11px] opacity-90">{t.explanation}</p>
                              <p className="text-[11px] mt-1.5 font-medium underline">
                                Action: {t.suggested_action}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Academics & Attendance */}
                {activeTab === 'academics' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Academic Performance Card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        Academic Standing & Grades
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Cumulative GPA</span>
                          <span className="text-2xl font-bold font-mono text-slate-900">
                            {student.academic.cgpa ? student.academic.cgpa.toFixed(2) : 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Scale: 10.0</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Active Backlogs</span>
                          <span className={`text-2xl font-bold font-mono ${student.academic.backlogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {student.academic.backlogs}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {student.academic.backlogs > 0 ? 'Requires Clearance' : 'Clear Standing'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Internal Assessment</span>
                          <span className="text-2xl font-bold font-mono text-slate-900">
                            {student.academic.internal_marks ? student.academic.internal_marks.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Target: ≥ 60.0</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Prior Assessment</span>
                          <span className="text-2xl font-bold font-mono text-slate-600">
                            {student.academic.previous_internal_marks ? student.academic.previous_internal_marks.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Historical Baseline</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance & LMS Engagement Card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        Attendance & LMS Learning Habits
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Lecture Attendance</span>
                          <span className={`text-2xl font-bold font-mono ${
                            (student.attendance.attendance_percentage || 0) < 60
                              ? 'text-rose-600'
                              : (student.attendance.attendance_percentage || 0) < 75
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}>
                            {student.attendance.attendance_percentage ? `${student.attendance.attendance_percentage.toFixed(1)}%` : 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Min statutory: 75%</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Assignment Completion</span>
                          <span className="text-2xl font-bold font-mono text-slate-900">
                            {student.lms.assignment_completion ? `${student.lms.assignment_completion.toFixed(1)}%` : 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {student.lms.overdue_assignments} overdue
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Monthly LMS Logins</span>
                          <span className="text-2xl font-bold font-mono text-slate-900">
                            {student.lms.login_frequency}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Active Portal Logins</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-medium uppercase block">Weekly Activity</span>
                          <span className="text-2xl font-bold font-mono text-slate-900">
                            {student.lms.learning_activity_hours} hrs
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">Estimated self-study</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Placement & Skills */}
                {activeTab === 'placement' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Placement Scores Grid */}
                      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          Corporate Recruitment Assessment Matrix
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-500 font-medium block">Coding / DSA</span>
                            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                              {student.placement.coding_score ? student.placement.coding_score.toFixed(0) : 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-500 font-medium block">Aptitude</span>
                            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                              {student.placement.aptitude_score ? student.placement.aptitude_score.toFixed(0) : 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-500 font-medium block">Mock Interview</span>
                            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                              {student.placement.mock_interview_score ? student.placement.mock_interview_score.toFixed(0) : 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-500 font-medium block">Communication</span>
                            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                              {student.placement.communication_score ? student.placement.communication_score.toFixed(0) : 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>
                        </div>

                        {/* Co-curricular & Certifications */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">Extracurricular Engagement</span>
                            <span className="text-slate-500 text-[11px]">
                              {student.engagement.event_participation} campus events attended • {student.engagement.certifications} verified certifications
                            </span>
                          </div>
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-700">
                            {student.engagement.club_involvement}
                          </span>
                        </div>
                      </div>

                      {/* ML Placement Readiness Prediction Card */}
                      <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-xl shadow-lg border border-indigo-900/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-indigo-400" />
                            ML Placement Predictor
                          </h4>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                            Random Forest Model
                          </span>
                        </div>

                        {student.ml_placement_prediction ? (
                          <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-indigo-200">Historical Placement Clearance Odds:</span>
                              <span className="text-2xl font-bold font-mono text-white">
                                {student.ml_placement_prediction.placement_probability_pct}%
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  student.ml_placement_prediction.placement_probability >= 0.70
                                    ? 'bg-emerald-400'
                                    : student.ml_placement_prediction.placement_probability >= 0.45
                                    ? 'bg-amber-400'
                                    : 'bg-rose-400'
                                }`}
                                style={{ width: `${student.ml_placement_prediction.placement_probability_pct}%` }}
                              />
                            </div>

                            <div className="p-3 bg-indigo-950/60 border border-indigo-800/40 rounded-lg text-[11px] text-indigo-200 leading-relaxed">
                              <span className="font-semibold text-white">Readiness Tier: {student.ml_placement_prediction.predicted_readiness}</span>. {student.ml_placement_prediction.disclaimer}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-indigo-300">Predictive estimation pending assessment completion.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Explainable Risk Evidence */}
                {activeTab === 'risks' && (
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Triggered Institutional Risk Rules ({student.risk_assessment.triggered_rules.length})
                      </h4>

                      {student.risk_assessment.triggered_rules.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                          No risk rules triggered. Student is in satisfactory standing across academic and placement thresholds.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {student.risk_assessment.triggered_rules.map((rule, idx) => (
                            <div key={idx} className="py-3 flex items-start justify-between gap-4 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    rule.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {rule.severity} {rule.risk_category}
                                  </span>
                                  <span className="font-semibold text-slate-900">{rule.rule_name}</span>
                                </div>
                                <p className="text-slate-600 text-xs">{rule.message}</p>
                              </div>
                              <div className="text-right text-[11px] font-mono text-slate-500 shrink-0">
                                <div>Value: <span className="font-bold text-slate-800">{rule.current_value}</span></div>
                                <div>Threshold: {rule.threshold}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Supporting Evidence Statements */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Supporting Evidence Summary
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                        {student.risk_assessment.supporting_evidence.map((ev, idx) => (
                          <li key={idx}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 5: Interventions Timeline */}
                {activeTab === 'interventions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Assigned Institutional Interventions & Outcome History
                      </h4>
                      <button
                        onClick={handleOpenNewIntervention}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        + Assign New Support Plan
                      </button>
                    </div>

                    {student.interventions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                        No interventions currently assigned to this student. Click "+ Assign New Support Plan" to initiate mentoring or remedial coaching.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {student.interventions.map((inv) => (
                          <div
                            key={inv.id}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inv.priority === 'High'
                                    ? 'bg-rose-100 text-rose-800'
                                    : inv.priority === 'Medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {inv.priority}
                                </span>
                                <h5 className="font-bold text-xs text-slate-900">{inv.intervention_type}</h5>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  inv.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : inv.status === 'In Progress'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : inv.status === 'Assigned'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {inv.status}
                                </span>
                                <button
                                  onClick={() => handleEditIntervention(inv)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Edit Intervention / Update Outcome"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700">{inv.description}</p>

                            {/* Quantitative Outcome Proof if recorded */}
                            {inv.observed_change && (
                              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Outcome Tracker: {inv.observed_change}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                              <span>Mentor: <strong className="text-slate-700">{inv.assigned_to}</strong></span>
                              <span>Due: {inv.due_date || 'Unspecified'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit / Assign Intervention Modal */}
      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        studentId={studentId || ''}
        studentName={student?.name}
        existingIntervention={selectedIntervention}
        onSaved={handleInterventionSaved}
      />
    </>
  );
};

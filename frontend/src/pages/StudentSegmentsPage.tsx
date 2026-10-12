import React, { useEffect, useState } from 'react';
import {
  Layers,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Award,
  AlertTriangle,
  BookOpen,
  Activity,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { SegmentCardInfo } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { RiskBadge } from '../components/RiskBadge';

interface StudentSegmentsPageProps {
  onSelectStudent: (studentId: string) => void;
}

export const StudentSegmentsPage: React.FC<StudentSegmentsPageProps> = ({
  onSelectStudent
}) => {
  const [segments, setSegments] = useState<SegmentCardInfo[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string>('academic_achievers_placement_unready');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const data = await api.getSegments();
        setSegments(data);
        if (data.length > 0 && !data.some(s => s.segment_id === activeSegmentId)) {
          setActiveSegmentId(data[0].segment_id);
        }
      } catch (err) {
        console.error('Failed to load segments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, []);

  const activeSegment = segments.find((s) => s.segment_id === activeSegmentId) || segments[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Behavioral Segmentation & Pathways
          </span>
          <span className="text-xs text-slate-400">Institutional Strategy</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mt-1">
          Student Cohort Segmentation & Targeted Intervention Guide
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Students need different types of institutional support. Moving beyond blanket tutoring, CampusIQ identifies specific structural hurdles to deploy the right intervention at the right time.
        </p>
      </div>

      {/* Segment Cards Carousel/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Loading behavioral segments...
          </div>
        ) : (
          segments.map((seg) => {
            const isSelected = activeSegmentId === seg.segment_id;
            return (
              <div
                key={seg.segment_id}
                onClick={() => setActiveSegmentId(seg.segment_id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: seg.accent_color }}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black font-mono text-slate-900">
                      {seg.student_count}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: `${seg.accent_color}15`, color: seg.accent_color }}
                    >
                      {seg.percentage}% of cohort
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                    {seg.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                    {seg.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                  <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>
                    {isSelected ? 'Viewing Cohort' : 'Click to View'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Segment Deep-Dive Section */}
      {activeSegment && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Segment Details Bar */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeSegment.accent_color }}
                  />
                  <h2 className="text-base font-extrabold text-slate-900">
                    {activeSegment.title}
                  </h2>
                  <span className="text-xs font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700">
                    {activeSegment.student_count} Students ({activeSegment.percentage}%)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  {activeSegment.description}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 shrink-0">
                <span className="text-slate-400 text-[10px] block font-sans uppercase font-bold">Inclusion Criteria</span>
                {activeSegment.criteria}
              </div>
            </div>

            {/* Suggested Institutional Interventions */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Recommended Institutional Action Plan for this Cohort:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeSegment.suggested_interventions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 flex items-start gap-2 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matching Students List */}
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Students Belonging to this Behavioral Cohort
              </h3>
              <span className="text-xs text-slate-400">
                Sample cohort preview ({activeSegment.sample_students?.length || 0} students)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeSegment.sample_students || []).map((s) => (
                <div
                  key={s.student_id}
                  onClick={() => onSelectStudent(s.student_id)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer bg-white group space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {s.name}
                      </h4>
                      <span className="font-mono text-[11px] text-slate-500">
                        {s.student_id} • {s.department.replace('Engineering', 'Engg')}
                      </span>
                    </div>
                    <ScoreBadge score={s.success_score} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CGPA:</span>
                      <strong className="text-slate-800">{s.cgpa ? s.cgpa.toFixed(2) : '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Attendance:</span>
                      <strong className="text-slate-800">{s.attendance ? `${s.attendance.toFixed(1)}%` : '—'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <RiskBadge level={s.academic_risk} type="Academic" />
                    <button className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                      360° Profile <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

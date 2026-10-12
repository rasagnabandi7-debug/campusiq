import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { StudentListItem } from '../types';
import { api } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { RiskBadge } from '../components/RiskBadge';
import { UrgencyPill } from '../components/UrgencyPill';

interface StudentDirectoryProps {
  selectedDept: string;
  selectedYear: string;
  onSelectStudent: (studentId: string) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  selectedDept,
  selectedYear,
  onSelectStudent
}) => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [academicRisk, setAcademicRisk] = useState('');
  const [placementRisk, setPlacementRisk] = useState('');
  const [urgency, setUrgency] = useState('');
  const [segment, setSegment] = useState('');
  const [sortBy, setSortBy] = useState('student_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents({
        search: search || undefined,
        department: selectedDept || undefined,
        academic_year: selectedYear ? Number(selectedYear) : undefined,
        academic_risk: academicRisk || undefined,
        placement_risk: placementRisk || undefined,
        urgency: urgency || undefined,
        segment: segment || undefined,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setStudents(data.students);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [
    page,
    pageSize,
    search,
    selectedDept,
    selectedYear,
    academicRisk,
    placementRisk,
    urgency,
    segment,
    sortBy,
    sortOrder
  ]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Student ID (e.g. STU-1002) or Name..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Quick Clear */}
          {(academicRisk || placementRisk || urgency || segment || search) && (
            <button
              onClick={() => {
                setSearch('');
                setAcademicRisk('');
                setPlacementRisk('');
                setUrgency('');
                setSegment('');
                setPage(1);
              }}
              className="text-xs text-blue-600 font-semibold hover:underline shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Risk</label>
            <select
              value={academicRisk}
              onChange={(e) => { setAcademicRisk(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Academic</option>
              <option value="High">High Concern</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Placement Risk</label>
            <select
              value={placementRisk}
              onChange={(e) => { setPlacementRisk(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Placement</option>
              <option value="High">High Concern</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Follow-up Urgency</label>
            <select
              value={urgency}
              onChange={(e) => { setUrgency(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High Priority</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Behavioral Segment</label>
            <select
              value={segment}
              onChange={(e) => { setSegment(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Segments</option>
              <option value="Academic Achievers">Academic Achievers, Placement Unready</option>
              <option value="Academically At Risk">Academically At Risk</option>
              <option value="Engaged but Underperforming">Engaged but Underperforming</option>
              <option value="Low Recorded Engagement">Low Recorded Engagement</option>
              <option value="Consistent High Performers">Consistent High Performers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Enrolled Students Roster</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
              {total} matched
            </span>
          </div>
          <span className="text-xs text-slate-400">Click any row to inspect 360° Profile</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => handleSort('student_id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">Student ID <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">Name & Department <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('cgpa')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">CGPA <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('attendance')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">Attendance <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th
                  onClick={() => handleSort('success_score')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">Success Score <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3 px-4">Academic Risk</th>
                <th className="py-3 px-4">Placement Risk</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Support Cases</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching student cohort...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No students matching the selected criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s.student_id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 group-hover:underline">
                      {s.student_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {s.department} • Yr {s.academic_year}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {s.cgpa ? s.cgpa.toFixed(2) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${
                        (s.attendance_percentage || 0) < 60
                          ? 'text-rose-600'
                          : (s.attendance_percentage || 0) < 75
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}>
                        {s.attendance_percentage ? `${s.attendance_percentage.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <ScoreBadge score={s.success_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={s.academic_risk_level} type="Academic" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={s.placement_risk_level} type="Placement" />
                    </td>
                    <td className="py-3.5 px-4">
                      <UrgencyPill urgency={s.overall_urgency} />
                    </td>
                    <td className="py-3.5 px-4">
                      {s.open_interventions_count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <ClipboardList className="w-3 h-3" />
                          {s.open_interventions_count} Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s.student_id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-colors border border-blue-200 inline-flex items-center gap-1"
                      >
                        360° <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{students.length}</strong> of{' '}
            <strong className="text-slate-900">{total}</strong> students
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="px-2 font-mono font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 font-semibold"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

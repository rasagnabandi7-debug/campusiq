import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Calendar,
  User,
  Edit3,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Intervention } from '../types';
import { api } from '../services/api';
import { InterventionModal } from '../components/InterventionModal';

interface InterventionManagerProps {
  onSelectStudent: (studentId: string) => void;
}

export const InterventionManager: React.FC<InterventionManagerProps> = ({
  onSelectStudent
}) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const data = await api.getInterventions({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      setInterventions(data);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter, priorityFilter]);

  const handleCreateNew = () => {
    setEditingIntervention(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv: Intervention) => {
    setEditingIntervention(inv);
    setIsModalOpen(true);
  };

  const completedWithOutcomes = interventions.filter(
    (i) => i.status === 'Completed' && i.observed_change
  );

  const statuses = [
    { id: '', label: 'All Cases' },
    { id: 'Recommended', label: 'Recommended' },
    { id: 'Assigned', label: 'Assigned' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Follow-up Required', label: 'Follow-up Required' },
    { id: 'Completed', label: 'Completed' }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white border border-purple-900/40 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Intervention Management & Outcome Tracker
            </span>
            <span className="text-xs text-slate-400">Institutional Action Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Student Support Workflows & Efficacy Tracking
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Every detected risk must connect to actionable intervention. Faculty mentors assign targeted support, track review due dates, and record verified before-and-after student progress.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Assign New Intervention
        </button>
      </div>

      {/* Outcome Tracker Showcase Section */}
      {completedWithOutcomes.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-2xs space-y-3 bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Intervention Outcome Tracker
                </h3>
                <p className="text-[11px] text-slate-500">
                  Empirical before-and-after measurements documenting real student habit turnaround
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {completedWithOutcomes.length} Verified Turnarounds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {completedWithOutcomes.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onSelectStudent(inv.student_id)}
                className="p-3.5 rounded-xl border border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">
                      {inv.student_id}
                    </span>
                    <span className="font-bold text-xs text-slate-800">{inv.student_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({inv.department})</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {inv.observed_change}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Intervention: {inv.intervention_type} • Mentor: {inv.assigned_to}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Status Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase">Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Interventions Listing Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Intervention Type & Description</th>
                <th className="py-3 px-4">Mentor / Lead</th>
                <th className="py-3 px-4">Target Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Observed Outcome</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading support cases...
                  </td>
                </tr>
              ) : interventions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No intervention records match the selected filter.
                  </td>
                </tr>
              ) : (
                interventions.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => handleEdit(inv)}
                    className="hover:bg-purple-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.priority === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : inv.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inv.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {inv.student_name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {inv.student_id} • {inv.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-800">{inv.intervention_type}</div>
                      <p className="text-slate-500 text-[11px] line-clamp-2">{inv.description}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {inv.assigned_to}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {inv.due_date || 'Unspecified'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        inv.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                          : inv.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : inv.status === 'Assigned'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-[11px]">
                      {inv.observed_change ? (
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          {inv.observed_change}
                        </span>
                      ) : (
                        <span className="text-slate-400">Outcome pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(inv);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-purple-600 hover:text-white hover:bg-purple-600 border border-purple-200 rounded-md transition-colors"
                      >
                        Update / Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <InterventionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={editingIntervention?.student_id || 'STU-1002'}
        studentName={editingIntervention?.student_name}
        existingIntervention={editingIntervention}
        onSaved={fetchInterventions}
      />
    </div>
  );
};

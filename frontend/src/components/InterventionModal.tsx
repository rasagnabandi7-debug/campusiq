import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { Intervention } from '../types';
import { api } from '../services/api';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  existingIntervention?: Intervention | null;
  onSaved: () => void;
}

const INTERVENTION_TYPES = [
  'Faculty Mentoring',
  'Remedial Sessions',
  'Coding Bootcamp',
  'Attendance Monitoring',
  'Aptitude Coaching',
  'Mock Interview Prep',
  'Academic Recovery Plan'
];

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  existingIntervention,
  onSaved
}) => {
  const isEditing = Boolean(existingIntervention);

  const [type, setType] = useState(existingIntervention?.intervention_type || INTERVENTION_TYPES[0]);
  const [description, setDescription] = useState(existingIntervention?.description || '');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(existingIntervention?.priority || 'Medium');
  const [assignedTo, setAssignedTo] = useState(existingIntervention?.assigned_to || 'Faculty Advisor');
  const [dueDate, setDueDate] = useState(existingIntervention?.due_date || '');
  const [status, setStatus] = useState<string>(existingIntervention?.status || 'Assigned');
  const [notes, setNotes] = useState(existingIntervention?.notes || '');
  const [initialMetricType, setInitialMetricType] = useState(existingIntervention?.initial_metric_type || 'attendance');
  const [initialMetricVal, setInitialMetricVal] = useState<string>(
    existingIntervention?.initial_metric_val !== undefined && existingIntervention?.initial_metric_val !== null
      ? String(existingIntervention.initial_metric_val)
      : ''
  );
  const [outcomeMetricVal, setOutcomeMetricVal] = useState<string>(
    existingIntervention?.outcome_metric_val !== undefined && existingIntervention?.outcome_metric_val !== null
      ? String(existingIntervention.outcome_metric_val)
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && existingIntervention) {
        await api.updateIntervention(existingIntervention.id, {
          status,
          priority,
          due_date: dueDate || undefined,
          assigned_to: assignedTo,
          notes,
          outcome_metric_val: outcomeMetricVal ? Number(outcomeMetricVal) : undefined
        });
      } else {
        await api.createIntervention({
          student_id: studentId,
          intervention_type: type,
          description: description || `Targeted ${type} assigned to student ${studentId}.`,
          priority,
          assigned_to: assignedTo,
          due_date: dueDate || undefined,
          status,
          notes,
          initial_metric_type: initialMetricType,
          initial_metric_val: initialMetricVal ? Number(initialMetricVal) : undefined
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save intervention');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {isEditing ? 'Update Intervention Support Plan' : 'Assign Targeted Intervention'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Student: <span className="font-semibold text-white">{studentName || studentId}</span> ({studentId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Intervention Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isEditing}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {INTERVENTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Plan Objective</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isEditing}
              placeholder="e.g. 4-week remedial tutoring in Data Structures to clear backlogs..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Mentor</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Faculty Advisor"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Recommended">Recommended</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>
            </div>
          </div>

          {/* Outcome Measurement Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Outcome Measurement Tracker
              </span>
              <span className="text-[11px] text-slate-500">Before & After Quantitative Proof</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Tracked Metric</label>
                <select
                  value={initialMetricType}
                  onChange={(e) => setInitialMetricType(e.target.value)}
                  disabled={isEditing}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="attendance">Attendance (%)</option>
                  <option value="coding_score">Coding Score</option>
                  <option value="internal_marks">Internal Marks</option>
                  <option value="assignment_completion">Assignments (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Baseline Metric Value</label>
                <input
                  type="number"
                  step="0.1"
                  value={initialMetricVal}
                  onChange={(e) => setInitialMetricVal(e.target.value)}
                  disabled={isEditing}
                  placeholder="e.g. 54.0"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Outcome Post-Intervention</label>
                <input
                  type="number"
                  step="0.1"
                  value={outcomeMetricVal}
                  onChange={(e) => setOutcomeMetricVal(e.target.value)}
                  placeholder="e.g. 74.5"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {existingIntervention?.observed_change && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{existingIntervention.observed_change}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Notes / Progress Log</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record mentor discussion points, student response, or diagnostic findings..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Intervention' : 'Save & Assign'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

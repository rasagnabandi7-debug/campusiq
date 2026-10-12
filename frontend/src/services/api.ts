/**
 * CampusIQ Client API Service
 * Handles communication with backend REST endpoints with robust error handling.
 */
import {
  DashboardSummary,
  DashboardDistributions,
  StudentListItem,
  StudentDetail,
  Intervention,
  SegmentCardInfo,
  RadarAlertItem,
  CopilotResponse,
  MLModelInfo
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody || res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Health
  checkHealth: () => fetchJson<{ status: string; message: string }>('/health'),

  // Dashboard
  getDashboardSummary: (filters?: { department?: string; academic_year?: number; semester?: number }) => {
    const query = new URLSearchParams();
    if (filters?.department) query.append('department', filters.department);
    if (filters?.academic_year) query.append('academic_year', String(filters.academic_year));
    if (filters?.semester) query.append('semester', String(filters.semester));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<DashboardSummary>(`/dashboard/summary${qs}`);
  },

  getDashboardDistributions: (filters?: { department?: string; academic_year?: number; semester?: number }) => {
    const query = new URLSearchParams();
    if (filters?.department) query.append('department', filters.department);
    if (filters?.academic_year) query.append('academic_year', String(filters.academic_year));
    if (filters?.semester) query.append('semester', String(filters.semester));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<DashboardDistributions>(`/dashboard/distributions${qs}`);
  },

  // Students
  getStudents: (params?: {
    search?: string;
    department?: string;
    academic_year?: number;
    academic_risk?: string;
    placement_risk?: string;
    segment?: string;
    urgency?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      students: StudentListItem[];
    }>(`/students${qs}`);
  },

  getStudentProfile: (studentId: string) => fetchJson<StudentDetail>(`/students/${studentId}`),

  // Alerts / Radar
  getEarlyWarnings: (filters?: { department?: string; urgency?: string; risk_type?: string }) => {
    const query = new URLSearchParams();
    if (filters?.department) query.append('department', filters.department);
    if (filters?.urgency) query.append('urgency', filters.urgency);
    if (filters?.risk_type) query.append('risk_type', filters.risk_type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{
      total_alerts: number;
      critical_count: number;
      high_count: number;
      moderate_count: number;
      alerts: RadarAlertItem[];
    }>(`/alerts${qs}`);
  },

  // Segments
  getSegments: () => fetchJson<SegmentCardInfo[]>('/segments'),

  // Interventions
  getInterventions: (filters?: { status?: string; priority?: string; student_id?: string }) => {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.priority) query.append('priority', filters.priority);
    if (filters?.student_id) query.append('student_id', filters.student_id);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Intervention[]>(`/interventions${qs}`);
  },

  createIntervention: (payload: {
    student_id: string;
    intervention_type: string;
    description: string;
    priority?: string;
    assigned_to?: string;
    due_date?: string;
    status?: string;
    notes?: string;
    initial_metric_type?: string;
    initial_metric_val?: number;
  }) => {
    return fetchJson<Intervention>('/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  updateIntervention: (id: number, payload: {
    status?: string;
    priority?: string;
    due_date?: string;
    assigned_to?: string;
    notes?: string;
    outcome_metric_val?: number;
  }) => {
    return fetchJson<Intervention>(`/interventions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  // Copilot
  queryCopilot: (query: string) => {
    return fetchJson<CopilotResponse>('/copilot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
  },

  getCopilotSuggestions: () => fetchJson<{ suggestions: string[] }>('/copilot/suggestions'),

  // ML Model
  getMLModelInfo: () => fetchJson<MLModelInfo>('/ml/model-info'),

  // Data Quality & Upload
  getDataQuality: () => fetchJson<any>('/data/quality'),

  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/data/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('File upload audit failed');
    return res.json();
  }
};

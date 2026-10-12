/**
 * CampusIQ TypeScript Domain Interfaces
 */

export interface FormulaWeights {
  Academic?: number;
  Attendance?: number;
  Engagement?: number;
  Placement?: number;
  [key: string]: number | undefined;
}

export interface ScoreBreakdown {
  overall_success_score: number | null;
  academic_score: number | null;
  attendance_score: number | null;
  engagement_score: number | null;
  placement_score: number | null;
  is_provisional: boolean;
  completeness_percentage: number;
  status_label: string;
  formula_weights: FormulaWeights;
  positive_indicators: string[];
  negative_indicators: string[];
  missing_indicators: string[];
  improvement_opportunities: string[];
}

export interface RiskRuleTrigger {
  rule_name: string;
  risk_category: 'Academic' | 'Placement';
  severity: 'High' | 'Moderate';
  current_value: string | number;
  threshold: string | number;
  message: string;
}

export interface RiskAssessment {
  academic_risk_level: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  placement_risk_level: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  overall_urgency: 'Critical' | 'High' | 'Moderate' | 'Low';
  triggered_rules: RiskRuleTrigger[];
  supporting_evidence: string[];
  recommended_actions: string[];
  data_completeness: number;
  evaluated_at: string;
}

export interface TrendAlert {
  indicator: string;
  previous_value: number;
  current_value: number;
  delta: number;
  direction: 'Declining' | 'Improving' | 'Stable';
  severity: 'Critical' | 'Warning' | 'Positive' | 'Neutral';
  explanation: string;
  suggested_action: string;
}

export interface StudentListItem {
  student_id: string;
  name: string;
  department: string;
  academic_year: number;
  semester: number;
  cgpa: number | null;
  attendance_percentage: number | null;
  success_score: number | null;
  academic_risk_level: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  placement_risk_level: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  overall_urgency: 'Critical' | 'High' | 'Moderate' | 'Low';
  segments: string[];
  open_interventions_count: number;
}

export interface StudentDetail extends StudentListItem {
  email: string | null;
  section: string | null;
  academic: {
    cgpa: number | null;
    internal_marks: number | null;
    previous_internal_marks: number | null;
    backlogs: number;
  };
  attendance: {
    attendance_percentage: number | null;
    previous_attendance: number | null;
  };
  lms: {
    login_frequency: number;
    assignment_completion: number | null;
    previous_assignment_completion: number | null;
    overdue_assignments: number;
    learning_activity_hours: number;
  };
  placement: {
    aptitude_score: number | null;
    coding_score: number | null;
    previous_coding_score: number | null;
    mock_interview_score: number | null;
    communication_score: number | null;
    resume_readiness: number;
  };
  engagement: {
    event_participation: number;
    hackathons: number;
    certifications: number;
    club_involvement: string;
  };
  score_breakdown: ScoreBreakdown;
  risk_assessment: RiskAssessment;
  trends: TrendAlert[];
  ml_placement_prediction?: {
    placement_probability: number;
    placement_probability_pct: number;
    predicted_readiness: 'High' | 'Moderate' | 'Low';
    is_ready: boolean;
    disclaimer: string;
  };
  interventions: Intervention[];
}

export interface Intervention {
  id: number;
  student_id: string;
  student_name?: string;
  department?: string;
  intervention_type: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  assigned_to: string;
  due_date: string | null;
  status: 'Recommended' | 'Assigned' | 'In Progress' | 'Completed' | 'Follow-up Required';
  created_at: string;
  updated_at: string;
  notes: string | null;
  initial_metric_type?: string | null;
  initial_metric_val?: number | null;
  outcome_metric_val?: number | null;
  observed_change?: string | null;
}

export interface DashboardSummary {
  total_students: number;
  average_success_score: number;
  academic_risk_count: number;
  academic_risk_percentage: number;
  placement_risk_count: number;
  placement_risk_percentage: number;
  open_interventions: number;
  completed_interventions: number;
  data_coverage_percentage: number;
  priority_actions_count: number;
}

export interface PriorityActionItem {
  student_id: string;
  name: string;
  department: string;
  academic_risk: string;
  placement_risk: string;
  urgency: string;
  success_score: number | null;
  primary_reason: string;
  recommended_action: string;
}

export interface DashboardDistributions {
  score_distribution: { range: string; count: number }[];
  academic_risk_distribution: { level: string; count: number }[];
  placement_risk_distribution: { level: string; count: number }[];
  department_performance: {
    department: string;
    full_name: string;
    student_count: number;
    avg_success_score: number;
    avg_cgpa: number;
    avg_attendance: number;
    at_risk_students: number;
  }[];
  segment_distribution: { segment: string; count: number; percentage: number }[];
  priority_actions: PriorityActionItem[];
}

export interface SegmentCardInfo {
  segment_id: string;
  title: string;
  student_count: number;
  percentage: number;
  description: string;
  criteria: string;
  suggested_interventions: string[];
  accent_color: string;
  sample_students?: any[];
}

export interface RadarAlertItem {
  student_id: string;
  name: string;
  department: string;
  academic_year: number;
  success_score: number | null;
  academic_risk: string;
  placement_risk: string;
  urgency: 'Critical' | 'High' | 'Moderate' | 'Low';
  triggered_rules: RiskRuleTrigger[];
  primary_indicator: string;
  recommended_action: string;
  intervention_status: string;
  existing_interventions_count: number;
}

export interface CopilotResponse {
  query: string;
  category: string;
  answer_text: string;
  supporting_metrics: Record<string, any>;
  matched_students: any[];
  recommended_next_steps: string[];
}

export interface MLModelInfo {
  is_trained: boolean;
  algorithm: string;
  train_samples: number;
  test_samples: number;
  total_labeled_samples: number;
  metrics: {
    accuracy: number;
    baseline_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  feature_importances: { feature: string; importance: number; percentage: number }[];
  features_used: string[];
  target_variable: string;
  limitations: string[];
}

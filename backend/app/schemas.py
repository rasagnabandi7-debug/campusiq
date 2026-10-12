"""
CampusIQ Pydantic Schemas
Defines request and response data contracts for API endpoints.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class StudentBase(BaseModel):
    student_id: str
    name: str
    email: Optional[str] = None
    department: str
    academic_year: int
    semester: int
    section: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class AcademicData(BaseModel):
    cgpa: Optional[float] = None
    internal_marks: Optional[float] = None
    previous_internal_marks: Optional[float] = None
    backlogs: int = 0
    assessment_date: Optional[datetime] = None

class AttendanceData(BaseModel):
    attendance_percentage: Optional[float] = None
    previous_attendance: Optional[float] = None
    record_date: Optional[datetime] = None

class LMSData(BaseModel):
    login_frequency: int = 0
    assignment_completion: Optional[float] = None
    previous_assignment_completion: Optional[float] = None
    overdue_assignments: int = 0
    learning_activity_hours: float = 0.0
    record_date: Optional[datetime] = None

class PlacementData(BaseModel):
    aptitude_score: Optional[float] = None
    coding_score: Optional[float] = None
    previous_coding_score: Optional[float] = None
    mock_interview_score: Optional[float] = None
    communication_score: Optional[float] = None
    resume_readiness: float = 50.0
    placed_outcome: Optional[int] = None
    assessment_date: Optional[datetime] = None

class EngagementData(BaseModel):
    event_participation: int = 0
    hackathons: int = 0
    certifications: int = 0
    club_involvement: Optional[str] = None

class ScoreBreakdown(BaseModel):
    overall_success_score: Optional[float] = None
    academic_score: Optional[float] = None
    attendance_score: Optional[float] = None
    engagement_score: Optional[float] = None
    placement_score: Optional[float] = None
    is_provisional: bool = False
    completeness_percentage: float = 100.0
    status_label: str = "Complete"
    formula_weights: Dict[str, float]
    positive_indicators: List[str] = []
    negative_indicators: List[str] = []
    missing_indicators: List[str] = []
    improvement_opportunities: List[str] = []

class RiskRuleTrigger(BaseModel):
    rule_name: str
    risk_category: str  # "Academic" or "Placement"
    severity: str       # "High" or "Moderate"
    current_value: Any
    threshold: Any
    message: str

class RiskAssessment(BaseModel):
    academic_risk_level: str       # "High", "Moderate", "Low", "Insufficient Data"
    placement_risk_level: str      # "High", "Moderate", "Low", "Insufficient Data"
    overall_urgency: str           # "Critical", "High", "Moderate", "Low"
    triggered_rules: List[RiskRuleTrigger] = []
    supporting_evidence: List[str] = []
    recommended_actions: List[str] = []
    data_completeness: float = 100.0
    evaluated_at: str

class TrendAlert(BaseModel):
    indicator: str
    previous_value: float
    current_value: float
    delta: float
    direction: str                 # "Declining", "Improving", "Stable"
    severity: str                  # "Critical", "Warning", "Positive", "Neutral"
    explanation: str
    suggested_action: str

class StudentSummary(BaseModel):
    student_id: str
    name: str
    department: str
    academic_year: int
    semester: int
    cgpa: Optional[float]
    attendance_percentage: Optional[float]
    success_score: Optional[float]
    academic_risk_level: str
    placement_risk_level: str
    overall_urgency: str
    segments: List[str]
    open_interventions_count: int

class StudentDetail(StudentSummary):
    email: Optional[str]
    section: Optional[str]
    academic: AcademicData
    attendance: AttendanceData
    lms: LMSData
    placement: PlacementData
    engagement: EngagementData
    score_breakdown: ScoreBreakdown
    risk_assessment: RiskAssessment
    trends: List[TrendAlert]
    interventions: List[Any] = []

class InterventionCreate(BaseModel):
    student_id: str
    intervention_type: str
    description: str
    priority: str = "Medium"
    assigned_to: str = "Faculty Advisor"
    due_date: Optional[str] = None
    status: str = "Recommended"
    notes: Optional[str] = None
    initial_metric_type: Optional[str] = None
    initial_metric_val: Optional[float] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    outcome_metric_val: Optional[float] = None
    observed_change: Optional[str] = None

class InterventionOut(BaseModel):
    id: int
    student_id: str
    student_name: Optional[str] = None
    department: Optional[str] = None
    intervention_type: str
    description: str
    priority: str
    assigned_to: str
    due_date: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    notes: Optional[str]
    initial_metric_type: Optional[str]
    initial_metric_val: Optional[float]
    outcome_metric_val: Optional[float]
    observed_change: Optional[str]

    class Config:
        from_attributes = True

class SegmentInfo(BaseModel):
    segment_id: str
    title: str
    student_count: int
    percentage: float
    description: str
    criteria: str
    suggested_interventions: List[str]
    accent_color: str

class DashboardSummary(BaseModel):
    total_students: int
    average_success_score: float
    academic_risk_count: int
    academic_risk_percentage: float
    placement_risk_count: int
    placement_risk_percentage: float
    open_interventions: int
    completed_interventions: int
    data_coverage_percentage: float
    priority_actions_count: int

class CopilotQueryRequest(BaseModel):
    query: str

class CopilotResponse(BaseModel):
    query: str
    answer_text: str
    supporting_metrics: Dict[str, Any]
    matched_students: List[Dict[str, Any]] = []
    recommended_next_steps: List[str] = []
    category: str

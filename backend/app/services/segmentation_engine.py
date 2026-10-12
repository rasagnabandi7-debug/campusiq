"""
CampusIQ Student Segmentation Engine
Classifies students into meaningful behavioral cohorts with explainable rationale
and tailored institutional interventions.
"""
from typing import Optional, List, Dict, Any
from ..schemas import SegmentInfo

SEGMENT_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "segment_id": "academic_achievers_placement_unready",
        "title": "Academic Achievers, Placement Unready",
        "description": "High academic performers who lag in competitive programming and interview readiness.",
        "criteria": "CGPA >= 7.5 or Academic Score >= 75, with Placement Score < 55 or Coding < 50.",
        "suggested_interventions": [
            "Enroll in accelerated DSA & Competitive Coding Bootcamp",
            "Schedule technical mock interview with industry alumnus",
            "Assign weekly HackerRank/LeetCode problem sprints"
        ],
        "accent_color": "#D97706" # Amber
    },
    {
        "segment_id": "academically_at_risk",
        "title": "Academically At Risk",
        "description": "Students facing severe academic distress with low internal marks, active backlogs, or poor attendance.",
        "criteria": "Academic Score < 50 or Attendance < 65% or Backlogs >= 1.",
        "suggested_interventions": [
            "Assign dedicated faculty academic mentor",
            "Enroll in subject-specific remedial clinic",
            "Draft personalized 4-week backlog recovery contract"
        ],
        "accent_color": "#E11D48" # Rose/Red
    },
    {
        "segment_id": "engaged_underperforming",
        "title": "Engaged but Underperforming",
        "description": "Diligent students with strong attendance and LMS participation who struggle to translate effort into exam marks.",
        "criteria": "Engagement >= 60 and Attendance >= 75%, with Internal Marks < 55 or CGPA < 6.5.",
        "suggested_interventions": [
            "Conduct diagnostic conceptual deficit assessment",
            "Pair with senior peer tutor for problem-solving techniques",
            "Review learning strategy and exam-taking methodology"
        ],
        "accent_color": "#7C3AED" # Purple
    },
    {
        "segment_id": "low_recorded_engagement",
        "title": "Low Recorded Engagement",
        "description": "Students with sparse LMS activity, low attendance, and overdue submissions requiring compassionate outreach.",
        "criteria": "Attendance < 65% and LMS Logins < 10 and Assignment Completion < 50%.",
        "suggested_interventions": [
            "Schedule empathetic 1-on-1 faculty wellness check-in",
            "Investigate external barriers (health, connectivity, personal)",
            "Establish structured weekly learning re-engagement goals"
        ],
        "accent_color": "#F59E0B" # Yellow/Amber
    },
    {
        "segment_id": "consistent_high_performers",
        "title": "Consistent High Performers",
        "description": "All-round stellar achievers excelling across academics, attendance, and placement domains.",
        "criteria": "CGPA >= 8.5 and Attendance >= 85% and Placement Score >= 75.",
        "suggested_interventions": [
            "Nominate for department honors and research assistantships",
            "Connect with tier-1 corporate recruitment fast-track",
            "Engage as peer mentors for junior cohorts"
        ],
        "accent_color": "#0D9488" # Teal
    }
]

def classify_student_segments(
    cgpa: Optional[float],
    internal_marks: Optional[float],
    backlogs: int,
    attendance_pct: Optional[float],
    assignment_completion: Optional[float],
    login_frequency: Optional[int],
    coding_score: Optional[float],
    academic_score: Optional[float],
    engagement_score: Optional[float],
    placement_score: Optional[float]
) -> List[str]:
    """
    Evaluates segment inclusion criteria for a student.
    Returns list of matched segment titles.
    """
    matched: List[str] = []

    # Segment 1: Academic Achievers, Placement Unready
    is_high_academic = (cgpa is not None and cgpa >= 7.5) or (academic_score is not None and academic_score >= 72.0)
    is_low_placement = (coding_score is not None and coding_score < 52.0) or (placement_score is not None and placement_score < 55.0)
    if is_high_academic and is_low_placement:
        matched.append("Academic Achievers, Placement Unready")

    # Segment 2: Academically At Risk
    if (academic_score is not None and academic_score < 50.0) or \
       (attendance_pct is not None and attendance_pct < 65.0) or \
       (backlogs >= 1):
        matched.append("Academically At Risk")

    # Segment 3: Engaged but Underperforming
    is_engaged = (engagement_score is not None and engagement_score >= 60.0) or \
                 (attendance_pct is not None and attendance_pct >= 75.0 and assignment_completion is not None and assignment_completion >= 65.0)
    is_underperforming = (internal_marks is not None and internal_marks < 55.0) or (cgpa is not None and cgpa < 6.5)
    if is_engaged and is_underperforming:
        matched.append("Engaged but Underperforming")

    # Segment 4: Low Recorded Engagement
    if (attendance_pct is not None and attendance_pct < 65.0) and \
       ((login_frequency is not None and login_frequency < 10) or (assignment_completion is not None and assignment_completion < 50.0)):
        matched.append("Low Recorded Engagement")

    # Segment 5: Consistent High Performers
    if (cgpa is not None and cgpa >= 8.2) and \
       (attendance_pct is not None and attendance_pct >= 82.0) and \
       (placement_score is not None and placement_score >= 72.0):
        matched.append("Consistent High Performers")

    if not matched:
        matched.append("Standard Progressing")

    return matched

def get_all_segment_metadata() -> List[Dict[str, Any]]:
    """Returns static segment definition catalogue."""
    return SEGMENT_DEFINITIONS

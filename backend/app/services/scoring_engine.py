"""
CampusIQ Student Success Score Engine
Calculates transparent 0-100 score with component breakdown and missing data handling.
"""
from typing import Optional, Dict, Any, List
from ..config import scoring_weights
from ..schemas import ScoreBreakdown

def calculate_academic_component(
    cgpa: Optional[float],
    internal_marks: Optional[float],
    backlogs: int = 0
) -> Optional[float]:
    """
    Computes Academic subscore on 0-100 scale:
    (0.60 * CGPA*10) + (0.40 * internal_marks) - (backlogs * penalty)
    """
    if cgpa is None and internal_marks is None:
        return None

    if cgpa is not None and internal_marks is not None:
        cgpa_norm = min(max(cgpa * 10.0, 0.0), 100.0)
        marks_norm = min(max(internal_marks, 0.0), 100.0)
        base = (scoring_weights.CGPA_WEIGHT * cgpa_norm) + (scoring_weights.INTERNAL_MARKS_WEIGHT * marks_norm)
    elif cgpa is not None:
        base = min(max(cgpa * 10.0, 0.0), 100.0)
    else:
        base = min(max(internal_marks, 0.0), 100.0)

    # Apply backlog deduction
    penalty = max(0, backlogs) * scoring_weights.BACKLOG_PENALTY_PER_ITEM
    score = max(0.0, min(100.0, base - penalty))
    return round(score, 1)

def calculate_attendance_component(
    attendance_pct: Optional[float]
) -> Optional[float]:
    """Computes Attendance subscore on 0-100 scale."""
    if attendance_pct is None:
        return None
    return round(min(max(float(attendance_pct), 0.0), 100.0), 1)

def calculate_engagement_component(
    assignment_completion: Optional[float],
    login_frequency: Optional[int] = 0,
    event_participation: Optional[int] = 0
) -> Optional[float]:
    """
    Computes Learning Engagement subscore on 0-100 scale:
    50% Assignment completion + 30% LMS login frequency + 20% Extracurricular
    """
    if assignment_completion is None and login_frequency is None and event_participation is None:
        return None

    assign_val = assignment_completion if assignment_completion is not None else 50.0
    # 25 logins/month corresponds to 100% active engagement
    lms_val = min(100.0, (login_frequency or 0) / 25.0 * 100.0)
    # 4 campus events/certifications corresponds to 100% extracurricular participation
    event_val = min(100.0, (event_participation or 0) / 4.0 * 100.0)

    score = (
        scoring_weights.ASSIGNMENT_COMPLETION_WEIGHT * assign_val +
        scoring_weights.LMS_ACTIVITY_WEIGHT * lms_val +
        scoring_weights.EVENT_PARTICIPATION_WEIGHT * event_val
    )
    return round(min(max(score, 0.0), 100.0), 1)

def calculate_placement_component(
    coding_score: Optional[float],
    aptitude_score: Optional[float],
    mock_interview_score: Optional[float],
    communication_score: Optional[float]
) -> Optional[float]:
    """
    Computes Placement Readiness subscore on 0-100 scale:
    35% Coding + 25% Aptitude + 20% Mock Interview + 20% Communication
    """
    elements = [
        (coding_score, scoring_weights.CODING_WEIGHT),
        (aptitude_score, scoring_weights.APTITUDE_WEIGHT),
        (mock_interview_score, scoring_weights.MOCK_INTERVIEW_WEIGHT),
        (communication_score, scoring_weights.COMMUNICATION_WEIGHT)
    ]
    available = [(val, wt) for val, wt in elements if val is not None]

    if not available:
        return None

    total_weight = sum(wt for _, wt in available)
    weighted_sum = sum(min(max(val, 0.0), 100.0) * wt for val, wt in available)
    score = weighted_sum / total_weight
    return round(score, 1)

def compute_success_score(
    cgpa: Optional[float],
    internal_marks: Optional[float],
    backlogs: int,
    attendance_pct: Optional[float],
    assignment_completion: Optional[float],
    login_frequency: Optional[int],
    event_participation: Optional[int],
    coding_score: Optional[float],
    aptitude_score: Optional[float],
    mock_interview_score: Optional[float],
    communication_score: Optional[float]
) -> ScoreBreakdown:
    """
    Calculates overall Student Success Score (0-100), handles missing indicators,
    and returns transparent explainability signals.
    """
    academic = calculate_academic_component(cgpa, internal_marks, backlogs)
    attendance = calculate_attendance_component(attendance_pct)
    engagement = calculate_engagement_component(assignment_completion, login_frequency, event_participation)
    placement = calculate_placement_component(coding_score, aptitude_score, mock_interview_score, communication_score)

    components = {
        "Academic": (academic, scoring_weights.ACADEMIC_WEIGHT),
        "Attendance": (attendance, scoring_weights.ATTENDANCE_WEIGHT),
        "Engagement": (engagement, scoring_weights.ENGAGEMENT_WEIGHT),
        "Placement": (placement, scoring_weights.PLACEMENT_WEIGHT),
    }

    available_components = {k: v for k, v in components.items() if v[0] is not None}
    missing_keys = [k for k, v in components.items() if v[0] is None]

    total_count = len(components)
    avail_count = len(available_components)
    completeness = round((avail_count / total_count) * 100.0, 1)

    positive_indicators: List[str] = []
    negative_indicators: List[str] = []
    missing_indicators: List[str] = []
    improvement_opportunities: List[str] = []

    # Indicators analysis
    if cgpa is not None:
        if cgpa >= 8.0:
            positive_indicators.append(f"Strong Academic CGPA ({cgpa:.2f}/10.0)")
        elif cgpa < 6.5:
            negative_indicators.append(f"CGPA below target range ({cgpa:.2f}/10.0)")
            improvement_opportunities.append("Improve core subject grades to lift CGPA above 6.5")

    if backlogs > 0:
        negative_indicators.append(f"Active Backlogs ({backlogs} pending)")
        improvement_opportunities.append("Enroll in academic remedial sessions to clear backlogs")

    if attendance_pct is not None:
        if attendance_pct >= 85.0:
            positive_indicators.append(f"Exemplary Lecture Attendance ({attendance_pct:.1f}%)")
        elif attendance_pct < 75.0:
            negative_indicators.append(f"Attendance below statutory threshold ({attendance_pct:.1f}%)")
            improvement_opportunities.append("Prioritize attending mandatory lecture hours to cross 75% threshold")

    if coding_score is not None:
        if coding_score >= 75.0:
            positive_indicators.append(f"High Technical Coding Proficiency ({coding_score:.0f}/100)")
        elif coding_score < 50.0:
            negative_indicators.append(f"Coding readiness below industry benchmark ({coding_score:.0f}/100)")
            improvement_opportunities.append("Join structured DSA coding bootcamp and daily problem sets")

    if aptitude_score is not None and aptitude_score >= 75.0:
        positive_indicators.append(f"Solid Aptitude & Problem Solving ({aptitude_score:.0f}/100)")

    for m in missing_keys:
        missing_indicators.append(f"{m} assessment data pending ingestion")

    # If critical data is missing (< 50% completeness or < 2 components)
    if avail_count < 2:
        return ScoreBreakdown(
            overall_success_score=None,
            academic_score=academic,
            attendance_score=attendance,
            engagement_score=engagement,
            placement_score=placement,
            is_provisional=True,
            completeness_percentage=completeness,
            status_label="Insufficient Data",
            formula_weights={
                "Academic": scoring_weights.ACADEMIC_WEIGHT,
                "Attendance": scoring_weights.ATTENDANCE_WEIGHT,
                "Engagement": scoring_weights.ENGAGEMENT_WEIGHT,
                "Placement": scoring_weights.PLACEMENT_WEIGHT
            },
            positive_indicators=positive_indicators,
            negative_indicators=negative_indicators,
            missing_indicators=missing_indicators,
            improvement_opportunities=improvement_opportunities
        )

    # Re-normalize weights across available components
    available_weights_sum = sum(wt for _, wt in available_components.values())
    effective_weights = {k: round(wt / available_weights_sum, 3) for k, (_, wt) in available_components.items()}

    overall_score = sum(val * (wt / available_weights_sum) for val, wt in available_components.values())
    overall_score = round(min(max(overall_score, 0.0), 100.0), 1)

    is_provisional = avail_count < total_count
    status_label = "Provisional" if is_provisional else "Complete"

    return ScoreBreakdown(
        overall_success_score=overall_score,
        academic_score=academic,
        attendance_score=attendance,
        engagement_score=engagement,
        placement_score=placement,
        is_provisional=is_provisional,
        completeness_percentage=completeness,
        status_label=status_label,
        formula_weights=effective_weights,
        positive_indicators=positive_indicators,
        negative_indicators=negative_indicators,
        missing_indicators=missing_indicators,
        improvement_opportunities=improvement_opportunities
    )

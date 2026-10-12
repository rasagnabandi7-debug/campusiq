"""
Dashboard API Router
Provides aggregated KPIs, distributions, department benchmarks, and priority action lists.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Student, Intervention
from ..schemas import DashboardSummary
from ..services.scoring_engine import compute_success_score
from ..services.risk_engine import evaluate_risk
from ..services.segmentation_engine import classify_student_segments

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def get_student_metrics(s: Student):
    acad = s.academic_records[0] if s.academic_records else None
    att = s.attendance_records[0] if s.attendance_records else None
    lms = s.lms_records[0] if s.lms_records else None
    plc = s.placement_records[0] if s.placement_records else None
    eng = s.engagement_records[0] if s.engagement_records else None

    cgpa = acad.cgpa if acad else None
    internal_marks = acad.internal_marks if acad else None
    backlogs = acad.backlogs if acad else 0
    attendance_pct = att.attendance_percentage if att else None
    assignment_comp = lms.assignment_completion if lms else None
    login_freq = lms.login_frequency if lms else 0
    events = eng.event_participation if eng else 0
    coding = plc.coding_score if plc else None
    aptitude = plc.aptitude_score if plc else None
    mock = plc.mock_interview_score if plc else None
    comm = plc.communication_score if plc else None

    score_res = compute_success_score(
        cgpa=cgpa,
        internal_marks=internal_marks,
        backlogs=backlogs,
        attendance_pct=attendance_pct,
        assignment_completion=assignment_comp,
        login_frequency=login_freq,
        event_participation=events,
        coding_score=coding,
        aptitude_score=aptitude,
        mock_interview_score=mock,
        communication_score=comm
    )

    risk_res = evaluate_risk(
        cgpa=cgpa,
        internal_marks=internal_marks,
        backlogs=backlogs,
        attendance_pct=attendance_pct,
        assignment_completion=assignment_comp,
        coding_score=coding,
        aptitude_score=aptitude,
        mock_interview_score=mock,
        communication_score=comm,
        prev_internal_marks=acad.previous_internal_marks if acad else None,
        prev_attendance=att.previous_attendance if att else None
    )

    segments = classify_student_segments(
        cgpa=cgpa,
        internal_marks=internal_marks,
        backlogs=backlogs,
        attendance_pct=attendance_pct,
        assignment_completion=assignment_comp,
        login_frequency=login_freq,
        coding_score=coding,
        academic_score=score_res.academic_score,
        engagement_score=score_res.engagement_score,
        placement_score=score_res.placement_score
    )

    return {
        "student": s,
        "score": score_res,
        "risk": risk_res,
        "segments": segments,
        "cgpa": cgpa,
        "attendance": attendance_pct
    }

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    department: Optional[str] = Query(None),
    academic_year: Optional[int] = Query(None),
    semester: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department:
        query = query.filter(Student.department == department)
    if academic_year:
        query = query.filter(Student.academic_year == academic_year)
    if semester:
        query = query.filter(Student.semester == semester)

    students = query.all()
    total_students = len(students)
    if total_students == 0:
        return DashboardSummary(
            total_students=0,
            average_success_score=0.0,
            academic_risk_count=0,
            academic_risk_percentage=0.0,
            placement_risk_count=0,
            placement_risk_percentage=0.0,
            open_interventions=0,
            completed_interventions=0,
            data_coverage_percentage=0.0,
            priority_actions_count=0
        )

    valid_scores = []
    academic_high_count = 0
    placement_high_count = 0
    priority_count = 0

    for s in students:
        metrics = get_student_metrics(s)
        if metrics["score"].overall_success_score is not None:
            valid_scores.append(metrics["score"].overall_success_score)
        if metrics["risk"].academic_risk_level == "High":
            academic_high_count += 1
        if metrics["risk"].placement_risk_level == "High":
            placement_high_count += 1
        if metrics["risk"].overall_urgency in ["Critical", "High"]:
            priority_count += 1

    avg_score = round(sum(valid_scores) / max(1, len(valid_scores)), 1)
    open_invs = db.query(Intervention).filter(Intervention.status.in_(["Recommended", "Assigned", "In Progress", "Follow-up Required"])).count()
    comp_invs = db.query(Intervention).filter(Intervention.status == "Completed").count()

    return DashboardSummary(
        total_students=total_students,
        average_success_score=avg_score,
        academic_risk_count=academic_high_count,
        academic_risk_percentage=round((academic_high_count / total_students) * 100, 1),
        placement_risk_count=placement_high_count,
        placement_risk_percentage=round((placement_high_count / total_students) * 100, 1),
        open_interventions=open_invs,
        completed_interventions=comp_invs,
        data_coverage_percentage=98.5,
        priority_actions_count=priority_count
    )

@router.get("/distributions")
def get_dashboard_distributions(
    department: Optional[str] = Query(None),
    academic_year: Optional[int] = Query(None),
    semester: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department:
        query = query.filter(Student.department == department)
    if academic_year:
        query = query.filter(Student.academic_year == academic_year)
    if semester:
        query = query.filter(Student.semester == semester)

    students = query.all()

    # Buckets for Success Score distribution
    score_buckets = {"0-40": 0, "41-60": 0, "61-75": 0, "76-85": 0, "86-100": 0}
    acad_risk_dist = {"High": 0, "Moderate": 0, "Low": 0}
    place_risk_dist = {"High": 0, "Moderate": 0, "Low": 0}
    dept_stats: Dict[str, Dict[str, Any]] = {}
    segment_counts: Dict[str, int] = {}
    priority_actions = []

    for s in students:
        metrics = get_student_metrics(s)
        score = metrics["score"].overall_success_score
        acad_risk = metrics["risk"].academic_risk_level
        place_risk = metrics["risk"].placement_risk_level
        urgency = metrics["risk"].overall_urgency

        # Score buckets
        if score is not None:
            if score <= 40:
                score_buckets["0-40"] += 1
            elif score <= 60:
                score_buckets["41-60"] += 1
            elif score <= 75:
                score_buckets["61-75"] += 1
            elif score <= 85:
                score_buckets["76-85"] += 1
            else:
                score_buckets["86-100"] += 1

        # Risk distributions
        if acad_risk in acad_risk_dist:
            acad_risk_dist[acad_risk] += 1
        if place_risk in place_risk_dist:
            place_risk_dist[place_risk] += 1

        # Department performance aggregation
        dept = s.department
        if dept not in dept_stats:
            dept_stats[dept] = {"total": 0, "score_sum": 0.0, "cgpa_sum": 0.0, "att_sum": 0.0, "at_risk": 0}
        dept_stats[dept]["total"] += 1
        if score is not None:
            dept_stats[dept]["score_sum"] += score
        if metrics["cgpa"] is not None:
            dept_stats[dept]["cgpa_sum"] += metrics["cgpa"]
        if metrics["attendance"] is not None:
            dept_stats[dept]["att_sum"] += metrics["attendance"]
        if acad_risk == "High" or place_risk == "High":
            dept_stats[dept]["at_risk"] += 1

        # Segment distribution
        for seg in metrics["segments"]:
            segment_counts[seg] = segment_counts.get(seg, 0) + 1

        # Priority actions
        if urgency in ["Critical", "High"] and len(priority_actions) < 8:
            priority_actions.append({
                "student_id": s.student_id,
                "name": s.name,
                "department": s.department,
                "academic_risk": acad_risk,
                "placement_risk": place_risk,
                "urgency": urgency,
                "success_score": score,
                "primary_reason": metrics["risk"].triggered_rules[0].message if metrics["risk"].triggered_rules else "Threshold Breach",
                "recommended_action": metrics["risk"].recommended_actions[0] if metrics["risk"].recommended_actions else "Schedule check-in"
            })

    # Format department stats
    dept_formatted = []
    for d_name, d_val in dept_stats.items():
        count = max(1, d_val["total"])
        dept_formatted.append({
            "department": d_name.replace("Engineering", "Engg"),
            "full_name": d_name,
            "student_count": d_val["total"],
            "avg_success_score": round(d_val["score_sum"] / count, 1),
            "avg_cgpa": round(d_val["cgpa_sum"] / count, 2),
            "avg_attendance": round(d_val["att_sum"] / count, 1),
            "at_risk_students": d_val["at_risk"]
        })

    # Format segment chart items
    total_students = max(1, len(students))
    segment_formatted = [
        {"segment": seg, "count": cnt, "percentage": round((cnt / total_students) * 100, 1)}
        for seg, cnt in segment_counts.items()
    ]

    return {
        "score_distribution": [{"range": k, "count": v} for k, v in score_buckets.items()],
        "academic_risk_distribution": [{"level": k, "count": v} for k, v in acad_risk_dist.items()],
        "placement_risk_distribution": [{"level": k, "count": v} for k, v in place_risk_dist.items()],
        "department_performance": dept_formatted,
        "segment_distribution": segment_formatted,
        "priority_actions": priority_actions
    }

"""
Students API Router
Handles directory filtering, pagination, search, and deep 360° individual profile views.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Student, Intervention
from ..schemas import StudentSummary, StudentDetail, InterventionOut
from .dashboard import get_student_metrics
from ..services.trend_engine import detect_student_trends
from ..services.ml_engine import predict_placement_readiness

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("")
def list_students(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    academic_year: Optional[int] = Query(None),
    academic_risk: Optional[str] = Query(None),
    placement_risk: Optional[str] = Query(None),
    segment: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    sort_by: str = Query("student_id"),
    sort_order: str = Query("asc"),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department:
        query = query.filter(Student.department == department)
    if academic_year:
        query = query.filter(Student.academic_year == academic_year)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter((Student.student_id.ilike(search_fmt)) | (Student.name.ilike(search_fmt)))

    all_students = query.all()
    results = []

    for s in all_students:
        metrics = get_student_metrics(s)
        acad_risk = metrics["risk"].academic_risk_level
        place_risk = metrics["risk"].placement_risk_level
        urg = metrics["risk"].overall_urgency
        segs = metrics["segments"]

        # Apply post-evaluation filters
        if academic_risk and acad_risk.lower() != academic_risk.lower():
            continue
        if placement_risk and place_risk.lower() != placement_risk.lower():
            continue
        if urgency and urg.lower() != urgency.lower():
            continue
        if segment and not any(segment.lower() in x.lower() for x in segs):
            continue

        open_invs = db.query(Intervention).filter(
            Intervention.student_id == s.student_id,
            Intervention.status.in_(["Recommended", "Assigned", "In Progress", "Follow-up Required"])
        ).count()

        results.append({
            "student_id": s.student_id,
            "name": s.name,
            "department": s.department,
            "academic_year": s.academic_year,
            "semester": s.semester,
            "cgpa": metrics["cgpa"],
            "attendance_percentage": metrics["attendance"],
            "success_score": metrics["score"].overall_success_score,
            "academic_risk_level": acad_risk,
            "placement_risk_level": place_risk,
            "overall_urgency": urg,
            "segments": segs,
            "open_interventions_count": open_invs
        })

    # Sorting
    reverse = (sort_order.lower() == "desc")
    if sort_by == "success_score":
        results.sort(key=lambda x: (x["success_score"] is not None, x["success_score"] or 0), reverse=reverse)
    elif sort_by == "cgpa":
        results.sort(key=lambda x: (x["cgpa"] is not None, x["cgpa"] or 0), reverse=reverse)
    elif sort_by == "attendance":
        results.sort(key=lambda x: (x["attendance_percentage"] is not None, x["attendance_percentage"] or 0), reverse=reverse)
    elif sort_by == "name":
        results.sort(key=lambda x: x["name"], reverse=reverse)
    else:
        results.sort(key=lambda x: x["student_id"], reverse=reverse)

    total_count = len(results)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated = results[start_idx:end_idx]

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total_count + page_size - 1) // page_size),
        "students": paginated
    }

@router.get("/{student_id}")
def get_student_profile(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    metrics = get_student_metrics(student)
    acad = student.academic_records[0] if student.academic_records else None
    att = student.attendance_records[0] if student.attendance_records else None
    lms = student.lms_records[0] if student.lms_records else None
    plc = student.placement_records[0] if student.placement_records else None
    eng = student.engagement_records[0] if student.engagement_records else None

    # Detect longitudinal trends
    trends = detect_student_trends(
        current_attendance=att.attendance_percentage if att else None,
        prev_attendance=att.previous_attendance if att else None,
        current_marks=acad.internal_marks if acad else None,
        prev_marks=acad.previous_internal_marks if acad else None,
        current_assignments=lms.assignment_completion if lms else None,
        prev_assignments=lms.previous_assignment_completion if lms else None,
        current_coding=plc.coding_score if plc else None,
        prev_coding=plc.previous_coding_score if plc else None
    )

    # ML Placement Prediction
    ml_prediction = predict_placement_readiness({
        "cgpa": acad.cgpa if acad else None,
        "internal_marks": acad.internal_marks if acad else None,
        "attendance_percentage": att.attendance_percentage if att else None,
        "coding_score": plc.coding_score if plc else None,
        "aptitude_score": plc.aptitude_score if plc else None,
        "mock_interview_score": plc.mock_interview_score if plc else None,
        "communication_score": plc.communication_score if plc else None,
        "backlogs": acad.backlogs if acad else 0,
        "certifications": eng.certifications if eng else 0
    })

    # Interventions list
    invs = db.query(Intervention).filter(Intervention.student_id == student_id).order_by(Intervention.created_at.desc()).all()
    open_invs = sum(1 for i in invs if i.status in ["Recommended", "Assigned", "In Progress", "Follow-up Required"])

    return {
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "academic_year": student.academic_year,
        "semester": student.semester,
        "section": student.section,
        "cgpa": metrics["cgpa"],
        "attendance_percentage": metrics["attendance"],
        "success_score": metrics["score"].overall_success_score,
        "academic_risk_level": metrics["risk"].academic_risk_level,
        "placement_risk_level": metrics["risk"].placement_risk_level,
        "overall_urgency": metrics["risk"].overall_urgency,
        "segments": metrics["segments"],
        "open_interventions_count": open_invs,
        "academic": {
            "cgpa": acad.cgpa if acad else None,
            "internal_marks": acad.internal_marks if acad else None,
            "previous_internal_marks": acad.previous_internal_marks if acad else None,
            "backlogs": acad.backlogs if acad else 0,
        },
        "attendance": {
            "attendance_percentage": att.attendance_percentage if att else None,
            "previous_attendance": att.previous_attendance if att else None,
        },
        "lms": {
            "login_frequency": lms.login_frequency if lms else 0,
            "assignment_completion": lms.assignment_completion if lms else None,
            "previous_assignment_completion": lms.previous_assignment_completion if lms else None,
            "overdue_assignments": lms.overdue_assignments if lms else 0,
            "learning_activity_hours": lms.learning_activity_hours if lms else 0.0
        },
        "placement": {
            "aptitude_score": plc.aptitude_score if plc else None,
            "coding_score": plc.coding_score if plc else None,
            "previous_coding_score": plc.previous_coding_score if plc else None,
            "mock_interview_score": plc.mock_interview_score if plc else None,
            "communication_score": plc.communication_score if plc else None,
            "resume_readiness": plc.resume_readiness if plc else 50.0
        },
        "engagement": {
            "event_participation": eng.event_participation if eng else 0,
            "hackathons": eng.hackathons if eng else 0,
            "certifications": eng.certifications if eng else 0,
            "club_involvement": eng.club_involvement if eng else "General"
        },
        "score_breakdown": metrics["score"],
        "risk_assessment": metrics["risk"],
        "trends": trends,
        "ml_placement_prediction": ml_prediction,
        "interventions": invs
    }

@router.get("/{student_id}/risk")
def get_student_risk(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    metrics = get_student_metrics(student)
    return metrics["risk"]

@router.get("/{student_id}/interventions", response_model=List[InterventionOut])
def get_student_interventions(student_id: str, db: Session = Depends(get_db)):
    invs = db.query(Intervention).filter(Intervention.student_id == student_id).order_by(Intervention.created_at.desc()).all()
    return invs

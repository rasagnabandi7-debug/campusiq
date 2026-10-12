"""
Student Segments API Router
Returns cohort breakdowns, segment metadata, and matched student listings.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Student
from ..schemas import SegmentInfo
from .dashboard import get_student_metrics
from ..services.segmentation_engine import get_all_segment_metadata

router = APIRouter(prefix="/api/segments", tags=["segments"])

@router.get("")
def get_segments_summary(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    total_count = max(1, len(students))
    catalog = get_all_segment_metadata()

    # Tally counts for each segment
    segment_students = {item["title"]: [] for item in catalog}

    for s in students:
        metrics = get_student_metrics(s)
        for seg in metrics["segments"]:
            if seg in segment_students:
                segment_students[seg].append({
                    "student_id": s.student_id,
                    "name": s.name,
                    "department": s.department,
                    "cgpa": metrics["cgpa"],
                    "attendance": metrics["attendance"],
                    "success_score": metrics["score"].overall_success_score,
                    "academic_risk": metrics["risk"].academic_risk_level,
                    "placement_risk": metrics["risk"].placement_risk_level
                })

    summary_list = []
    for item in catalog:
        matched = segment_students.get(item["title"], [])
        summary_list.append({
            "segment_id": item["segment_id"],
            "title": item["title"],
            "student_count": len(matched),
            "percentage": round((len(matched) / total_count) * 100, 1),
            "description": item["description"],
            "criteria": item["criteria"],
            "suggested_interventions": item["suggested_interventions"],
            "accent_color": item["accent_color"],
            "sample_students": matched[:12]
        })

    return summary_list

@router.get("/{segment_id}/students")
def get_students_in_segment(segment_id: str, db: Session = Depends(get_db)):
    catalog = get_all_segment_metadata()
    target_meta = next((item for item in catalog if item["segment_id"] == segment_id), None)
    if not target_meta:
        target_title = segment_id.replace("_", " ").title()
    else:
        target_title = target_meta["title"]

    students = db.query(Student).all()
    matched = []

    for s in students:
        metrics = get_student_metrics(s)
        if any(target_title.lower() in seg.lower() for seg in metrics["segments"]):
            matched.append({
                "student_id": s.student_id,
                "name": s.name,
                "department": s.department,
                "academic_year": s.academic_year,
                "cgpa": metrics["cgpa"],
                "attendance_percentage": metrics["attendance"],
                "success_score": metrics["score"].overall_success_score,
                "academic_risk": metrics["risk"].academic_risk_level,
                "placement_risk": metrics["risk"].placement_risk_level,
                "overall_urgency": metrics["risk"].overall_urgency
            })

    return {
        "segment_id": segment_id,
        "title": target_title,
        "count": len(matched),
        "students": matched
    }

"""
Early Warning Center / Student Success Radar Router
Prioritizes high-risk signals and rapid triage workflows for student advisors.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Student, Intervention
from .dashboard import get_student_metrics

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("")
def get_early_warning_alerts(
    department: Optional[str] = Query(None),
    risk_type: Optional[str] = Query(None), # "academic", "placement", "all"
    urgency: Optional[str] = Query(None),   # "Critical", "High", "Moderate"
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department:
        query = query.filter(Student.department == department)

    students = query.all()
    radar_alerts = []

    for s in students:
        metrics = get_student_metrics(s)
        risk = metrics["risk"]
        acad_risk = risk.academic_risk_level
        place_risk = risk.placement_risk_level
        urg = risk.overall_urgency

        # Filter out healthy students with low urgency
        if urg == "Low" and not risk.triggered_rules:
            continue

        if urgency and urg.lower() != urgency.lower():
            continue

        if risk_type == "academic" and acad_risk != "High":
            continue
        if risk_type == "placement" and place_risk != "High":
            continue

        # Look up existing interventions
        invs = db.query(Intervention).filter(Intervention.student_id == s.student_id).all()
        status_label = "Recommended"
        if invs:
            # Pick most active status
            for inv in invs:
                if inv.status in ["In Progress", "Assigned"]:
                    status_label = inv.status
                    break
                elif inv.status == "Completed":
                    status_label = "Completed"

        radar_alerts.append({
            "student_id": s.student_id,
            "name": s.name,
            "department": s.department,
            "academic_year": s.academic_year,
            "success_score": metrics["score"].overall_success_score,
            "academic_risk": acad_risk,
            "placement_risk": place_risk,
            "urgency": urg,
            "triggered_rules": [r.dict() for r in risk.triggered_rules],
            "primary_indicator": risk.triggered_rules[0].message if risk.triggered_rules else "Threshold Breach",
            "recommended_action": risk.recommended_actions[0] if risk.recommended_actions else "Schedule review",
            "intervention_status": status_label,
            "existing_interventions_count": len(invs)
        })

    # Sort priority: Critical first, then High, then Moderate
    urgency_weights = {"Critical": 3, "High": 2, "Moderate": 1, "Low": 0}
    radar_alerts.sort(key=lambda x: urgency_weights.get(x["urgency"], 0), reverse=True)

    return {
        "total_alerts": len(radar_alerts),
        "critical_count": sum(1 for a in radar_alerts if a["urgency"] == "Critical"),
        "high_count": sum(1 for a in radar_alerts if a["urgency"] == "High"),
        "moderate_count": sum(1 for a in radar_alerts if a["urgency"] == "Moderate"),
        "alerts": radar_alerts
    }

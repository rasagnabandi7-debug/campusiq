"""
Intervention Management API Router
Supports assigning, updating, and outcome tracking across student support pathways.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..models import Intervention, Student
from ..schemas import InterventionCreate, InterventionUpdate, InterventionOut

router = APIRouter(prefix="/api/interventions", tags=["interventions"])

@router.get("", response_model=List[InterventionOut])
def list_interventions(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Intervention)
    if status:
        query = query.filter(Intervention.status == status)
    if priority:
        query = query.filter(Intervention.priority == priority)
    if student_id:
        query = query.filter(Intervention.student_id == student_id)

    invs = query.order_by(Intervention.updated_at.desc()).all()

    # Hydrate student name and department
    results = []
    for inv in invs:
        student = db.query(Student).filter(Student.student_id == inv.student_id).first()
        out = InterventionOut(
            id=inv.id,
            student_id=inv.student_id,
            student_name=student.name if student else "Unknown",
            department=student.department if student else "N/A",
            intervention_type=inv.intervention_type,
            description=inv.description,
            priority=inv.priority,
            assigned_to=inv.assigned_to,
            due_date=inv.due_date,
            status=inv.status,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
            notes=inv.notes,
            initial_metric_type=inv.initial_metric_type,
            initial_metric_val=inv.initial_metric_val,
            outcome_metric_val=inv.outcome_metric_val,
            observed_change=inv.observed_change
        )
        results.append(out)

    return results

@router.post("", response_model=InterventionOut)
def create_intervention(payload: InterventionCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {payload.student_id} not found")

    new_inv = Intervention(
        student_id=payload.student_id,
        intervention_type=payload.intervention_type,
        description=payload.description,
        priority=payload.priority,
        assigned_to=payload.assigned_to,
        due_date=payload.due_date,
        status=payload.status,
        notes=payload.notes,
        initial_metric_type=payload.initial_metric_type,
        initial_metric_val=payload.initial_metric_val
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    return InterventionOut(
        id=new_inv.id,
        student_id=new_inv.student_id,
        student_name=student.name,
        department=student.department,
        intervention_type=new_inv.intervention_type,
        description=new_inv.description,
        priority=new_inv.priority,
        assigned_to=new_inv.assigned_to,
        due_date=new_inv.due_date,
        status=new_inv.status,
        created_at=new_inv.created_at,
        updated_at=new_inv.updated_at,
        notes=new_inv.notes,
        initial_metric_type=new_inv.initial_metric_type,
        initial_metric_val=new_inv.initial_metric_val,
        outcome_metric_val=new_inv.outcome_metric_val,
        observed_change=new_inv.observed_change
    )

@router.patch("/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: int,
    payload: InterventionUpdate,
    db: Session = Depends(get_db)
):
    inv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Intervention record not found")

    if payload.status is not None:
        inv.status = payload.status
    if payload.priority is not None:
        inv.priority = payload.priority
    if payload.due_date is not None:
        inv.due_date = payload.due_date
    if payload.assigned_to is not None:
        inv.assigned_to = payload.assigned_to
    if payload.notes is not None:
        inv.notes = payload.notes
    if payload.outcome_metric_val is not None:
        inv.outcome_metric_val = payload.outcome_metric_val
        # Automatically compute observed change if initial metric is present
        if inv.initial_metric_val is not None:
            delta = round(payload.outcome_metric_val - inv.initial_metric_val, 1)
            sign = "+" if delta >= 0 else ""
            inv.observed_change = f"{inv.initial_metric_type.replace('_', ' ').title()} changed from {inv.initial_metric_val} to {payload.outcome_metric_val} ({sign}{delta} pts)"
    if payload.observed_change is not None:
        inv.observed_change = payload.observed_change

    inv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(inv)

    student = db.query(Student).filter(Student.student_id == inv.student_id).first()
    return InterventionOut(
        id=inv.id,
        student_id=inv.student_id,
        student_name=student.name if student else "Unknown",
        department=student.department if student else "N/A",
        intervention_type=inv.intervention_type,
        description=inv.description,
        priority=inv.priority,
        assigned_to=inv.assigned_to,
        due_date=inv.due_date,
        status=inv.status,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
        notes=inv.notes,
        initial_metric_type=inv.initial_metric_type,
        initial_metric_val=inv.initial_metric_val,
        outcome_metric_val=inv.outcome_metric_val,
        observed_change=inv.observed_change
    )

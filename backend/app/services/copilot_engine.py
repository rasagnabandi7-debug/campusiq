"""
CampusIQ Copilot Analytics Engine
Deterministic, safe natural language analytics query layer providing verified facts,
supporting metrics, student references, and actionable recommendations.
"""
from typing import Dict, Any, List
import re
from sqlalchemy.orm import Session
from ..models import (
    Student, AcademicRecord, AttendanceRecord, LMSRecord,
    PlacementRecord, Intervention
)
from .scoring_engine import compute_success_score
from .risk_engine import evaluate_risk
from .segmentation_engine import classify_student_segments

COPILOT_SUGGESTIONS = [
    "Which students need immediate academic attention?",
    "Which high-performing students have low placement readiness?",
    "Which department has the largest number of students requiring support?",
    "What are the most common academic risk indicators?",
    "Which students have declining attendance?",
    "Which interventions remain pending?",
    "Show me consistent high performers"
]

def query_copilot(db: Session, user_query: str) -> Dict[str, Any]:
    """
    Parses user query, routes to deterministic analytics handler,
    and constructs explainable response with verified factual badges.
    """
    q = user_query.lower().strip()

    # Query 1: Academic attention / immediate need
    if any(k in q for k in ["immediate", "academic attention", "critical academic", "urgent"]):
        students = db.query(Student).all()
        critical_list = []
        for s in students:
            acad = s.academic_records[0] if s.academic_records else None
            att = s.attendance_records[0] if s.attendance_records else None
            lms = s.lms_records[0] if s.lms_records else None
            plc = s.placement_records[0] if s.placement_records else None

            risk = evaluate_risk(
                cgpa=acad.cgpa if acad else None,
                internal_marks=acad.internal_marks if acad else None,
                backlogs=acad.backlogs if acad else 0,
                attendance_pct=att.attendance_percentage if att else None,
                assignment_completion=lms.assignment_completion if lms else None,
                coding_score=plc.coding_score if plc else None,
                aptitude_score=plc.aptitude_score if plc else None,
                mock_interview_score=plc.mock_interview_score if plc else None,
                communication_score=plc.communication_score if plc else None,
            )

            if risk.academic_risk_level == "High":
                critical_list.append({
                    "student_id": s.student_id,
                    "name": s.name,
                    "department": s.department,
                    "attendance": f"{att.attendance_percentage:.1f}%" if att and att.attendance_percentage else "N/A",
                    "backlogs": acad.backlogs if acad else 0,
                    "internal_marks": f"{acad.internal_marks:.1f}" if acad and acad.internal_marks else "N/A",
                    "reason": risk.triggered_rules[0].message if risk.triggered_rules else "High risk threshold breached"
                })

        # Sort by backlogs descending
        critical_list.sort(key=lambda x: int(x["backlogs"]), reverse=True)
        top_critical = critical_list[:8]

        return {
            "query": user_query,
            "category": "academic_risk",
            "answer_text": f"Identified **{len(critical_list)} students** requiring immediate academic intervention due to critical attendance shortfalls (<60%), multiple active backlogs, or failing internal assessment marks (<40).",
            "supporting_metrics": {
                "total_high_risk_academic": len(critical_list),
                "threshold_applied": "Attendance < 60% OR Backlogs >= 2 OR Marks < 40",
                "sample_analyzed": len(students)
            },
            "matched_students": top_critical,
            "recommended_next_steps": [
                "Issue prioritized counseling summons to the top 5 highlighted students.",
                "Mandate enrollment in 4-week remedial coaching clinics before end-term exams.",
                "Review academic warning notices with department heads."
            ]
        }

    # Query 2: High academic but low placement readiness
    elif any(k in q for k in ["placement readiness", "high-performing", "placement unready", "coding gap"]):
        students = db.query(Student).all()
        gap_students = []
        for s in students:
            acad = s.academic_records[0] if s.academic_records else None
            plc = s.placement_records[0] if s.placement_records else None

            cgpa = acad.cgpa if acad else None
            coding = plc.coding_score if plc else None

            if cgpa is not None and cgpa >= 7.5 and coding is not None and coding < 55.0:
                gap_students.append({
                    "student_id": s.student_id,
                    "name": s.name,
                    "department": s.department,
                    "cgpa": round(cgpa, 2),
                    "coding_score": round(coding, 1),
                    "aptitude_score": round(plc.aptitude_score, 1) if plc and plc.aptitude_score else "N/A",
                    "reason": f"Strong academic standing (CGPA {cgpa:.2f}) but critically vulnerable coding score ({coding:.1f}/100)."
                })

        gap_students.sort(key=lambda x: float(x["cgpa"]), reverse=True)
        top_gap = gap_students[:8]

        return {
            "query": user_query,
            "category": "placement_gap",
            "answer_text": f"Found **{len(gap_students)} high-achieving students** who hold strong academic grades (CGPA ≥ 7.5) but are currently unready for campus recruitment drives due to technical coding deficits (Coding < 55).",
            "supporting_metrics": {
                "gap_cohort_count": len(gap_students),
                "criteria": "CGPA >= 7.5 AND Coding Score < 55/100",
                "highest_cgpa_in_gap": top_gap[0]["cgpa"] if top_gap else "N/A"
            },
            "matched_students": top_gap,
            "recommended_next_steps": [
                "Do NOT assign generic coursework tutoring to these students.",
                "Enroll this cohort immediately in targeted Data Structures & Algorithms coding sprints.",
                "Schedule 1-on-1 technical mock interview diagnostics."
            ]
        }

    # Query 3: Department breakdown / comparison
    elif any(k in q for k in ["department", "largest number", "dept", "branch"]):
        students = db.query(Student).all()
        dept_counts = {}
        for s in students:
            dept = s.department
            if dept not in dept_counts:
                dept_counts[dept] = {"total": 0, "at_risk": 0}
            dept_counts[dept]["total"] += 1

            acad = s.academic_records[0] if s.academic_records else None
            att = s.attendance_records[0] if s.attendance_records else None
            if (acad and acad.backlogs >= 1) or (att and att.attendance_percentage and att.attendance_percentage < 65.0):
                dept_counts[dept]["at_risk"] += 1

        sorted_depts = sorted(dept_counts.items(), key=lambda x: x[1]["at_risk"], reverse=True)
        top_dept_name, top_dept_stats = sorted_depts[0] if sorted_depts else ("None", {"at_risk": 0, "total": 0})

        formatted_records = [
            {"department": d, "at_risk_students": s["at_risk"], "total_students": s["total"], "risk_ratio": f"{round(s['at_risk']/max(1, s['total'])*100, 1)}%"}
            for d, s in sorted_depts
        ]

        return {
            "query": user_query,
            "category": "department_breakdown",
            "answer_text": f"**{top_dept_name}** has the highest volume of students requiring targeted support, with **{top_dept_stats['at_risk']} students** ({round(top_dept_stats['at_risk']/max(1, top_dept_stats['total'])*100, 1)}% of departmental cohort) exhibiting academic or attendance risks.",
            "supporting_metrics": {
                "departments_analyzed": len(dept_counts),
                "most_vulnerable_dept": top_dept_name,
                "highest_risk_count": top_dept_stats["at_risk"]
            },
            "matched_students": formatted_records,
            "recommended_next_steps": [
                f"Convene a dedicated academic review with the Head of Department for {top_dept_name}.",
                "Deploy department-level peer tutoring circles in challenging core subjects.",
                "Review timetable clash issues impacting lecture attendance."
            ]
        }

    # Query 4: Common risk indicators
    elif any(k in q for k in ["common", "indicators", "frequency", "reasons", "why"]):
        students = db.query(Student).all()
        low_att = sum(1 for s in students if s.attendance_records and s.attendance_records[0].attendance_percentage and s.attendance_records[0].attendance_percentage < 75.0)
        backlogs = sum(1 for s in students if s.academic_records and s.academic_records[0].backlogs > 0)
        low_marks = sum(1 for s in students if s.academic_records and s.academic_records[0].internal_marks and s.academic_records[0].internal_marks < 60.0)
        low_coding = sum(1 for s in students if s.placement_records and s.placement_records[0].coding_score and s.placement_records[0].coding_score < 60.0)

        indicators = [
            {"indicator": "Technical Coding Deficit (<60/100)", "affected_students": low_coding, "pct": round(low_coding/len(students)*100, 1)},
            {"indicator": "Attendance Below Target (<75%)", "affected_students": low_att, "pct": round(low_att/len(students)*100, 1)},
            {"indicator": "Internal Marks Concern (<60/100)", "affected_students": low_marks, "pct": round(low_marks/len(students)*100, 1)},
            {"indicator": "Active Subject Backlogs (>=1)", "affected_students": backlogs, "pct": round(backlogs/len(students)*100, 1)}
        ]
        indicators.sort(key=lambda x: x["affected_students"], reverse=True)

        return {
            "query": user_query,
            "category": "risk_indicators",
            "answer_text": f"The single most prevalent vulnerability is **{indicators[0]['indicator']}**, affecting **{indicators[0]['affected_students']} students** ({indicators[0]['pct']}% of total population). This is closely followed by **{indicators[1]['indicator']}** ({indicators[1]['pct']}%).",
            "supporting_metrics": {
                "top_driver": indicators[0]["indicator"],
                "total_students_surveyed": len(students)
            },
            "matched_students": indicators,
            "recommended_next_steps": [
                "Implement institution-wide hands-on coding practicals starting in 2nd year.",
                "Institute automated bi-weekly attendance notification SMS to parents and advisors."
            ]
        }

    # Query 5: Declining attendance trends
    elif any(k in q for k in ["declining", "trend", "dropped", "drop", "falling"]):
        students = db.query(Student).all()
        declining = []
        for s in students:
            att = s.attendance_records[0] if s.attendance_records else None
            if att and att.attendance_percentage and att.previous_attendance:
                drop = round(att.previous_attendance - att.attendance_percentage, 1)
                if drop >= 12.0:
                    declining.append({
                        "student_id": s.student_id,
                        "name": s.name,
                        "department": s.department,
                        "previous_attendance": f"{att.previous_attendance:.1f}%",
                        "current_attendance": f"{att.attendance_percentage:.1f}%",
                        "drop_delta": f"-{drop:.1f}%",
                        "reason": f"Attendance dropped by {drop}% between monitoring snapshots."
                    })

        declining.sort(key=lambda x: float(x["drop_delta"].replace("-%", "")), reverse=True)

        return {
            "query": user_query,
            "category": "trend_alerts",
            "answer_text": f"Detected **{len(declining)} students** with alarming negative attendance momentum (drops of ≥12 percentage points compared to prior baseline).",
            "supporting_metrics": {
                "severe_drop_count": len(declining),
                "threshold": "Drop >= 12% between recorded dates"
            },
            "matched_students": declining[:8],
            "recommended_next_steps": [
                "Engage designated class mentors to schedule personal check-ins this week.",
                "Verify whether health, commute, or hostel circumstances caused sudden absence."
            ]
        }

    # Query 6: Pending interventions
    elif any(k in q for k in ["pending", "intervention", "open interventions", "follow-up"]):
        open_invs = db.query(Intervention).filter(Intervention.status.in_(["Recommended", "Assigned", "In Progress", "Follow-up Required"])).all()
        formatted = []
        for inv in open_invs[:8]:
            stu = db.query(Student).filter(Student.student_id == inv.student_id).first()
            formatted.append({
                "student_id": inv.student_id,
                "name": stu.name if stu else "Unknown",
                "intervention_type": inv.intervention_type,
                "priority": inv.priority,
                "status": inv.status,
                "assigned_to": inv.assigned_to,
                "due_date": inv.due_date or "Unspecified"
            })

        return {
            "query": user_query,
            "category": "interventions",
            "answer_text": f"There are currently **{len(open_invs)} open intervention cases** across departments requiring faculty follow-up or completion.",
            "supporting_metrics": {
                "open_count": len(open_invs),
                "high_priority_count": sum(1 for i in open_invs if i.priority == "High")
            },
            "matched_students": formatted,
            "recommended_next_steps": [
                "Filter Intervention Management tab by 'High Priority' to review overdue items.",
                "Ensure faculty mentors submit post-session outcome updates."
            ]
        }

    # Default / General Query Fallback
    else:
        students = db.query(Student).all()
        high_achievers = []
        for s in students:
            acad = s.academic_records[0] if s.academic_records else None
            plc = s.placement_records[0] if s.placement_records else None
            att = s.attendance_records[0] if s.attendance_records else None
            if acad and acad.cgpa and acad.cgpa >= 8.5 and plc and plc.coding_score and plc.coding_score >= 80:
                high_achievers.append({
                    "student_id": s.student_id,
                    "name": s.name,
                    "department": s.department,
                    "cgpa": round(acad.cgpa, 2),
                    "attendance": f"{att.attendance_percentage:.1f}%" if att else "N/A",
                    "coding_score": round(plc.coding_score, 1)
                })

        return {
            "query": user_query,
            "category": "general_overview",
            "answer_text": f"CampusIQ active database contains **{len(students)} enrolled students**. Query parsed across Academic, Attendance, LMS, and Placement registries.",
            "supporting_metrics": {
                "total_records": len(students),
                "system_status": "Operational & Real-time"
            },
            "matched_students": high_achievers[:6],
            "recommended_next_steps": [
                "Select one of the suggested query prompts above to explore specific risk segments.",
                "Navigate to the Early Warning Center for urgent student cases."
            ]
        }

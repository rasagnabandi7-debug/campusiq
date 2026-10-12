"""
CampusIQ Historical Trend Engine
Detects velocity and trajectory changes across longitudinal student observations.
"""
from typing import Optional, List
from ..schemas import TrendAlert
from ..config import risk_thresholds

def detect_student_trends(
    current_attendance: Optional[float],
    prev_attendance: Optional[float],
    current_marks: Optional[float],
    prev_marks: Optional[float],
    current_assignments: Optional[float],
    prev_assignments: Optional[float],
    current_coding: Optional[float],
    prev_coding: Optional[float]
) -> List[TrendAlert]:
    """
    Examines previous vs current observation values to surface meaningful velocity changes.
    """
    alerts: List[TrendAlert] = []

    # 1. Attendance Trend
    if current_attendance is not None and prev_attendance is not None:
        delta = round(current_attendance - prev_attendance, 1)
        if delta <= -risk_thresholds.TREND_ATTENDANCE_DROP_ALERT:
            alerts.append(TrendAlert(
                indicator="Lecture Attendance",
                previous_value=prev_attendance,
                current_value=current_attendance,
                delta=delta,
                direction="Declining",
                severity="Critical" if delta <= -20.0 else "Warning",
                explanation=f"Attendance sharply declined by {abs(delta)}% (from {prev_attendance}% to {current_attendance}%).",
                suggested_action="Immediate advisor outreach to investigate sudden absenteeism before term debarment."
            ))
        elif delta >= 10.0:
            alerts.append(TrendAlert(
                indicator="Lecture Attendance",
                previous_value=prev_attendance,
                current_value=current_attendance,
                delta=delta,
                direction="Improving",
                severity="Positive",
                explanation=f"Attendance improved by +{delta}% (from {prev_attendance}% to {current_attendance}%).",
                suggested_action="Acknowledge positive student attendance habit change during next check-in."
            ))

    # 2. Internal Assessment Marks Trend
    if current_marks is not None and prev_marks is not None:
        delta = round(current_marks - prev_marks, 1)
        if delta <= -risk_thresholds.TREND_MARKS_DROP_ALERT:
            alerts.append(TrendAlert(
                indicator="Internal Assessment Marks",
                previous_value=prev_marks,
                current_value=current_marks,
                delta=delta,
                direction="Declining",
                severity="Critical" if delta <= -25.0 else "Warning",
                explanation=f"Assessment marks plummeted by {abs(delta)} points (from {prev_marks:.1f} to {current_marks:.1f}).",
                suggested_action="Recommend subject remedial clinic and peer study group."
            ))
        elif delta >= 12.0:
            alerts.append(TrendAlert(
                indicator="Internal Assessment Marks",
                previous_value=prev_marks,
                current_value=current_marks,
                delta=delta,
                direction="Improving",
                severity="Positive",
                explanation=f"Assessment scores advanced by +{delta} points (from {prev_marks:.1f} to {current_marks:.1f}).",
                suggested_action="Reinforce successful study techniques and encourage continued momentum."
            ))

    # 3. LMS Assignment Completion Trend
    if current_assignments is not None and prev_assignments is not None:
        delta = round(current_assignments - prev_assignments, 1)
        if delta <= -risk_thresholds.TREND_ASSIGNMENT_DROP_ALERT:
            alerts.append(TrendAlert(
                indicator="Assignment Completion Rate",
                previous_value=prev_assignments,
                current_value=current_assignments,
                delta=delta,
                direction="Declining",
                severity="Warning",
                explanation=f"Assignment submissions dropped by {abs(delta)}% (from {prev_assignments}% to {current_assignments}%).",
                suggested_action="Check for coursework logjam or technical obstacles with LMS access."
            ))
        elif delta >= 15.0:
            alerts.append(TrendAlert(
                indicator="Assignment Completion Rate",
                previous_value=prev_assignments,
                current_value=current_assignments,
                delta=delta,
                direction="Improving",
                severity="Positive",
                explanation=f"Coursework submissions rebounded by +{delta}%.",
                suggested_action="Confirm consistent timely submission habits."
            ))

    # 4. Coding Assessment Trend
    if current_coding is not None and prev_coding is not None:
        delta = round(current_coding - prev_coding, 1)
        if delta >= 15.0:
            alerts.append(TrendAlert(
                indicator="Coding Benchmark Score",
                previous_value=prev_coding,
                current_value=current_coding,
                delta=delta,
                direction="Improving",
                severity="Positive",
                explanation=f"Technical coding score leaped +{delta} points (from {prev_coding:.0f} to {current_coding:.0f})!",
                suggested_action="Elevate student to competitive programming tier and company mock interviews."
            ))
        elif delta <= -15.0:
            alerts.append(TrendAlert(
                indicator="Coding Benchmark Score",
                previous_value=prev_coding,
                current_value=current_coding,
                delta=delta,
                direction="Declining",
                severity="Warning",
                explanation=f"Coding performance decreased by {abs(delta)} points.",
                suggested_action="Review DSA practice frequency and provide targeted code reviews."
            ))

    return alerts

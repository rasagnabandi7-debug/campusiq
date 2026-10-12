"""
CampusIQ Separate Academic and Placement Risk Engines
Evaluates rule-based triggers, explains evidence, and provides actionable recommendations.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..config import risk_thresholds
from ..schemas import RiskAssessment, RiskRuleTrigger

def evaluate_risk(
    cgpa: Optional[float],
    internal_marks: Optional[float],
    backlogs: int,
    attendance_pct: Optional[float],
    assignment_completion: Optional[float],
    coding_score: Optional[float],
    aptitude_score: Optional[float],
    mock_interview_score: Optional[float],
    communication_score: Optional[float],
    prev_internal_marks: Optional[float] = None,
    prev_attendance: Optional[float] = None
) -> RiskAssessment:
    """
    Evaluates academic and placement risk independently, detailing triggered rules
    and supporting evidence without black-box opacity.
    """
    triggered_rules: List[RiskRuleTrigger] = []
    academic_high_flags = 0
    academic_mod_flags = 0
    placement_high_flags = 0
    placement_mod_flags = 0
    supporting_evidence: List[str] = []
    recommended_actions: List[str] = []

    # ==========================
    # 1. ACADEMIC RISK EVALUATION
    # ==========================
    # A. Attendance Rule
    if attendance_pct is not None:
        if attendance_pct < risk_thresholds.ATTENDANCE_CRITICAL:
            academic_high_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Critical Attendance Shortfall",
                risk_category="Academic",
                severity="High",
                current_value=f"{attendance_pct:.1f}%",
                threshold=f"<{risk_thresholds.ATTENDANCE_CRITICAL}%",
                message=f"Attendance at {attendance_pct:.1f}% is critically below mandatory threshold (<60%). Risk of debarment."
            ))
            supporting_evidence.append(f"Recorded attendance is {attendance_pct:.1f}%, violating the minimum 60% regulation.")
            recommended_actions.append("Issue attendance alert and schedule an immediate faculty advisor counseling session.")
        elif attendance_pct < risk_thresholds.ATTENDANCE_WARNING:
            academic_mod_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Attendance Warning",
                risk_category="Academic",
                severity="Moderate",
                current_value=f"{attendance_pct:.1f}%",
                threshold=f"<{risk_thresholds.ATTENDANCE_WARNING}%",
                message=f"Attendance at {attendance_pct:.1f}% is below target 75% benchmark."
            ))
            supporting_evidence.append(f"Attendance ({attendance_pct:.1f}%) requires monitoring to prevent dropping below statutory limit.")
            recommended_actions.append("Send proactive attendance reminder and monitor bi-weekly presence.")

    # B. Backlogs Rule
    if backlogs >= risk_thresholds.BACKLOG_HIGH_RISK_COUNT:
        academic_high_flags += 1
        triggered_rules.append(RiskRuleTrigger(
            rule_name="Multiple Active Backlogs",
            risk_category="Academic",
            severity="High",
            current_value=backlogs,
            threshold=f">={risk_thresholds.BACKLOG_HIGH_RISK_COUNT}",
            message=f"Student has {backlogs} active backlogs, creating severe graduation and placement blockage."
        ))
        supporting_evidence.append(f"Student has accumulated {backlogs} unresolved backlogs.")
        recommended_actions.append("Establish a structured backlog clearance plan with subject remedial mentor.")
    elif backlogs >= risk_thresholds.BACKLOG_MOD_RISK_COUNT:
        academic_mod_flags += 1
        triggered_rules.append(RiskRuleTrigger(
            rule_name="Single Pending Backlog",
            risk_category="Academic",
            severity="Moderate",
            current_value=backlogs,
            threshold="=1",
            message="1 pending backlog requires targeted support before semester exams."
        ))
        supporting_evidence.append("1 active backlog pending clearance.")
        recommended_actions.append("Assign subject tutor to assist with backlog examination preparation.")

    # C. Internal Assessment Marks Rule
    if internal_marks is not None:
        if internal_marks < risk_thresholds.ASSESSMENT_CRITICAL:
            academic_high_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Critical Internal Assessment Deficit",
                risk_category="Academic",
                severity="High",
                current_value=round(internal_marks, 1),
                threshold=f"<{risk_thresholds.ASSESSMENT_CRITICAL}",
                message=f"Internal marks ({internal_marks:.1f}/100) are severely below passing threshold (<40)."
            ))
            supporting_evidence.append(f"Internal assessment score of {internal_marks:.1f}/100 indicates acute subject distress.")
            recommended_actions.append("Mandate attendance in subject-specific remedial clinic and diagnostic quiz.")
        elif internal_marks < risk_thresholds.ASSESSMENT_WARNING:
            academic_mod_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Moderate Assessment Concern",
                risk_category="Academic",
                severity="Moderate",
                current_value=round(internal_marks, 1),
                threshold=f"<{risk_thresholds.ASSESSMENT_WARNING}",
                message=f"Internal marks ({internal_marks:.1f}/100) are below good standing target (<60)."
            ))
            supporting_evidence.append(f"Assessment marks ({internal_marks:.1f}/100) indicate borderline conceptual grasp.")
            recommended_actions.append("Provide practice question sets and peer-assisted study circle.")

    # D. Assignment Completion Rule
    if assignment_completion is not None:
        if assignment_completion < 40.0:
            academic_high_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Severe LMS Assignment Deficit",
                risk_category="Academic",
                severity="High",
                current_value=f"{assignment_completion:.1f}%",
                threshold="<40%",
                message=f"Only {assignment_completion:.1f}% of coursework assignments submitted."
            ))
            recommended_actions.append("Review overdue assignments and set weekly submission milestones.")
        elif assignment_completion < 60.0:
            academic_mod_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Low Assignment Submission",
                risk_category="Academic",
                severity="Moderate",
                current_value=f"{assignment_completion:.1f}%",
                threshold="<60%",
                message=f"Assignment completion ({assignment_completion:.1f}%) is lagging behind class average."
            ))

    # E. Historical Trend Alerts
    if prev_internal_marks is not None and internal_marks is not None:
        marks_drop = prev_internal_marks - internal_marks
        if marks_drop >= risk_thresholds.TREND_MARKS_DROP_ALERT:
            academic_mod_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Rapid Assessment Score Degradation",
                risk_category="Academic",
                severity="Moderate",
                current_value=f"-{marks_drop:.1f} pts",
                threshold=f">={risk_thresholds.TREND_MARKS_DROP_ALERT} pts drop",
                message=f"Assessment marks plummeted from {prev_internal_marks:.1f} to {internal_marks:.1f} (-{marks_drop:.1f} pts)."
            ))
            supporting_evidence.append(f"Sharp performance decline detected: {prev_internal_marks:.1f} -> {internal_marks:.1f}.")

    # ==========================
    # 2. PLACEMENT RISK EVALUATION
    # ==========================
    # A. Coding Proficiency
    if coding_score is not None:
        if coding_score < risk_thresholds.PLACEMENT_CRITICAL:
            placement_high_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Critical Technical Coding Gap",
                risk_category="Placement",
                severity="High",
                current_value=round(coding_score, 1),
                threshold=f"<{risk_thresholds.PLACEMENT_CRITICAL}",
                message=f"Coding score of {coding_score:.1f}/100 fails minimum campus drive screening criteria."
            ))
            supporting_evidence.append(f"Coding assessment ({coding_score:.1f}/100) is in critical risk zone.")
            recommended_actions.append("Enroll student in fast-track Hands-on Data Structures & Algorithms Lab.")
        elif coding_score < risk_thresholds.PLACEMENT_WARNING:
            placement_mod_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Moderate Coding Deficiency",
                risk_category="Placement",
                severity="Moderate",
                current_value=round(coding_score, 1),
                threshold=f"<{risk_thresholds.PLACEMENT_WARNING}",
                message=f"Coding score ({coding_score:.1f}/100) below competitive tier."
            ))
            recommended_actions.append("Assign daily problem-solving challenges on campus coding portal.")

    # B. Aptitude Assessment
    if aptitude_score is not None:
        if aptitude_score < 45.0:
            placement_high_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Low Quantitative Aptitude",
                risk_category="Placement",
                severity="High",
                current_value=round(aptitude_score, 1),
                threshold="<45",
                message=f"Aptitude score ({aptitude_score:.1f}/100) indicates vulnerability in company screening rounds."
            ))
            recommended_actions.append("Provide structured quantitative & logical reasoning modules.")
        elif aptitude_score < 60.0:
            placement_mod_flags += 1
            triggered_rules.append(RiskRuleTrigger(
                rule_name="Borderline Aptitude",
                risk_category="Placement",
                severity="Moderate",
                current_value=round(aptitude_score, 1),
                threshold="<60",
                message=f"Aptitude score ({aptitude_score:.1f}/100) requires reinforcement."
            ))

    # C. Mock Interview & Communication
    if mock_interview_score is not None and mock_interview_score < 50.0:
        placement_mod_flags += 1
        triggered_rules.append(RiskRuleTrigger(
            rule_name="Mock Interview Deficit",
            risk_category="Placement",
            severity="Moderate",
            current_value=round(mock_interview_score, 1),
            threshold="<50",
            message=f"Mock interview performance ({mock_interview_score:.1f}/100) needs professional polishing."
        ))
        recommended_actions.append("Schedule 1-on-1 mock technical and HR interview with industry alumni mentor.")

    # D. Placement Gap Rule: High CGPA, Low Placement Readiness
    if cgpa is not None and cgpa >= 7.5 and coding_score is not None and coding_score < 55.0:
        triggered_rules.append(RiskRuleTrigger(
            rule_name="Academic-to-Industry Skill Gap",
            risk_category="Placement",
            severity="High",
            current_value=f"CGPA {cgpa:.2f} vs Coding {coding_score:.0f}",
            threshold="CGPA>=7.5 & Coding<55",
            message="High academic grade but low technical coding readiness. High risk of missing premium recruitment drives."
        ))
        supporting_evidence.append(f"Strong CGPA ({cgpa:.2f}) contrasts with unready coding assessment ({coding_score:.0f}/100).")
        recommended_actions.append("Redirect student focus towards competitive programming rather than standard coursework.")

    # Determine Academic Risk Level
    if attendance_pct is None and internal_marks is None and cgpa is None:
        academic_risk_level = "Insufficient Data"
    elif academic_high_flags >= 1 or academic_mod_flags >= 2:
        academic_risk_level = "High"
    elif academic_mod_flags == 1:
        academic_risk_level = "Moderate"
    else:
        academic_risk_level = "Low"

    # Determine Placement Risk Level
    if coding_score is None and aptitude_score is None and mock_interview_score is None:
        placement_risk_level = "Insufficient Data"
    elif placement_high_flags >= 1 or placement_mod_flags >= 2:
        placement_risk_level = "High"
    elif placement_mod_flags == 1:
        placement_risk_level = "Moderate"
    else:
        placement_risk_level = "Low"

    # Overall urgency prioritization for Student Success Radar
    if academic_risk_level == "High" and placement_risk_level == "High":
        overall_urgency = "Critical"
    elif academic_risk_level == "High" or placement_risk_level == "High":
        overall_urgency = "High"
    elif academic_risk_level == "Moderate" or placement_risk_level == "Moderate":
        overall_urgency = "Moderate"
    else:
        overall_urgency = "Low"

    if not recommended_actions:
        recommended_actions.append("Continue regular academic tracking; student currently in good standing.")

    return RiskAssessment(
        academic_risk_level=academic_risk_level,
        placement_risk_level=placement_risk_level,
        overall_urgency=overall_urgency,
        triggered_rules=triggered_rules,
        supporting_evidence=supporting_evidence,
        recommended_actions=list(dict.fromkeys(recommended_actions)), # Deduplicate
        data_completeness=100.0,
        evaluated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )

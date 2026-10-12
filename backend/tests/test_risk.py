"""
Unit Tests for Risk Evaluation Engines
Tests separate academic and placement risk categorizations, threshold rules, and evidence triggers.
"""
import pytest
from app.services.risk_engine import evaluate_risk

def test_academic_risk_attendance_critical():
    # Attendance < 60% should trigger Critical Attendance Shortfall and High academic risk
    risk = evaluate_risk(
        cgpa=7.5,
        internal_marks=70.0,
        backlogs=0,
        attendance_pct=54.0, # Critical!
        assignment_completion=70.0,
        coding_score=75.0,
        aptitude_score=70.0,
        mock_interview_score=70.0,
        communication_score=70.0
    )
    assert risk.academic_risk_level == "High"
    rule_names = [r.rule_name for r in risk.triggered_rules]
    assert "Critical Attendance Shortfall" in rule_names
    assert risk.overall_urgency in ["High", "Critical"]

def test_academic_risk_multiple_backlogs():
    risk = evaluate_risk(
        cgpa=6.0,
        internal_marks=55.0,
        backlogs=3, # High concern!
        attendance_pct=80.0,
        assignment_completion=65.0,
        coding_score=60.0,
        aptitude_score=60.0,
        mock_interview_score=60.0,
        communication_score=60.0
    )
    assert risk.academic_risk_level == "High"
    assert any("Backlog" in r.rule_name for r in risk.triggered_rules)

def test_placement_risk_low_coding_high_cgpa_gap():
    # High CGPA (8.8) but low coding (34.0)
    risk = evaluate_risk(
        cgpa=8.8,
        internal_marks=85.0,
        backlogs=0,
        attendance_pct=90.0,
        assignment_completion=90.0,
        coding_score=34.0, # Critical coding gap
        aptitude_score=50.0,
        mock_interview_score=50.0,
        communication_score=65.0
    )
    assert risk.academic_risk_level == "Low"
    assert risk.placement_risk_level == "High"
    rule_names = [r.rule_name for r in risk.triggered_rules]
    assert "Critical Technical Coding Gap" in rule_names
    assert "Academic-to-Industry Skill Gap" in rule_names

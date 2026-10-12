"""
Unit Tests for Student Success Score Engine
Verifies mathematical correctness, component weightings, and missing data behavior.
"""
import pytest
from app.services.scoring_engine import (
    calculate_academic_component,
    calculate_attendance_component,
    calculate_engagement_component,
    calculate_placement_component,
    compute_success_score
)

def test_calculate_academic_component():
    # CGPA 8.0 (= 80), Internal Marks 80, Backlogs 0 -> (0.6*80 + 0.4*80) = 80.0
    score = calculate_academic_component(cgpa=8.0, internal_marks=80.0, backlogs=0)
    assert score == 80.0

    # Backlog penalty test: 1 backlog penalty is -8 pts -> 80.0 - 8 = 72.0
    score_with_backlog = calculate_academic_component(cgpa=8.0, internal_marks=80.0, backlogs=1)
    assert score_with_backlog == 72.0

    # Test clamping minimum to 0.0
    score_zero = calculate_academic_component(cgpa=1.0, internal_marks=10.0, backlogs=5)
    assert score_zero == 0.0

def test_calculate_attendance_component():
    assert calculate_attendance_component(85.5) == 85.5
    assert calculate_attendance_component(105.0) == 100.0
    assert calculate_attendance_component(-10.0) == 0.0
    assert calculate_attendance_component(None) is None

def test_compute_success_score_full_data():
    # Formula: 0.40 * Academic + 0.20 * Attendance + 0.15 * Engagement + 0.25 * Placement
    res = compute_success_score(
        cgpa=8.0,
        internal_marks=80.0,
        backlogs=0,
        attendance_pct=90.0,
        assignment_completion=80.0,
        login_frequency=25,
        event_participation=4,
        coding_score=80.0,
        aptitude_score=80.0,
        mock_interview_score=80.0,
        communication_score=80.0
    )
    assert res.overall_success_score is not None
    assert res.is_provisional is False
    assert res.completeness_percentage == 100.0
    assert len(res.positive_indicators) > 0

def test_compute_success_score_missing_data_provisional():
    # When placement score elements are missing, score should re-normalize across remaining components
    res = compute_success_score(
        cgpa=8.0,
        internal_marks=80.0,
        backlogs=0,
        attendance_pct=90.0,
        assignment_completion=80.0,
        login_frequency=25,
        event_participation=4,
        coding_score=None,
        aptitude_score=None,
        mock_interview_score=None,
        communication_score=None
    )
    assert res.overall_success_score is not None
    assert res.is_provisional is True
    assert "Placement" in [m.split()[0] for m in res.missing_indicators]

def test_compute_success_score_insufficient_data():
    # When less than 2 components available
    res = compute_success_score(
        cgpa=None,
        internal_marks=None,
        backlogs=0,
        attendance_pct=80.0,
        assignment_completion=None,
        login_frequency=None,
        event_participation=None,
        coding_score=None,
        aptitude_score=None,
        mock_interview_score=None,
        communication_score=None
    )
    assert res.overall_success_score is None
    assert res.status_label == "Insufficient Data"

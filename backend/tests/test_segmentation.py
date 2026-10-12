"""
Unit Tests for Student Segmentation Engine
"""
import pytest
from app.services.segmentation_engine import classify_student_segments

def test_academic_achievers_placement_unready_segment():
    segs = classify_student_segments(
        cgpa=8.8,
        internal_marks=85.0,
        backlogs=0,
        attendance_pct=90.0,
        assignment_completion=90.0,
        login_frequency=25,
        coding_score=35.0, # Low coding
        academic_score=85.0,
        engagement_score=88.0,
        placement_score=45.0
    )
    assert "Academic Achievers, Placement Unready" in segs

def test_academically_at_risk_segment():
    segs = classify_student_segments(
        cgpa=5.2,
        internal_marks=35.0,
        backlogs=2,
        attendance_pct=52.0,
        assignment_completion=30.0,
        login_frequency=4,
        coding_score=40.0,
        academic_score=42.0,
        engagement_score=35.0,
        placement_score=40.0
    )
    assert "Academically At Risk" in segs

def test_engaged_underperforming_segment():
    segs = classify_student_segments(
        cgpa=6.0,
        internal_marks=48.0,
        backlogs=0,
        attendance_pct=88.0,
        assignment_completion=85.0, # High engagement
        login_frequency=22,
        coding_score=50.0,
        academic_score=55.0,
        engagement_score=82.0,
        placement_score=52.0
    )
    assert "Engaged but Underperforming" in segs

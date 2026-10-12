"""
Unit Tests for Data Integration & Normalization
"""
import pytest
from app.services.ingestion_engine import (
    normalize_student_id,
    map_column_names,
    inspect_and_clean_dataset
)

def test_normalize_student_id():
    assert normalize_student_id("stu-1001") == "STU-1001"
    assert normalize_student_id("  STU-1002  ") == "STU-1002"
    assert normalize_student_id("stu_1003") == "STU1003" # cleans non-alphanumeric/hyphen

def test_map_column_names():
    cols = ["Roll No", "Student Name", "Branch", "GPA", "Attendance Pct", "DSA Score"]
    mapped = map_column_names(cols)
    assert mapped["Roll No"] == "student_id"
    assert mapped["Student Name"] == "name"
    assert mapped["Branch"] == "department"
    assert mapped["GPA"] == "cgpa"
    assert mapped["Attendance Pct"] == "attendance_percentage"
    assert mapped["DSA Score"] == "coding_score"

def test_inspect_and_clean_dataset_valid():
    csv_bytes = b"student_id,name,department,cgpa,attendance_percentage\nSTU-001,John Doe,CSE,8.5,88.0\nSTU-002,Jane Smith,ECE,7.2,74.0"
    report = inspect_and_clean_dataset(csv_bytes, "students.csv")
    assert report["success"] is True
    assert report["total_records_read"] == 2
    assert report["duplicates_detected"] == 0
    assert report["data_quality_score"] > 90

def test_inspect_and_clean_dataset_duplicates():
    csv_bytes = b"student_id,name,department,cgpa,attendance_percentage\nSTU-001,John Doe,CSE,8.5,88.0\nSTU-001,John Doe Duplicate,CSE,8.5,88.0"
    report = inspect_and_clean_dataset(csv_bytes, "students.csv")
    assert report["success"] is True
    assert report["duplicates_detected"] == 1

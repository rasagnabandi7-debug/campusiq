"""
CampusIQ Unified Data Ingestion & Quality Engine
Handles CSV ingestion, fuzzy column mapping, Student ID normalization,
duplicate detection, range validation, and quality scorecard reporting.
"""
import io
import re
from typing import Dict, Any, List, Tuple
import pandas as pd
from sqlalchemy.orm import Session
from ..models import (
    Student, AcademicRecord, AttendanceRecord, LMSRecord,
    PlacementRecord, EngagementRecord
)

# Standard canonical column aliases
COLUMN_ALIASES = {
    "student_id": ["student_id", "roll_no", "reg_no", "id", "usn", "enrollment_no"],
    "name": ["name", "student_name", "full_name", "candidate_name"],
    "department": ["department", "branch", "dept", "stream", "major"],
    "academic_year": ["academic_year", "year", "batch_year", "curr_year"],
    "semester": ["semester", "sem", "current_semester"],
    "cgpa": ["cgpa", "gpa", "cumulative_gpa"],
    "internal_marks": ["internal_marks", "internal", "midterm_score", "internals"],
    "backlogs": ["backlogs", "active_backlogs", "arrears", "pending_backlogs"],
    "attendance_percentage": ["attendance_percentage", "attendance", "att_pct", "attendance_percent"],
    "login_frequency": ["login_frequency", "lms_logins", "login_count", "logins"],
    "assignment_completion": ["assignment_completion", "assignment_pct", "assignments_completed"],
    "coding_score": ["coding_score", "coding", "code_assessment", "dsa_score"],
    "aptitude_score": ["aptitude_score", "aptitude", "quant_score", "reasoning_score"],
    "mock_interview_score": ["mock_interview_score", "interview_score", "mock_interview"],
    "communication_score": ["communication_score", "communication", "soft_skills"]
}

def normalize_student_id(raw_id: Any) -> str:
    """Normalizes student identifier to uppercase trimmed string."""
    if pd.isna(raw_id):
        return ""
    val = str(raw_id).strip().upper()
    # Normalize formats like stu-1001 or STU_1001 or 1001
    val = re.sub(r'[^A-Z0-9-]', '', val)
    return val

def map_column_names(df_columns: List[str]) -> Dict[str, str]:
    """Maps arbitrary incoming CSV headers to canonical schema names."""
    mapping = {}
    normalized_cols = {col: re.sub(r'[\s_-]+', '_', col.lower().strip()) for col in df_columns}

    for canonical, aliases in COLUMN_ALIASES.items():
        for orig_col, norm_col in normalized_cols.items():
            if norm_col in aliases:
                mapping[orig_col] = canonical
                break
    return mapping

def inspect_and_clean_dataset(content_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Parses and audits an uploaded CSV/Excel file, reporting data quality,
    duplicates, and validation issues before database ingestion.
    """
    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content_bytes))
        else:
            df = pd.read_csv(io.BytesIO(content_bytes))
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to parse file: {str(e)}"
        }

    total_rows = len(df)
    original_cols = list(df.columns)
    column_mapping = map_column_names(original_cols)

    # Rename mapped columns for validation
    df_mapped = df.rename(columns=column_mapping)

    warnings: List[str] = []
    missing_value_summary = {}

    for col in df_mapped.columns:
        null_count = int(df_mapped[col].isna().sum())
        if null_count > 0:
            pct = round((null_count / total_rows) * 100, 1)
            missing_value_summary[col] = {"null_count": null_count, "null_percentage": pct}
            if pct > 30:
                warnings.append(f"Column '{col}' has {pct}% missing values.")

    # Validate student_id
    if "student_id" not in df_mapped.columns:
        return {
            "success": False,
            "error": "Required identifier 'student_id' (or alias like roll_no, usn) could not be detected."
        }

    # Normalize student IDs
    df_mapped["student_id"] = df_mapped["student_id"].apply(normalize_student_id)
    blank_ids = int((df_mapped["student_id"] == "").sum())
    if blank_ids > 0:
        warnings.append(f"Rejected {blank_ids} rows with missing or blank student IDs.")

    # Duplicate detection
    duplicates = int(df_mapped.duplicated(subset=["student_id"]).sum())
    if duplicates > 0:
        warnings.append(f"Detected {duplicates} duplicate student records (duplicates will be deduplicated).")

    # Range validations
    if "cgpa" in df_mapped.columns:
        invalid_cgpa = ((df_mapped["cgpa"] < 0) | (df_mapped["cgpa"] > 10)).sum()
        if invalid_cgpa > 0:
            warnings.append(f"Found {invalid_cgpa} CGPA values outside valid [0, 10] range.")

    if "attendance_percentage" in df_mapped.columns:
        invalid_att = ((df_mapped["attendance_percentage"] < 0) | (df_mapped["attendance_percentage"] > 100)).sum()
        if invalid_att > 0:
            warnings.append(f"Found {invalid_att} attendance percentage values outside [0, 100] range.")

    # Calculate Data Quality Score (0 - 100)
    quality_deductions = (duplicates * 5) + (blank_ids * 10) + len(warnings) * 2
    quality_score = max(10, min(100, 100 - quality_deductions))

    # Preview sample (up to 5 records)
    preview_data = df_mapped.head(5).fillna("").to_dict(orient="records")

    return {
        "success": True,
        "filename": filename,
        "total_records_read": total_rows,
        "valid_records_count": total_rows - blank_ids,
        "duplicates_detected": duplicates,
        "column_mapping": column_mapping,
        "recognized_columns": list(column_mapping.values()),
        "unmapped_columns": [col for col in original_cols if col not in column_mapping],
        "missing_value_summary": missing_value_summary,
        "data_quality_score": quality_score,
        "warnings": warnings,
        "preview_records": preview_data
    }

def commit_ingested_dataset(db: Session, content_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Ingests cleaned records into SQLite database, inserting or updating student entities.
    """
    audit = inspect_and_clean_dataset(content_bytes, filename)
    if not audit.get("success"):
        return audit

    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content_bytes))
        else:
            df = pd.read_csv(io.BytesIO(content_bytes))
    except Exception as e:
        return {"success": False, "error": str(e)}

    column_mapping = map_column_names(list(df.columns))
    df = df.rename(columns=column_mapping)
    df["student_id"] = df["student_id"].apply(normalize_student_id)
    df = df[df["student_id"] != ""].drop_duplicates(subset=["student_id"])

    matched_count = 0
    created_count = 0

    for _, row in df.iterrows():
        stu_id = str(row["student_id"])
        student = db.query(Student).filter(Student.student_id == stu_id).first()

        dept = str(row.get("department", "General Engineering"))
        name = str(row.get("name", f"Student {stu_id}"))
        year = int(row.get("academic_year", 3)) if pd.notna(row.get("academic_year")) else 3
        sem = int(row.get("semester", 5)) if pd.notna(row.get("semester")) else 5

        if not student:
            student = Student(
                student_id=stu_id,
                name=name,
                email=f"{stu_id.lower()}@campusiq.edu",
                department=dept,
                academic_year=year,
                semester=sem
            )
            db.add(student)
            created_count += 1
        else:
            matched_count += 1
            if pd.notna(row.get("name")):
                student.name = name
            if pd.notna(row.get("department")):
                student.department = dept

        db.flush()

        # Update / Insert Academic Record
        if any(k in row for k in ["cgpa", "internal_marks", "backlogs"]):
            acad = db.query(AcademicRecord).filter(AcademicRecord.student_id == stu_id).first()
            if not acad:
                acad = AcademicRecord(student_id=stu_id)
                db.add(acad)
            if "cgpa" in row and pd.notna(row["cgpa"]):
                acad.cgpa = float(row["cgpa"])
            if "internal_marks" in row and pd.notna(row["internal_marks"]):
                acad.internal_marks = float(row["internal_marks"])
            if "backlogs" in row and pd.notna(row["backlogs"]):
                acad.backlogs = int(row["backlogs"])

        # Update / Insert Attendance Record
        if "attendance_percentage" in row and pd.notna(row["attendance_percentage"]):
            att = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == stu_id).first()
            if not att:
                att = AttendanceRecord(student_id=stu_id)
                db.add(att)
            att.attendance_percentage = float(row["attendance_percentage"])

        # Update / Insert LMS Record
        if any(k in row for k in ["login_frequency", "assignment_completion"]):
            lms = db.query(LMSRecord).filter(LMSRecord.student_id == stu_id).first()
            if not lms:
                lms = LMSRecord(student_id=stu_id)
                db.add(lms)
            if "login_frequency" in row and pd.notna(row["login_frequency"]):
                lms.login_frequency = int(row["login_frequency"])
            if "assignment_completion" in row and pd.notna(row["assignment_completion"]):
                lms.assignment_completion = float(row["assignment_completion"])

        # Update / Insert Placement Record
        if any(k in row for k in ["coding_score", "aptitude_score", "mock_interview_score"]):
            plc = db.query(PlacementRecord).filter(PlacementRecord.student_id == stu_id).first()
            if not plc:
                plc = PlacementRecord(student_id=stu_id)
                db.add(plc)
            if "coding_score" in row and pd.notna(row["coding_score"]):
                plc.coding_score = float(row["coding_score"])
            if "aptitude_score" in row and pd.notna(row["aptitude_score"]):
                plc.aptitude_score = float(row["aptitude_score"])
            if "mock_interview_score" in row and pd.notna(row["mock_interview_score"]):
                plc.mock_interview_score = float(row["mock_interview_score"])

    db.commit()

    return {
        "success": True,
        "message": f"Successfully integrated {len(df)} student records.",
        "records_created": created_count,
        "records_updated": matched_count,
        "total_active_students": db.query(Student).count()
    }

"""
SQLAlchemy Data Models for CampusIQ
Maps normalized higher education student records, assessments, logs, and interventions.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
)
from sqlalchemy.orm import relationship
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=True)
    department = Column(String(64), index=True, nullable=False)
    academic_year = Column(Integer, nullable=False)  # 1, 2, 3, 4
    semester = Column(Integer, nullable=False)       # 1 to 8
    section = Column(String(16), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    academic_records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")
    lms_records = relationship("LMSRecord", back_populates="student", cascade="all, delete-orphan")
    engagement_records = relationship("EngagementRecord", back_populates="student", cascade="all, delete-orphan")
    placement_records = relationship("PlacementRecord", back_populates="student", cascade="all, delete-orphan")
    skill_records = relationship("SkillRecord", back_populates="student", cascade="all, delete-orphan")
    feedback_records = relationship("FeedbackRecord", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")

class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    cgpa = Column(Float, nullable=True)                  # 0.0 to 10.0
    internal_marks = Column(Float, nullable=True)        # 0.0 to 100.0
    previous_internal_marks = Column(Float, nullable=True) # Historical comparison
    backlogs = Column(Integer, default=0)
    assessment_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="academic_records")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_percentage = Column(Float, nullable=True) # 0.0 to 100.0
    previous_attendance = Column(Float, nullable=True)  # Historical comparison
    record_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="attendance_records")

class LMSRecord(Base):
    __tablename__ = "lms_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    login_frequency = Column(Integer, default=0)         # logins per month
    assignment_completion = Column(Float, nullable=True) # 0.0 to 100.0%
    previous_assignment_completion = Column(Float, nullable=True)
    overdue_assignments = Column(Integer, default=0)
    learning_activity_hours = Column(Float, default=0.0) # hours per week
    record_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="lms_records")

class EngagementRecord(Base):
    __tablename__ = "engagement_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    event_participation = Column(Integer, default=0)    # count of events attended
    hackathons = Column(Integer, default=0)
    certifications = Column(Integer, default=0)
    club_involvement = Column(String(128), nullable=True)
    record_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="engagement_records")

class PlacementRecord(Base):
    __tablename__ = "placement_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    aptitude_score = Column(Float, nullable=True)       # 0.0 to 100.0
    coding_score = Column(Float, nullable=True)         # 0.0 to 100.0
    previous_coding_score = Column(Float, nullable=True)
    mock_interview_score = Column(Float, nullable=True) # 0.0 to 100.0
    communication_score = Column(Float, nullable=True)  # 0.0 to 100.0
    resume_readiness = Column(Float, default=50.0)      # 0.0 to 100.0
    placed_outcome = Column(Integer, nullable=True)     # 1 = Placed, 0 = Unplaced (historical label for ML)
    assessment_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="placement_records")

class SkillRecord(Base):
    __tablename__ = "skill_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    technical_score = Column(Float, nullable=True)
    problem_solving_score = Column(Float, nullable=True)
    soft_skill_score = Column(Float, nullable=True)
    assessment_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="skill_records")

class FeedbackRecord(Base):
    __tablename__ = "feedback_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    satisfaction_score = Column(Float, nullable=True)   # 1.0 to 5.0
    faculty_feedback = Column(Text, nullable=True)
    feedback_date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="feedback_records")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(32), ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    intervention_type = Column(String(64), nullable=False)  # "Faculty Mentoring", "Remedial Sessions", "Coding Bootcamp", "Attendance Monitoring", "Aptitude Coaching", "Mock Interview Prep"
    description = Column(Text, nullable=False)
    priority = Column(String(16), default="Medium")         # "High", "Medium", "Low"
    assigned_to = Column(String(128), default="Faculty Advisor")
    due_date = Column(String(32), nullable=True)
    status = Column(String(32), default="Recommended")      # "Recommended", "Assigned", "In Progress", "Completed", "Follow-up Required"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # Outcome tracking fields
    initial_metric_type = Column(String(64), nullable=True) # e.g. "attendance", "coding_score", "internal_marks"
    initial_metric_val = Column(Float, nullable=True)
    outcome_metric_val = Column(Float, nullable=True)
    observed_change = Column(String(128), nullable=True)

    student = relationship("Student", back_populates="interventions")

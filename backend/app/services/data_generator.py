"""
CampusIQ Synthetic Data Generator
Generates realistic, reproducible (seed=42) student cohorts across engineering departments
with diverse archetypes, historical trends, and outcome tracking records.
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..models import (
    Student, AcademicRecord, AttendanceRecord, LMSRecord,
    EngagementRecord, PlacementRecord, SkillRecord, FeedbackRecord, Intervention
)
from .ml_engine import train_placement_model

DEPARTMENTS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Data Science & AI",
    "Electronics & Communication",
    "Electrical & Electronics",
    "Mechanical Engineering"
]

FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Arjun", "Bhavya", "Chetan", "Dev", "Divya",
    "Ishaan", "Kavya", "Manish", "Meera", "Neha", "Nikhil", "Pooja", "Pranav",
    "Rahul", "Rhea", "Rohan", "Saanvi", "Siddharth", "Sneha", "Tanvi", "Varun",
    "Vikram", "Yash", "Zoya", "Aditya", "Akanksha", "Deepak", "Harsh", "Karan",
    "Natasha", "Priyanka", "Rohit", "Shreya", "Simran", "Tarun", "Vidya", "Vivek"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Kulkarni", "Deshmukh",
    "Gupta", "Malhotra", "Mehta", "Chopra", "Joshi", "Bose", "Das", "Rao",
    "Singh", "Choudhury", "Menon", "Saxena", "Bhat", "Kapoor", "Pillai", "Agarwal"
]

def generate_cohort(db: Session, student_count: int = 420, seed: int = 42):
    """
    Populates database with deterministic, richly distributed student records.
    """
    random.seed(seed)
    np.random.seed(seed)

    # Check if already seeded
    if db.query(Student).count() > 0:
        return

    students_to_add = []
    academic_records = []
    attendance_records = []
    lms_records = []
    engagement_records = []
    placement_records = []
    skill_records = []
    feedback_records = []
    interventions_to_add = []

    # Dataset for training ML model
    df_rows = []

    # Explicit benchmark student archetypes to ensure demo scenario 100% hits:
    # 1. STU-1001: Stellar all-rounder
    # 2. STU-1002: Critical Academic & Attendance Crisis
    # 3. STU-1003: Academic Achiever, Placement Unready (High CGPA, Low Coding)
    # 4. STU-1004: Engaged but Underperforming (High Effort, Low Exam Marks)
    # 5. STU-1005: Low Recorded Engagement
    # 6. STU-1006: Sharp Declining Performance (Trend Alert)

    archetypes = {
        1001: {"name": "Aarav Sharma", "dept": "Computer Science & Engineering", "year": 4, "cgpa": 9.2, "internal": 88.0, "backlogs": 0, "att": 94.0, "prev_att": 92.0, "lms_logins": 28, "assign": 96.0, "coding": 92.0, "prev_coding": 84.0, "apt": 90.0, "mock": 88.0, "comm": 92.0, "events": 5, "placed": 1},
        1002: {"name": "Rohan Verma", "dept": "Electronics & Communication", "year": 3, "cgpa": 5.4, "internal": 34.0, "backlogs": 3, "att": 54.0, "prev_att": 68.0, "lms_logins": 4, "assign": 32.0, "coding": 38.0, "prev_coding": 40.0, "apt": 38.0, "mock": 35.0, "comm": 45.0, "events": 0, "placed": 0},
        1003: {"name": "Ananya Patel", "dept": "Computer Science & Engineering", "year": 4, "cgpa": 8.8, "internal": 82.0, "backlogs": 0, "att": 86.0, "prev_att": 85.0, "lms_logins": 22, "assign": 90.0, "coding": 34.0, "prev_coding": 32.0, "apt": 48.0, "mock": 42.0, "comm": 68.0, "events": 2, "placed": 0},
        1004: {"name": "Divya Nair", "dept": "Information Technology", "year": 3, "cgpa": 6.1, "internal": 48.0, "backlogs": 0, "att": 88.0, "prev_att": 87.0, "lms_logins": 24, "assign": 82.0, "coding": 46.0, "prev_coding": 44.0, "apt": 52.0, "mock": 50.0, "comm": 58.0, "events": 1, "placed": 0},
        1005: {"name": "Vikram Rao", "dept": "Mechanical Engineering", "year": 2, "cgpa": 6.0, "internal": 50.0, "backlogs": 1, "att": 58.0, "prev_att": 62.0, "lms_logins": 6, "assign": 38.0, "coding": 42.0, "prev_coding": 40.0, "apt": 44.0, "mock": 40.0, "comm": 52.0, "events": 0, "placed": 0},
        1006: {"name": "Saanvi Reddy", "dept": "Data Science & AI", "year": 3, "cgpa": 7.4, "internal": 52.0, "prev_internal": 76.0, "backlogs": 0, "att": 64.0, "prev_att": 85.0, "lms_logins": 14, "assign": 58.0, "prev_assign": 88.0, "coding": 60.0, "prev_coding": 62.0, "apt": 65.0, "mock": 60.0, "comm": 66.0, "events": 2, "placed": 1},
    }

    for i in range(1, student_count + 1):
        stu_num = 1000 + i
        stu_id = f"STU-{stu_num}"

        if stu_num in archetypes:
            arch = archetypes[stu_num]
            name = arch["name"]
            dept = arch["dept"]
            year = arch["year"]
            sem = (year * 2) - random.choice([0, 1])
            cgpa = arch["cgpa"]
            internal = arch["internal"]
            prev_internal = arch.get("prev_internal", round(internal + random.uniform(-4, 4), 1))
            backlogs = arch["backlogs"]
            att = arch["att"]
            prev_att = arch.get("prev_att", att)
            lms_logins = arch["lms_logins"]
            assign = arch["assign"]
            prev_assign = arch.get("prev_assign", assign)
            coding = arch["coding"]
            prev_coding = arch.get("prev_coding", coding)
            apt = arch["apt"]
            mock = arch["mock"]
            comm = arch["comm"]
            events = arch["events"]
            placed = arch["placed"]
        else:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            dept = random.choice(DEPARTMENTS)
            year = random.choice([1, 2, 3, 4])
            sem = (year * 2) - random.choice([0, 1])

            # Generate archetype distributions:
            # 55% normal distribution, 15% high academic low coding, 15% academic at risk, 15% high achievers
            cohort_type = random.choices(["normal", "gap", "at_risk", "achiever"], weights=[0.55, 0.15, 0.15, 0.15])[0]

            if cohort_type == "achiever":
                cgpa = round(random.uniform(8.3, 9.8), 2)
                internal = round(random.uniform(80.0, 95.0), 1)
                prev_internal = round(internal + random.uniform(-3, 3), 1)
                backlogs = 0
                att = round(random.uniform(84.0, 98.0), 1)
                prev_att = round(att + random.uniform(-3, 3), 1)
                lms_logins = random.randint(20, 35)
                assign = round(random.uniform(85.0, 100.0), 1)
                prev_assign = round(assign + random.uniform(-4, 2), 1)
                coding = round(random.uniform(75.0, 98.0), 1)
                prev_coding = round(coding + random.uniform(-5, 5), 1)
                apt = round(random.uniform(75.0, 95.0), 1)
                mock = round(random.uniform(75.0, 95.0), 1)
                comm = round(random.uniform(75.0, 95.0), 1)
                events = random.randint(2, 6)
                placed = 1
            elif cohort_type == "at_risk":
                cgpa = round(random.uniform(4.5, 6.3), 2)
                internal = round(random.uniform(28.0, 52.0), 1)
                prev_internal = round(internal + random.uniform(-2, 18), 1) # some with drops
                backlogs = random.choices([1, 2, 3, 4], weights=[0.4, 0.35, 0.15, 0.1])[0]
                att = round(random.uniform(48.0, 68.0), 1)
                prev_att = round(att + random.uniform(0, 18), 1) # some with sharp drops
                lms_logins = random.randint(2, 12)
                assign = round(random.uniform(25.0, 55.0), 1)
                prev_assign = round(assign + random.uniform(-5, 15), 1)
                coding = round(random.uniform(22.0, 48.0), 1)
                prev_coding = round(coding + random.uniform(-5, 5), 1)
                apt = round(random.uniform(30.0, 50.0), 1)
                mock = round(random.uniform(25.0, 48.0), 1)
                comm = round(random.uniform(35.0, 55.0), 1)
                events = random.randint(0, 1)
                placed = 0
            elif cohort_type == "gap":
                # High CGPA, Low Placement Readiness
                cgpa = round(random.uniform(7.8, 9.2), 2)
                internal = round(random.uniform(72.0, 88.0), 1)
                prev_internal = round(internal + random.uniform(-3, 3), 1)
                backlogs = 0
                att = round(random.uniform(76.0, 92.0), 1)
                prev_att = round(att + random.uniform(-2, 2), 1)
                lms_logins = random.randint(15, 26)
                assign = round(random.uniform(75.0, 92.0), 1)
                prev_assign = round(assign + random.uniform(-3, 3), 1)
                coding = round(random.uniform(28.0, 49.0), 1) # Low coding!
                prev_coding = round(coding + random.uniform(-4, 4), 1)
                apt = round(random.uniform(42.0, 58.0), 1)
                mock = round(random.uniform(38.0, 55.0), 1)
                comm = round(random.uniform(55.0, 75.0), 1)
                events = random.randint(1, 3)
                placed = 0 if coding < 45 else random.choice([0, 1])
            else: # Normal distribution
                cgpa = round(random.uniform(6.5, 8.2), 2)
                internal = round(random.uniform(55.0, 78.0), 1)
                prev_internal = round(internal + random.uniform(-6, 6), 1)
                backlogs = 0 if random.random() > 0.15 else 1
                att = round(random.uniform(68.0, 86.0), 1)
                prev_att = round(att + random.uniform(-5, 5), 1)
                lms_logins = random.randint(10, 22)
                assign = round(random.uniform(60.0, 82.0), 1)
                prev_assign = round(assign + random.uniform(-5, 5), 1)
                coding = round(random.uniform(52.0, 74.0), 1)
                prev_coding = round(coding + random.uniform(-6, 6), 1)
                apt = round(random.uniform(55.0, 75.0), 1)
                mock = round(random.uniform(52.0, 72.0), 1)
                comm = round(random.uniform(58.0, 78.0), 1)
                events = random.randint(1, 3)
                # Realistic placement probability based on combination
                pl_score = 0.35 * coding + 0.25 * apt + 0.2 * mock + 0.2 * comm
                placed = 1 if (pl_score >= 62.0 and cgpa >= 7.0 and backlogs == 0) else 0

        # Create student entity
        student = Student(
            student_id=stu_id,
            name=name,
            email=f"{name.lower().replace(' ', '.')}@campusiq.edu",
            department=dept,
            academic_year=year,
            semester=sem,
            section=random.choice(["A", "B", "C"])
        )
        students_to_add.append(student)

        # Academic Record
        academic_records.append(AcademicRecord(
            student_id=stu_id,
            cgpa=cgpa,
            internal_marks=internal,
            previous_internal_marks=prev_internal,
            backlogs=backlogs
        ))

        # Attendance Record
        attendance_records.append(AttendanceRecord(
            student_id=stu_id,
            attendance_percentage=att,
            previous_attendance=prev_att
        ))

        # LMS Record
        lms_records.append(LMSRecord(
            student_id=stu_id,
            login_frequency=lms_logins,
            assignment_completion=assign,
            previous_assignment_completion=prev_assign,
            overdue_assignments=max(0, int((100 - assign) / 15)),
            learning_activity_hours=round(lms_logins * 0.8, 1)
        ))

        # Engagement Record
        engagement_records.append(EngagementRecord(
            student_id=stu_id,
            event_participation=events,
            hackathons=max(0, events - 1),
            certifications=max(0, int(events / 2)),
            club_involvement="Tech Club" if events > 2 else "General"
        ))

        # Placement Record
        placement_records.append(PlacementRecord(
            student_id=stu_id,
            aptitude_score=apt,
            coding_score=coding,
            previous_coding_score=prev_coding,
            mock_interview_score=mock,
            communication_score=comm,
            resume_readiness=round(min(100.0, 40.0 + events * 10 + (comm or 50) * 0.3), 1),
            placed_outcome=placed
        ))

        # Skill Record
        skill_records.append(SkillRecord(
            student_id=stu_id,
            technical_score=coding,
            problem_solving_score=apt,
            soft_skill_score=comm
        ))

        # Feedback Record
        feedback_records.append(FeedbackRecord(
            student_id=stu_id,
            satisfaction_score=round(random.uniform(3.2, 4.8), 1),
            faculty_feedback="Active participant" if cgpa > 7.5 else "Needs regular supervision"
        ))

        # Record for ML model training
        df_rows.append({
            "cgpa": cgpa,
            "internal_marks": internal,
            "attendance_percentage": att,
            "coding_score": coding,
            "aptitude_score": apt,
            "mock_interview_score": mock,
            "communication_score": comm,
            "backlogs": backlogs,
            "certifications": max(0, int(events / 2)),
            "placed_outcome": placed
        })

        # Prepopulate realistic interventions for specific archetypes to enable instant demo flow
        if stu_num == 1002: # Critical Academic student
            interventions_to_add.append(Intervention(
                student_id=stu_id,
                intervention_type="Remedial Sessions",
                description="Mandatory 4-week remedial classes in Signals & Systems to recover backlogs and low internal marks.",
                priority="High",
                assigned_to="Prof. K. R. Sharma (ECE)",
                due_date=(datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d"),
                status="Assigned",
                notes="Initial diagnostic showed weakness in Fourier Transform. Student agreed to 3 weekly sessions.",
                initial_metric_type="internal_marks",
                initial_metric_val=34.0,
                outcome_metric_val=None,
                observed_change=None
            ))
            interventions_to_add.append(Intervention(
                student_id=stu_id,
                intervention_type="Attendance Monitoring",
                description="Bi-weekly attendance tracking agreement after dropping below 60% threshold.",
                priority="High",
                assigned_to="Dr. Sunita Rao (Dean Student Affairs)",
                due_date=(datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
                status="In Progress",
                notes="Contacted student parents; medical illness reported for previous absences.",
                initial_metric_type="attendance",
                initial_metric_val=54.0,
                outcome_metric_val=None,
                observed_change=None
            ))
        elif stu_num == 1003: # High CGPA, Low Placement student
            interventions_to_add.append(Intervention(
                student_id=stu_id,
                intervention_type="Coding Bootcamp",
                description="Enrolled in Campus Elite Coding Accelerator. Focus on LeetCode Medium algorithms.",
                priority="High",
                assigned_to="Placement Training Cell",
                due_date=(datetime.utcnow() + timedelta(days=21)).strftime("%Y-%m-%d"),
                status="Recommended",
                notes="Student has high potential (CGPA 8.8) but lacks data structures problem-solving confidence.",
                initial_metric_type="coding_score",
                initial_metric_val=34.0,
                outcome_metric_val=None,
                observed_change=None
            ))
        elif stu_num == 1004: # Engaged underperforming
            interventions_to_add.append(Intervention(
                student_id=stu_id,
                intervention_type="Faculty Mentoring",
                description="Weekly 1-on-1 exam prep review to bridge high LMS engagement into better test scores.",
                priority="Medium",
                assigned_to="Dr. Amit Deshmukh",
                due_date=(datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d"),
                status="In Progress",
                notes="Working on past year question papers.",
                initial_metric_type="internal_marks",
                initial_metric_val=48.0,
                outcome_metric_val=None,
                observed_change=None
            ))
        elif stu_num == 1010: # Completed intervention with real outcome tracker before-and-after!
            interventions_to_add.append(Intervention(
                student_id=stu_id,
                intervention_type="Attendance Monitoring",
                description="Mandatory advisory check-in after attendance slipped to 61%.",
                priority="High",
                assigned_to="Prof. H. Saxena",
                due_date=(datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d"),
                status="Completed",
                notes="Student successfully cleared makeup lab sessions and attended 100% of lectures in past month.",
                initial_metric_type="attendance",
                initial_metric_val=61.0,
                outcome_metric_val=74.5,
                observed_change="Attendance increased from 61.0% to 74.5% (+13.5% gain)"
            ))
        elif stu_num == 1015: # Completed coding outcome tracker
            interventions_to_add.append(Intervention(
                student_id=stu_id,
                intervention_type="Coding Bootcamp",
                description="Fast-track 3-week competitive programming lab.",
                priority="Medium",
                assigned_to="Placement Cell",
                due_date=(datetime.utcnow() - timedelta(days=8)).strftime("%Y-%m-%d"),
                status="Completed",
                notes="Completed 35 coding challenges on campus platform.",
                initial_metric_type="coding_score",
                initial_metric_val=38.0,
                outcome_metric_val=58.0,
                observed_change="Coding assessment increased from 38.0 to 58.0 (+20 pts gain)"
            ))

    # Commit all models to database
    db.add_all(students_to_add)
    db.commit()

    db.add_all(academic_records)
    db.add_all(attendance_records)
    db.add_all(lms_records)
    db.add_all(engagement_records)
    db.add_all(placement_records)
    db.add_all(skill_records)
    db.add_all(feedback_records)
    db.add_all(interventions_to_add)
    db.commit()

    # Train placement model on historical cohort data
    df = pd.DataFrame(df_rows)
    train_placement_model(df)

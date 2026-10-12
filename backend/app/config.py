"""
CampusIQ Platform Configuration
Defines transparent weights, risk thresholds, and platform settings.
All scoring logic references these centralized parameters.
"""
from pydantic import BaseModel
from typing import Dict

class ScoringWeights(BaseModel):
    # Overall Success Score component weights (must sum to 1.0)
    ACADEMIC_WEIGHT: float = 0.40
    ATTENDANCE_WEIGHT: float = 0.20
    ENGAGEMENT_WEIGHT: float = 0.15
    PLACEMENT_WEIGHT: float = 0.25

    # Academic sub-weights
    CGPA_WEIGHT: float = 0.60
    INTERNAL_MARKS_WEIGHT: float = 0.40
    BACKLOG_PENALTY_PER_ITEM: float = 8.0  # Deduction per active backlog

    # Learning Engagement sub-weights
    ASSIGNMENT_COMPLETION_WEIGHT: float = 0.50
    LMS_ACTIVITY_WEIGHT: float = 0.30
    EVENT_PARTICIPATION_WEIGHT: float = 0.20

    # Placement Readiness sub-weights
    CODING_WEIGHT: float = 0.35
    APTITUDE_WEIGHT: float = 0.25
    MOCK_INTERVIEW_WEIGHT: float = 0.20
    COMMUNICATION_WEIGHT: float = 0.20

class RiskThresholds(BaseModel):
    # Attendance thresholds
    ATTENDANCE_CRITICAL: float = 60.0    # Below 60% = High concern
    ATTENDANCE_WARNING: float = 75.0     # 60% to 75% = Moderate concern

    # Assessment thresholds
    ASSESSMENT_CRITICAL: float = 40.0    # Below 40 = High concern
    ASSESSMENT_WARNING: float = 60.0     # 40 to 60 = Moderate concern

    # Backlog thresholds
    BACKLOG_HIGH_RISK_COUNT: int = 2     # >= 2 backlogs = High concern
    BACKLOG_MOD_RISK_COUNT: int = 1      # 1 backlog = Moderate concern

    # Placement score thresholds
    PLACEMENT_CRITICAL: float = 45.0
    PLACEMENT_WARNING: float = 65.0

    # Trend degradation thresholds (in points drop)
    TREND_ATTENDANCE_DROP_ALERT: float = 12.0
    TREND_MARKS_DROP_ALERT: float = 15.0
    TREND_ASSIGNMENT_DROP_ALERT: float = 20.0

class Settings(BaseModel):
    PROJECT_NAME: str = "CampusIQ"
    TAGLINE: str = "Predict Early. Intervene Smartly. Empower Every Student."
    VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./campusiq.db"
    RANDOM_SEED: int = 42

settings = Settings()
scoring_weights = ScoringWeights()
risk_thresholds = RiskThresholds()

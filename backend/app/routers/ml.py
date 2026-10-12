"""
Machine Learning Model Router
Exposes supervised placement model evaluation metrics, feature importances, and ethical boundaries.
"""
from fastapi import APIRouter
from ..services.ml_engine import get_model_info

router = APIRouter(prefix="/api/ml", tags=["machine_learning"])

@router.get("/model-info")
def get_placement_model_info():
    """Returns supervised model architecture, accuracy, recall, precision, and feature weights."""
    return get_model_info()

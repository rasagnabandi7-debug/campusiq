"""
CampusIQ Copilot API Router
Exposes natural-language and deterministic decision support query interface.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import CopilotQueryRequest, CopilotResponse
from ..services.copilot_engine import query_copilot, COPILOT_SUGGESTIONS

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

@router.post("/query", response_model=CopilotResponse)
def handle_copilot_query(payload: CopilotQueryRequest, db: Session = Depends(get_db)):
    result = query_copilot(db, payload.query)
    return CopilotResponse(**result)

@router.get("/suggestions")
def get_copilot_suggestions():
    return {
        "suggestions": COPILOT_SUGGESTIONS
    }

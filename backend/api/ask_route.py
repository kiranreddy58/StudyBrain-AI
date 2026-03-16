from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.rag.rag_pipeline import run_rag_pipeline

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    provider: Optional[str] = "auto"

@router.post("/ask")
async def ask_question(request: QuestionRequest):
    if not request.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    try:
        response = await run_rag_pipeline(request.question, provider=request.provider)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

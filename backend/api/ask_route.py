from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.rag.rag_pipeline import run_rag_pipeline
from backend.storage.chat_store import save_chat_message, get_chat_history, clear_chat_history

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    provider: Optional[str] = "auto"

@router.post("/ask")
async def ask_question(request: QuestionRequest):
    if not request.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    try:
        # Save user message
        save_chat_message("user", request.question)
        
        response = await run_rag_pipeline(request.question, provider=request.provider)
        
        # Save assistant message
        save_chat_message("assistant", response["answer"])
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def chat_history(limit: int = 50, doc_id: Optional[str] = None):
    return {"history": get_chat_history(limit=limit, doc_id=doc_id)}

@router.delete("/history")
async def clear_history(doc_id: Optional[str] = None):
    clear_chat_history(doc_id=doc_id)
    return {"status": "cleared"}

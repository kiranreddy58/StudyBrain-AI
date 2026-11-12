from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.rag.rag_pipeline import run_rag_pipeline
from backend.storage.chat_store import save_chat_message, get_chat_history, clear_chat_history
from backend.api.auth_routes import get_current_user_optional

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    provider: Optional[str] = "auto"
    doc_id: Optional[str] = None

@router.post("/ask")
async def ask_question(request: QuestionRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    if not request.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    user_id = user["id"] if user else "default"
    try:
        save_chat_message("user", request.question, doc_id=request.doc_id, user_id=user_id)
        
        response = await run_rag_pipeline(request.question, provider=request.provider, user_id=user_id)
        
        save_chat_message("assistant", response["answer"], doc_id=request.doc_id, user_id=user_id)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def chat_history(limit: int = 50, doc_id: Optional[str] = None, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    return {"history": get_chat_history(limit=limit, doc_id=doc_id, user_id=user_id)}

@router.delete("/history")
async def clear_history(doc_id: Optional[str] = None, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    clear_chat_history(doc_id=doc_id, user_id=user_id)
    return {"status": "cleared"}

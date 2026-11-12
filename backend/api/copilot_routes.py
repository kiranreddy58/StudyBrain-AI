"""
Copilot Routes — Phase 5 with Multi-User Isolation
RAG-powered AI assistant endpoints:
  POST /generate-quiz     — generate quiz questions from study materials
  POST /explain           — explain a concept using RAG context
  POST /assignment-help   — step-by-step assignment guidance
  GET  /learning-progress — aggregate mastery + recommendations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from backend.rag.retriever import retrieve_context, format_context_for_llm
from backend.llm.llm_interface import llm
from backend.storage.chat_store import save_chat_message
from backend.learning.mastery_model import get_all_mastery
from backend.learning.recommendation_engine import recommend_next_topics
from backend.learning.difficulty_adjuster import adjust_question_difficulty
from backend.api.auth_routes import get_current_user_optional

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "auto"
    provider: Optional[str] = "auto"
    filename: Optional[str] = None

class ConceptRequest(BaseModel):
    concept: str
    provider: Optional[str] = "auto"

class AssignmentRequest(BaseModel):
    question: str
    provider: Optional[str] = "auto"

@router.post("/generate-quiz")
async def generate_quiz(request: QuizRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    """Generate interactive quiz questions from study materials."""
    user_id = user["id"] if user else "default"
    try:
        if request.difficulty == "auto":
            diff_info = adjust_question_difficulty(request.topic, user_id=user_id)
            difficulty = diff_info["difficulty"]
        else:
            difficulty = request.difficulty

        chunks = retrieve_context(request.topic, top_k=10, source=request.filename, user_id=user_id)
        context = format_context_for_llm(chunks)

        prompt = (
            f"As an AI tutor, create a {difficulty} quiz with {request.num_questions} questions about '{request.topic}'.\n"
            "Use ONLY provided context. Return ONLY JSON:\n"
            "{\n"
            "  \"questions\": [\n"
            "    {\n"
            "      \"question\": \"Short question\", \n"
            "      \"options\": [\"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\"],\n"
            "      \"correct_index\": 0,\n"
            "      \"explanations\": {\"0\": \"Correct because...\", \"1\": \"Incorrect because...\", \"2\": \"...\", \"3\": \"...\"},\n"
            "      \"reference\": \"Context snippet\"\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            f"Context:\n{context}\n\n"
            "JSON Response:"
        )

        result = await llm.generate_answer(prompt, context, provider=request.provider, specialized_prompt=True)
        
        import json
        try:
            raw_text = result["answer"].strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.split("```json", 1)[1].split("```", 1)[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.split("```", 1)[1].split("```", 1)[0].strip()
            
            quiz_data = json.loads(raw_text)
            return {
                "topic": request.topic,
                "difficulty": difficulty,
                "quiz": quiz_data["questions"],
                "sources": result["sources"],
            }
        except Exception as e:
            return {
                "topic": request.topic,
                "error": "AI failed to generate a structured quiz. Please try again.",
                "raw_result": result["answer"]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def explain_concept(request: ConceptRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    """Explain a concept using relevant study material chunks."""
    user_id = user["id"] if user else "default"
    try:
        chunks = retrieve_context(request.concept, top_k=4, user_id=user_id)
        context = format_context_for_llm(chunks)

        prompt = (
            f"As an expert tutor, explain the concept: '{request.concept}'.\n"
            "Use the provided context. Structure your response for a modern UI:\n"
            "1. **Overview**: A 2-sentence simple summary.\n"
            "2. **Detailed Breakdown**: Use bullet points for key points.\n"
            "3. **Example**: Provide a concrete example from the text.\n"
            "4. **Key Takeaway**: One closing sentence.\n\n"
            f"Context:\n{context}\n\n"
            "Structured Explanation:"
        )

        result = await llm.generate_answer(prompt, context, provider=request.provider, specialized_prompt=True)

        save_chat_message("user", f"Explain concept: {request.concept}", user_id=user_id)
        save_chat_message("assistant", result["answer"], user_id=user_id)

        return {
            "concept": request.concept,
            "explanation": result["answer"],
            "sources": result["sources"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assignment-help")
async def assignment_help(request: AssignmentRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    """Provide step-by-step guidance on an assignment question."""
    user_id = user["id"] if user else "default"
    try:
        chunks = retrieve_context(request.question, top_k=5, user_id=user_id)
        context = format_context_for_llm(chunks)

        prompt = (
            f"As a study assistant, guide the student through: '{request.question}'.\n"
            "Follow these GUIDELINES:\n"
            "- Do NOT give the final answer.\n"
            "- Break it down into 3-4 logical steps.\n"
            "- For each step, provide a HINT or a GUIDING QUESTION.\n"
            "- Use 'Step X:' headers.\n"
            "- Reference specific facts from the context.\n\n"
            f"Context:\n{context}\n\n"
            "Step-by-Step Guidance:"
        )

        result = await llm.generate_answer(prompt, context, provider=request.provider, specialized_prompt=True)

        save_chat_message("user", f"Assignment Help: {request.question}", user_id=user_id)
        save_chat_message("assistant", result["answer"], user_id=user_id)

        return {
            "question": request.question,
            "guidance": result["answer"],
            "sources": result["sources"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/learning-progress")
async def learning_progress(user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Aggregate dashboard: mastery scores, recommendations, study time, and streak isolated by user.
    """
    from backend.learning.learning_tracker import get_all_activity, get_sessions_per_day
    from datetime import datetime, date
    
    user_id = user["id"] if user else "default"
    mastery_map = get_all_mastery(user_id=user_id)
    recommendations = recommend_next_topics(limit=5, user_id=user_id)
    all_activity = get_all_activity(user_id=user_id)
    heatmap_data = get_sessions_per_day(days=60, user_id=user_id)

    total_minutes = sum(a['study_time_minutes'] for a in all_activity)
    total_study_time = f"{int(total_minutes // 60)}h {int(total_minutes % 60)}m" if total_minutes > 0 else "0h"
    
    activity_dates = sorted(list(set(datetime.fromisoformat(a['timestamp']).date() for a in all_activity if 'timestamp' in a)), reverse=True)
    streak = 0
    if activity_dates:
        today = date.today()
        current = today
        for ad in activity_dates:
            if ad == current:
                streak += 1
                from datetime import timedelta
                current -= timedelta(days=1)
            elif ad > current:
                continue
            else:
                break

    topics = []
    for topic, score in mastery_map.items():
        if score >= 80: level = "master"
        elif score >= 60: level = "advanced"
        elif score >= 40: level = "intermediate"
        else: level = "beginner"

        topics.append({"topic": topic, "mastery_score": score, "level": level})

    topics.sort(key=lambda x: x["mastery_score"], reverse=True)

    return {
        "topics": topics,
        "recommendations": recommendations,
        "heatmap_data": heatmap_data,
        "total_tracked": len(topics),
        "total_study_time": total_study_time,
        "streak": f"{streak}d"
    }

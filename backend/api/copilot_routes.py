"""
Copilot Routes — Phase 5
RAG-powered AI assistant endpoints:
  POST /generate-quiz     — generate quiz questions from study materials
  POST /explain           — explain a concept using RAG context
  POST /assignment-help   — step-by-step assignment guidance
  GET  /learning-progress — aggregate mastery + recommendations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.rag.retriever import retrieve_context, format_context_for_llm
from backend.llm.llm_interface import llm
from backend.learning.mastery_model import get_all_mastery
from backend.learning.recommendation_engine import recommend_next_topics
from backend.learning.difficulty_adjuster import adjust_question_difficulty

router = APIRouter()


class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5
    difficulty: str = "auto"   # "auto" | "easy" | "medium" | "hard"


class ConceptRequest(BaseModel):
    concept: str


class AssignmentRequest(BaseModel):
    question: str


# ─────────────────────────────────────────────
# POST /generate-quiz
# ─────────────────────────────────────────────
@router.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    """Generate quiz questions on a topic using RAG context."""
    try:
        # Determine difficulty
        if request.difficulty == "auto":
            diff_info = adjust_question_difficulty(request.topic)
            difficulty = diff_info["difficulty"]
        else:
            difficulty = request.difficulty

        # Retrieve topic context
        chunks = retrieve_context(request.topic, top_k=5)
        context = format_context_for_llm(chunks)

        # Build prompt
        prompt = (
            f"Generate {request.num_questions} {difficulty} quiz questions "
            f"about '{request.topic}'. "
            "Include a mix of multiple-choice and short-answer questions. "
            "For each question, provide the answer.\n\n"
            f"Use the following study material as the source:\n{context}"
        )

        result = await llm.generate_answer(prompt, context)

        return {
            "topic": request.topic,
            "difficulty": difficulty,
            "num_questions": request.num_questions,
            "quiz": result["answer"],
            "sources": result["sources"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# POST /explain
# ─────────────────────────────────────────────
@router.post("/explain")
async def explain_concept(request: ConceptRequest):
    """Explain a concept using relevant study material chunks."""
    try:
        chunks = retrieve_context(request.concept, top_k=4)
        context = format_context_for_llm(chunks)

        prompt = (
            f"Explain the following concept clearly and concisely: '{request.concept}'. "
            "Use simple language. Provide examples where helpful. "
            "Base your explanation on the provided study material."
        )

        result = await llm.generate_answer(prompt, context)

        return {
            "concept": request.concept,
            "explanation": result["answer"],
            "sources": result["sources"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# POST /assignment-help
# ─────────────────────────────────────────────
@router.post("/assignment-help")
async def assignment_help(request: AssignmentRequest):
    """Provide step-by-step guidance on an assignment question."""
    try:
        chunks = retrieve_context(request.question, top_k=5)
        context = format_context_for_llm(chunks)

        prompt = (
            f"Help with this assignment question: '{request.question}'. "
            "Think step-by-step. "
            "Provide hints and guidance rather than a direct copy-paste answer. "
            "Reference relevant concepts from the study material."
        )

        result = await llm.generate_answer(prompt, context)

        return {
            "question": request.question,
            "guidance": result["answer"],
            "sources": result["sources"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /learning-progress
# ─────────────────────────────────────────────
@router.get("/learning-progress")
async def learning_progress():
    """
    Aggregate dashboard: mastery scores, recommendations, study time, and streak.
    """
    from backend.learning.learning_tracker import get_all_activity
    from datetime import datetime, date
    
    mastery_map = get_all_mastery()
    recommendations = recommend_next_topics(limit=5)
    all_activity = get_all_activity()
    
    # Heatmap data for the last 60 days
    from backend.learning.learning_tracker import get_sessions_per_day
    heatmap_data = get_sessions_per_day(days=60)

    # Calculate stats
    total_minutes = sum(a['study_time_minutes'] for a in all_activity)
    total_study_time = f"{int(total_minutes // 60)}h {int(total_minutes % 60)}m" if total_minutes > 0 else "0h"
    
    # Calculate streak (consecutive days)
    activity_dates = sorted(list(set(datetime.fromisoformat(a['timestamp']).date() for a in all_activity)), reverse=True)
    streak = 0
    if activity_dates:
        today = date.today()
        # Simple streak calculation
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

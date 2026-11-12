"""
Learning Routes — Phase 4 API with Multi-User Data Isolation
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from backend.learning.learning_tracker import record_activity
from backend.learning.mastery_model import get_all_mastery, estimate_topic_mastery
from backend.learning.recommendation_engine import recommend_next_topics
from backend.learning.difficulty_adjuster import adjust_question_difficulty
from backend.api.events import broadcast_update
from backend.api.auth_routes import get_current_user_optional

router = APIRouter()

class LearningActivity(BaseModel):
    topic: str
    quiz_score: int = 0
    quiz_total: int = 0
    study_time_minutes: float = 0.0
    mistakes: int = 0

@router.post("/track-learning")
async def track_learning(activity: LearningActivity, user: Optional[dict] = Depends(get_current_user_optional)):
    """Record a quiz/study session for a topic isolated by user_id."""
    user_id = user["id"] if user else "default"
    record_activity(
        topic=activity.topic,
        quiz_score=activity.quiz_score,
        quiz_total=activity.quiz_total,
        study_time_minutes=activity.study_time_minutes,
        mistakes=activity.mistakes,
        user_id=user_id
    )
    mastery = estimate_topic_mastery(activity.topic, user_id=user_id)
    difficulty = adjust_question_difficulty(activity.topic, user_id=user_id)

    await broadcast_update("LEARNING_ACTIVITY_RECORDED", {
        "user_id": user_id,
        "topic": activity.topic,
        "mastery": mastery
    })

    return {
        "status": "recorded",
        "topic": activity.topic,
        "current_mastery": mastery,
        "next_difficulty": difficulty["difficulty"],
    }

@router.get("/topic-mastery")
async def topic_mastery(user: Optional[dict] = Depends(get_current_user_optional)):
    """Return mastery scores for every topic the student has studied."""
    user_id = user["id"] if user else "default"
    mastery_map = get_all_mastery(user_id=user_id)
    topics = []
    for topic, score in mastery_map.items():
        level = "beginner"
        if score >= 80:
            level = "master"
        elif score >= 60:
            level = "advanced"
        elif score >= 40:
            level = "intermediate"
        topics.append({
            "topic": topic,
            "mastery_score": score,
            "level": level,
        })
    topics.sort(key=lambda x: x["mastery_score"], reverse=True)
    return {"topics": topics, "total_topics": len(topics)}

@router.get("/recommendations")
async def recommendations(limit: int = 5, user: Optional[dict] = Depends(get_current_user_optional)):
    """Return prioritised list of topics to study next."""
    user_id = user["id"] if user else "default"
    recs = recommend_next_topics(limit=limit, user_id=user_id)
    return {"recommendations": recs, "count": len(recs)}

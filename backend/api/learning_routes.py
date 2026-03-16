"""
Learning Routes — Phase 4 API
Endpoints:
  POST /track-learning    — record a study/quiz session
  GET  /topic-mastery     — get mastery scores for all topics
  GET  /recommendations   — get prioritised topic recommendations
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.learning.learning_tracker import record_activity
from backend.learning.mastery_model import get_all_mastery, estimate_topic_mastery
from backend.learning.recommendation_engine import recommend_next_topics
from backend.learning.difficulty_adjuster import adjust_question_difficulty

router = APIRouter()


class LearningActivity(BaseModel):
    topic: str
    quiz_score: int = 0
    quiz_total: int = 0
    study_time_minutes: float = 0.0
    mistakes: int = 0


@router.post("/track-learning")
async def track_learning(activity: LearningActivity):
    """Record a quiz/study session for a topic."""
    record_activity(
        topic=activity.topic,
        quiz_score=activity.quiz_score,
        quiz_total=activity.quiz_total,
        study_time_minutes=activity.study_time_minutes,
        mistakes=activity.mistakes,
    )
    mastery = estimate_topic_mastery(activity.topic)
    difficulty = adjust_question_difficulty(activity.topic)

    return {
        "status": "recorded",
        "topic": activity.topic,
        "current_mastery": mastery,
        "next_difficulty": difficulty["difficulty"],
    }


@router.get("/topic-mastery")
async def topic_mastery():
    """Return mastery scores for every topic the student has studied."""
    mastery_map = get_all_mastery()
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
    # Sort strongest first for the dashboard
    topics.sort(key=lambda x: x["mastery_score"], reverse=True)
    return {"topics": topics, "total_topics": len(topics)}


@router.get("/recommendations")
async def recommendations(limit: int = 5):
    """Return prioritised list of topics to study next."""
    recs = recommend_next_topics(limit=limit)
    return {"recommendations": recs, "count": len(recs)}

"""
Difficulty Adjuster — Phase 4
Maps topic mastery score to an appropriate quiz difficulty level.
"""

from backend.learning.mastery_model import estimate_topic_mastery

def adjust_question_difficulty(topic: str, user_id: str = "default") -> dict:
    """
    Determine quiz difficulty for a topic based on mastery score for a user.
    Returns: {topic, mastery_score, difficulty, description}
    """
    mastery = estimate_topic_mastery(topic, user_id=user_id)

    if mastery < 40:
        difficulty = "easy"
        description = "Focus on foundational concepts and definitions."
    elif mastery < 70:
        difficulty = "medium"
        description = "Mix of application and conceptual questions."
    else:
        difficulty = "hard"
        description = "Advanced problem-solving and edge cases."

    return {
        "topic": topic,
        "mastery_score": mastery,
        "difficulty": difficulty,
        "description": description,
    }

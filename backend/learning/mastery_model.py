"""
Mastery Model — Phase 4
Estimates topic mastery score (0-100) from accumulated learning activity.
Formula: (quiz_accuracy * 0.5) + (time_score * 0.2) + (consistency_score * 0.3)
"""

from backend.learning.learning_tracker import get_topic_data, get_all_topics


def _quiz_accuracy_score(rows: list[dict]) -> float:
    """Average quiz accuracy across all sessions (0-100)."""
    valid = [r for r in rows if r["quiz_total"] > 0]
    if not valid:
        return 0.0
    return sum(r["quiz_score"] / r["quiz_total"] for r in valid) / len(valid) * 100


def _time_score(rows: list[dict], cap_minutes: float = 60.0) -> float:
    """Normalise total study time to 0-100 (capped at cap_minutes)."""
    total = sum(r["study_time_minutes"] for r in rows)
    return min(total / cap_minutes, 1.0) * 100


def _consistency_score(rows: list[dict]) -> float:
    """Penalise high mistake rates. Returns 0-100."""
    if not rows:
        return 0.0
    total_questions = sum(r["quiz_total"] for r in rows)
    total_mistakes = sum(r["mistakes"] for r in rows)
    if total_questions == 0:
        return 50.0
    accuracy = 1 - (total_mistakes / max(total_questions, 1))
    return max(accuracy, 0.0) * 100


def estimate_topic_mastery(topic: str) -> float:
    """
    Calculate mastery score for a topic.
    Returns a float in [0, 100].
    """
    rows = get_topic_data(topic)
    if not rows:
        return 0.0

    quiz_acc = _quiz_accuracy_score(rows)
    time_s = _time_score(rows)
    consistency = _consistency_score(rows)

    mastery = (quiz_acc * 0.5) + (time_s * 0.2) + (consistency * 0.3)
    return round(min(mastery, 100.0), 1)


def get_all_mastery() -> dict[str, float]:
    """Return mastery scores for every tracked topic."""
    topics = get_all_topics()
    return {topic: estimate_topic_mastery(topic) for topic in topics}

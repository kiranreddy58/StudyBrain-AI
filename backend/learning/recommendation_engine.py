"""
Recommendation Engine — Phase 4
Suggests which topics the student should study next,
prioritising weak topics and avoiding already-mastered ones.
"""

from backend.learning.mastery_model import get_all_mastery


WEAK_THRESHOLD = 50.0
STRONG_THRESHOLD = 80.0


def recommend_next_topics(limit: int = 5) -> list[dict]:
    """
    Return recommended topics ordered by priority.
    Each entry: {topic, mastery_score, priority}
    """
    mastery_map = get_all_mastery()

    weak = []
    medium = []
    strong = []

    for topic, score in mastery_map.items():
        entry = {"topic": topic, "mastery_score": score}
        if score < WEAK_THRESHOLD:
            entry["priority"] = "high"
            weak.append(entry)
        elif score < STRONG_THRESHOLD:
            entry["priority"] = "medium"
            medium.append(entry)
        else:
            entry["priority"] = "low"
            strong.append(entry)

    weak.sort(key=lambda x: x["mastery_score"])
    medium.sort(key=lambda x: x["mastery_score"])
    strong.sort(key=lambda x: x["mastery_score"])

    ordered = weak + medium + strong
    return ordered[:limit]

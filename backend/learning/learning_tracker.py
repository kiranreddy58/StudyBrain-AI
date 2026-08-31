"""
Learning Tracker — Phase 4
Stores student learning activity in MongoDB Atlas or unified SQLite database.
"""

from datetime import datetime, timedelta, date
from backend.storage.database import get_connection, get_mongo_db

def record_activity(topic: str, quiz_score: int, quiz_total: int,
                    study_time_minutes: float, mistakes: int):
    """Insert a new learning activity record."""
    timestamp = datetime.utcnow().isoformat()
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.student_activity.insert_one({
                "topic": topic,
                "quiz_score": quiz_score,
                "quiz_total": quiz_total,
                "study_time_minutes": study_time_minutes,
                "mistakes": mistakes,
                "timestamp": timestamp
            })
            return
        except Exception as e:
            print(f"MongoDB record_activity error: {e}")

    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO student_activity
               (topic, quiz_score, quiz_total, study_time_minutes, mistakes, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (topic, quiz_score, quiz_total, study_time_minutes, mistakes, timestamp)
        )
        conn.commit()
    finally:
        conn.close()

def get_all_topics() -> list[str]:
    """Return distinct tracked topics."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            return mongo.student_activity.distinct("topic")
        except Exception as e:
            print(f"MongoDB get_all_topics error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute("SELECT DISTINCT topic FROM student_activity").fetchall()
        return [r["topic"] for r in rows]
    finally:
        conn.close()

def get_topic_data(topic: str) -> list[dict]:
    """Return all activity rows for a given topic."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.student_activity.find({"topic": topic}, {"_id": 0}).sort("timestamp", -1)
            return list(cursor)
        except Exception as e:
            print(f"MongoDB get_topic_data error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM student_activity WHERE topic = ? ORDER BY timestamp DESC",
            (topic,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def get_all_activity() -> list[dict]:
    """Return all activity rows ordered by timestamp."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.student_activity.find({}, {"_id": 0}).sort("timestamp", -1)
            return list(cursor)
        except Exception as e:
            print(f"MongoDB get_all_activity error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM student_activity ORDER BY timestamp DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def get_sessions_per_day(days: int = 60) -> list[int]:
    """Return a list of session counts for the last `days` days."""
    today = date.today()
    start_date = today - timedelta(days=days - 1)

    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.student_activity.find(
                {"timestamp": {"$gte": start_date.isoformat()}},
                {"timestamp": 1, "_id": 0}
            )
            day_counts = {}
            for doc in cursor:
                ts = doc.get("timestamp", "")
                day_str = ts.split("T")[0] if "T" in ts else ts[:10]
                day_counts[day_str] = day_counts.get(day_str, 0) + 1

            result = []
            for i in range(days):
                current_day = (start_date + timedelta(days=i)).isoformat()
                result.append(day_counts.get(current_day, 0))
            return result
        except Exception as e:
            print(f"MongoDB get_sessions_per_day error: {e}")

    conn = get_connection()
    try:
        query = """
        SELECT date(timestamp) as day, COUNT(*) as count
        FROM student_activity
        WHERE date(timestamp) >= ?
        GROUP BY day
        """
        rows = conn.execute(query, (start_date.isoformat(),)).fetchall()
        day_counts = {r["day"]: r["count"] for r in rows}
        
        result = []
        for i in range(days):
            current_day = (start_date + timedelta(days=i)).isoformat()
            result.append(day_counts.get(current_day, 0))
        return result
    finally:
        conn.close()

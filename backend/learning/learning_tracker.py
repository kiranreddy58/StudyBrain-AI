from datetime import datetime, date, timedelta
from backend.storage.database import get_connection, get_mongo_db

def log_activity(
    topic: str,
    quiz_score: int = 0,
    quiz_total: int = 0,
    study_time_minutes: float = 0.0,
    mistakes: int = 0,
    user_id: str = "default",
):
    """Insert a single learning activity record into MongoDB Atlas or SQLite strictly for user_id."""
    timestamp = datetime.now().isoformat()
    target_user = user_id or "default"

    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.student_activity.insert_one({
                "user_id": target_user,
                "topic": topic,
                "quiz_score": quiz_score,
                "quiz_total": quiz_total,
                "study_time_minutes": study_time_minutes,
                "mistakes": mistakes,
                "timestamp": timestamp,
            })
            return
        except Exception as e:
            print(f"MongoDB log_activity error: {e}")

    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO student_activity (user_id, topic, quiz_score, quiz_total, study_time_minutes, mistakes, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (target_user, topic, quiz_score, quiz_total, study_time_minutes, mistakes, timestamp),
        )
        conn.commit()
    finally:
        conn.close()

record_activity = log_activity

def get_all_topics(user_id: str = "default") -> list[str]:
    """Return distinct tracked topics strictly for a user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            return mongo.student_activity.distinct("topic", {"user_id": target_user})
        except Exception as e:
            print(f"MongoDB get_all_topics error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT DISTINCT topic FROM student_activity WHERE user_id = ?",
            (target_user,)
        ).fetchall()
        return [r["topic"] for r in rows]
    finally:
        conn.close()

def get_topic_data(topic: str, user_id: str = "default") -> list[dict]:
    """Return all activity rows strictly for a given topic and user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.student_activity.find(
                {"topic": topic, "user_id": target_user}, 
                {"_id": 0}
            ).sort("timestamp", -1)
            return list(cursor)
        except Exception as e:
            print(f"MongoDB get_topic_data error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM student_activity WHERE topic = ? AND user_id = ? ORDER BY timestamp DESC",
            (topic, target_user)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def get_all_activity(user_id: str = "default") -> list[dict]:
    """Return all activity rows strictly for a user ordered by timestamp."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.student_activity.find(
                {"user_id": target_user}, 
                {"_id": 0}
            ).sort("timestamp", -1)
            return list(cursor)
        except Exception as e:
            print(f"MongoDB get_all_activity error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM student_activity WHERE user_id = ? ORDER BY timestamp DESC",
            (target_user,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def get_sessions_per_day(days: int = 60, user_id: str = "default") -> list[int]:
    """Return a list of session counts for the last `days` days strictly for a user."""
    target_user = user_id or "default"
    today = date.today()
    start_date = today - timedelta(days=days - 1)

    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.student_activity.find(
                {"timestamp": {"$gte": start_date.isoformat()}, "user_id": target_user},
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
        WHERE date(timestamp) >= ? AND user_id = ?
        GROUP BY day
        """
        rows = conn.execute(query, (start_date.isoformat(), target_user)).fetchall()
        day_counts = {r["day"]: r["count"] for r in rows}
        
        result = []
        for i in range(days):
            current_day = (start_date + timedelta(days=i)).isoformat()
            result.append(day_counts.get(current_day, 0))
        return result
    finally:
        conn.close()

record_activity = log_activity

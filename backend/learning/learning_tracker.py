"""
Learning Tracker — Phase 4
Stores student learning activity in the unified database.
"""

from datetime import datetime
from backend.storage.database import get_connection

def record_activity(topic: str, quiz_score: int, quiz_total: int,
                    study_time_minutes: float, mistakes: int):
    """Insert a new learning activity record."""
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO student_activity
               (topic, quiz_score, quiz_total, study_time_minutes, mistakes, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (topic, quiz_score, quiz_total, study_time_minutes, mistakes,
             datetime.utcnow().isoformat())
        )
        conn.commit()
    finally:
        conn.close()

def get_all_topics() -> list[str]:
    """Return distinct tracked topics."""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT DISTINCT topic FROM student_activity").fetchall()
        return [r["topic"] for r in rows]
    finally:
        conn.close()

def get_topic_data(topic: str) -> list[dict]:
    """Return all activity rows for a given topic."""
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
    from datetime import timedelta, date
    conn = get_connection()
    try:
        # We want to return data for the last 60 days including today
        today = date.today()
        start_date = today - timedelta(days=days - 1)
        
        # Query for daily counts
        query = """
        SELECT date(timestamp) as day, COUNT(*) as count
        FROM student_activity
        WHERE date(timestamp) >= ?
        GROUP BY day
        """
        rows = conn.execute(query, (start_date.isoformat(),)).fetchall()
        
        # Map to a daily list
        day_counts = {r["day"]: r["count"] for r in rows}
        
        result = []
        for i in range(days):
            current_day = (start_date + timedelta(days=i)).isoformat()
            result.append(day_counts.get(current_day, 0))
            
        return result
    finally:
        conn.close()

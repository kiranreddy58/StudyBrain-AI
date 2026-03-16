"""
Learning Tracker — Phase 4
Stores student learning activity in a local SQLite database.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "learning.db")


def _get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS student_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            quiz_score INTEGER DEFAULT 0,
            quiz_total INTEGER DEFAULT 0,
            study_time_minutes REAL DEFAULT 0,
            mistakes INTEGER DEFAULT 0,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def record_activity(topic: str, quiz_score: int, quiz_total: int,
                    study_time_minutes: float, mistakes: int):
    """Insert a new learning activity record."""
    init_db()
    conn = _get_connection()
    conn.execute(
        """INSERT INTO student_activity
           (topic, quiz_score, quiz_total, study_time_minutes, mistakes, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (topic, quiz_score, quiz_total, study_time_minutes, mistakes,
         datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()


def get_all_topics() -> list[str]:
    """Return distinct tracked topics."""
    init_db()
    conn = _get_connection()
    rows = conn.execute("SELECT DISTINCT topic FROM student_activity").fetchall()
    conn.close()
    return [r["topic"] for r in rows]


def get_topic_data(topic: str) -> list[dict]:
    """Return all activity rows for a given topic."""
    init_db()
    conn = _get_connection()
    rows = conn.execute(
        "SELECT * FROM student_activity WHERE topic = ? ORDER BY timestamp DESC",
        (topic,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_activity() -> list[dict]:
    """Return all activity rows ordered by timestamp."""
    init_db()
    conn = _get_connection()
    rows = conn.execute(
        "SELECT * FROM student_activity ORDER BY timestamp DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_sessions_per_day(days: int = 60) -> list[int]:
    """Return a list of session counts for the last `days` days."""
    from datetime import timedelta, date
    init_db()
    conn = _get_connection()
    
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
    conn.close()
    
    # Map to a daily list
    day_counts = {r["day"]: r["count"] for r in rows}
    
    result = []
    for i in range(days):
        current_day = (start_date + timedelta(days=i)).isoformat()
        result.append(day_counts.get(current_day, 0))
        
    return result

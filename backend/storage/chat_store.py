from datetime import datetime
from backend.storage.database import get_connection

def save_chat_message(role: str, content: str, doc_id: str = None):
    """Saves a chat message to the database."""
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO chat_history (role, content, doc_id, timestamp) VALUES (?, ?, ?, ?)",
            (role, content, doc_id, datetime.now().isoformat())
        )
        conn.commit()
    finally:
        conn.close()

def get_chat_history(limit: int = 50, doc_id: str = None):
    """Retrieves chat history from the database."""
    conn = get_connection()
    try:
        query = "SELECT * FROM chat_history"
        params = []
        if doc_id:
            query += " WHERE doc_id = ?"
            params.append(doc_id)
        query += " ORDER BY timestamp ASC LIMIT ?"
        params.append(limit)
        
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def clear_chat_history(doc_id: str = None):
    """Clears chat history from the database."""
    conn = get_connection()
    try:
        if doc_id:
            conn.execute("DELETE FROM chat_history WHERE doc_id = ?", (doc_id,))
        else:
            conn.execute("DELETE FROM chat_history")
        conn.commit()
    finally:
        conn.close()

from datetime import datetime
from backend.storage.database import get_connection, get_mongo_db

def save_chat_message(role: str, content: str, doc_id: str = None, user_id: str = "default"):
    """Saves a chat message to MongoDB Atlas or SQLite database strictly isolated by user_id."""
    timestamp = datetime.now().isoformat()
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.chat_history.insert_one({
                "user_id": target_user,
                "role": role,
                "content": content,
                "doc_id": doc_id,
                "timestamp": timestamp
            })
            return
        except Exception as e:
            print(f"MongoDB save_chat_message error: {e}")

    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO chat_history (user_id, role, content, doc_id, timestamp) VALUES (?, ?, ?, ?, ?)",
            (target_user, role, content, doc_id, timestamp)
        )
        conn.commit()
    finally:
        conn.close()

def get_chat_history(limit: int = 50, doc_id: str = None, user_id: str = None):
    """Retrieves chat history strictly for a specific user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            query = {"user_id": target_user}
            if doc_id:
                query["doc_id"] = doc_id
            cursor = mongo.chat_history.find(query, {"_id": 0}).sort("timestamp", 1).limit(limit)
            return list(cursor)
        except Exception as e:
            print(f"MongoDB get_chat_history error: {e}")

    conn = get_connection()
    try:
        query = "SELECT * FROM chat_history WHERE user_id = ?"
        params = [target_user]
        if doc_id:
            query += " AND doc_id = ?"
            params.append(doc_id)
        query += " ORDER BY timestamp ASC LIMIT ?"
        params.append(limit)
        
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def clear_chat_history(doc_id: str = None, user_id: str = None):
    """Clears chat history strictly for a specific user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            query = {"user_id": target_user}
            if doc_id:
                query["doc_id"] = doc_id
            mongo.chat_history.delete_many(query)
            return
        except Exception as e:
            print(f"MongoDB clear_chat_history error: {e}")

    conn = get_connection()
    try:
        if doc_id:
            conn.execute("DELETE FROM chat_history WHERE user_id = ? AND doc_id = ?", (target_user, doc_id))
        else:
            conn.execute("DELETE FROM chat_history WHERE user_id = ?", (target_user,))
        conn.commit()
    finally:
        conn.close()

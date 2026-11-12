import json
from backend.storage.database import get_connection, get_mongo_db

def set_setting(key: str, value: any, user_id: str = "default"):
    """Saves a setting to MongoDB Atlas or SQLite database isolated by user_id."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.settings.update_one(
                {"user_id": user_id, "key": key},
                {"$set": {"user_id": user_id, "key": key, "value": value}},
                upsert=True
            )
            return
        except Exception as e:
            print(f"MongoDB set_setting error: {e}")

    conn = get_connection()
    try:
        val_str = json.dumps(value)
        conn.execute(
            "INSERT OR REPLACE INTO settings (user_id, key, value) VALUES (?, ?, ?)",
            (user_id, key, val_str)
        )
        conn.commit()
    finally:
        conn.close()

def get_setting(key: str, default: any = None, user_id: str = "default"):
    """Retrieves a setting for a specific user."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            doc = mongo.settings.find_one({"user_id": user_id, "key": key}, {"_id": 0})
            if doc and "value" in doc:
                return doc["value"]
            # Fallback to default
            doc_def = mongo.settings.find_one({"user_id": "default", "key": key}, {"_id": 0})
            if doc_def and "value" in doc_def:
                return doc_def["value"]
            return default
        except Exception as e:
            print(f"MongoDB get_setting error: {e}")

    conn = get_connection()
    try:
        row = conn.execute("SELECT value FROM settings WHERE user_id = ? AND key = ?", (user_id, key)).fetchone()
        if not row:
            row = conn.execute("SELECT value FROM settings WHERE user_id = 'default' AND key = ?", (key,)).fetchone()
        if row:
            return json.loads(row['value'])
        return default
    finally:
        conn.close()

def get_all_settings(user_id: str = "default"):
    """Retrieves all settings for a user."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            cursor = mongo.settings.find({"$or": [{"user_id": user_id}, {"user_id": "default"}]}, {"_id": 0})
            settings = {}
            for doc in cursor:
                if "key" in doc:
                    settings[doc["key"]] = doc["value"]
            return settings
        except Exception as e:
            print(f"MongoDB get_all_settings error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute("SELECT key, value FROM settings WHERE user_id = ? OR user_id = 'default'", (user_id,)).fetchall()
        return {r['key']: json.loads(r['value']) for r in rows}
    finally:
        conn.close()

import json
from backend.storage.database import get_connection

def set_setting(key: str, value: any):
    """Saves a setting to the database."""
    conn = get_connection()
    try:
        val_str = json.dumps(value)
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, val_str)
        )
        conn.commit()
    finally:
        conn.close()

def get_setting(key: str, default: any = None):
    """Retrieves a setting from the database."""
    conn = get_connection()
    try:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        if row:
            return json.loads(row['value'])
        return default
    finally:
        conn.close()

def get_all_settings():
    """Retrieves all settings from the database."""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM settings").fetchall()
        return {r['key']: json.loads(r['value']) for r in rows}
    finally:
        conn.close()

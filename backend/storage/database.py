import sqlite3
import os
from datetime import datetime

if os.environ.get("VERCEL") == "1":
    DB_PATH = "/tmp/learning.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "learning.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize all tables in the unified database."""
    conn = get_connection()
    
    # 1. Documents Table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            raw_path TEXT,
            processed_status TEXT DEFAULT 'pending',
            uploaded_at TEXT NOT NULL
        )
    """)
    
    # 2. Document Chunks (for RAG)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT NOT NULL,
            chunk_index INTEGER,
            content TEXT NOT NULL,
            metadata TEXT, -- JSON string
            FOREIGN KEY (doc_id) REFERENCES documents (id) ON DELETE CASCADE
        )
    """)
    
    # 3. Chat History
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL, -- 'user' or 'assistant'
            content TEXT NOT NULL,
            doc_id TEXT, -- Context document (optional)
            timestamp TEXT NOT NULL,
            FOREIGN KEY (doc_id) REFERENCES documents (id) ON DELETE SET NULL
        )
    """)
    
    # 4. Quiz History
    conn.execute("""
        CREATE TABLE IF NOT EXISTS quiz_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT,
            topic TEXT,
            score INTEGER,
            total INTEGER,
            mistakes INTEGER DEFAULT 0,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (doc_id) REFERENCES documents (id) ON DELETE SET NULL
        )
    """)
    
    # 5. User Settings
    conn.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)
    
    # 6. Legacy Student Activity (keep for backward compatibility or migrate)
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

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")

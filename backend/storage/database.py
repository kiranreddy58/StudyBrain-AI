import os
import sqlite3
from dotenv import load_dotenv
load_dotenv()

_mongo_client = None
_mongo_db = None

def get_mongo_db():
    global _mongo_client, _mongo_db
    mongo_uri = os.environ.get("MONGODB_URI")
    if not mongo_uri:
        return None
        
    if _mongo_db is not None:
        return _mongo_db

    try:
        from pymongo import MongoClient
        _mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        _mongo_client.admin.command('ping')
        _mongo_db = _mongo_client.get_database("studybrain")
        print("Connected to MongoDB Atlas Cloud Database successfully.")
        return _mongo_db
    except Exception as e:
        print(f"MongoDB connection fallback to SQLite: {e}")
        _mongo_db = None
        return None

def _get_db_path():
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        return "/tmp/learning.db"
    local_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "learning.db")
    try:
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        return local_path
    except (OSError, PermissionError):
        return "/tmp/learning.db"

DB_PATH = _get_db_path()

def get_connection():
    global DB_PATH
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
    except (OSError, PermissionError):
        DB_PATH = "/tmp/learning.db"
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize MongoDB collections/indexes and SQLite tables."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.documents.create_index("id", unique=True)
            mongo.document_chunks.create_index("doc_id")
            mongo.chat_history.create_index("timestamp")
            mongo.student_activity.create_index("timestamp")
            mongo.settings.create_index("key", unique=True)
            print("MongoDB Atlas indexes verified.")
            return
        except Exception as e:
            print(f"MongoDB index init notice: {e}")

    try:
        conn = get_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                raw_path TEXT,
                processed_status TEXT DEFAULT 'completed',
                uploaded_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS document_chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_id TEXT NOT NULL,
                chunk_index INTEGER,
                content TEXT NOT NULL,
                metadata TEXT,
                FOREIGN KEY (doc_id) REFERENCES documents (id) ON DELETE CASCADE
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                doc_id TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS quiz_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_id TEXT,
                topic TEXT,
                score INTEGER,
                total INTEGER,
                mistakes INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
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
    except Exception as e:
        print(f"SQLite init notice: {e}")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")

import sqlite3
import os

DB_PATH = os.path.join("data", "learning.db")

if os.path.exists(DB_PATH):
    print(f"Clearing data from {DB_PATH}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("DELETE FROM student_activity")
        conn.commit()
        conn.close()
        print("Successfully cleared student_activity table.")
    except Exception as e:
        print(f"Error clearing database: {e}")
else:
    print(f"Database {DB_PATH} not found.")

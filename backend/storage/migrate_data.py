import os
import json
import sqlite3
from datetime import datetime
from backend.storage.database import get_connection, init_db
from backend.storage.document_store import STORAGE_DIR

def migrate_documents():
    print("Starting document migration...")
    init_db()
    conn = get_connection()
    
    if not os.path.exists(STORAGE_DIR):
        print("No documents found to migrate.")
        return

    json_files = [f for f in os.listdir(STORAGE_DIR) if f.endswith(".json")]
    
    for filename in json_files:
        doc_id = filename.replace(".json", "")
        file_path = os.path.join(STORAGE_DIR, filename)
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            if isinstance(data, list):
                chunks = data
                meta = {}
            else:
                chunks = data.get("chunks", [])
                meta = data.get("metadata", {})
            
            source_name = meta.get("filename") or (chunks[0].get("source") if chunks else "Unknown")
            raw_path = meta.get("raw_path")
            
            conn.execute("""
                INSERT OR IGNORE INTO documents (id, filename, file_type, raw_path, uploaded_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                doc_id, 
                source_name, 
                source_name.split('.')[-1] if '.' in source_name else 'unknown',
                raw_path,
                datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
            ))
            
            for i, chunk in enumerate(chunks):
                conn.execute("""
                    INSERT INTO document_chunks (doc_id, chunk_index, content, metadata)
                    VALUES (?, ?, ?, ?)
                """, (
                    doc_id,
                    i,
                    chunk.get("chunk_text") or str(chunk),
                    json.dumps({k: v for k, v in chunk.items() if k != "chunk_text"})
                ))
            
            print(f"Migrated: {source_name} ({doc_id})")
            
        except Exception as e:
            print(f"Failed to migrate {filename}: {e}")
            
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_documents()

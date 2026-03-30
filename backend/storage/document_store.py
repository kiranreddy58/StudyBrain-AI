import os
import json
from datetime import datetime
from backend.storage.database import get_connection

STORAGE_DIR = "data/processed_documents" # Keep reference for pathing if needed

def save_processed_document(doc_id: str, chunks: list, raw_path: str = None):
    """
    Stores processed chunks in the database, including metadata.
    """
    conn = get_connection()
    try:
        # 1. Insert/Update Document Metadata
        filename = chunks[0].get('source', 'Unknown') if chunks else "Unknown"
        file_type = filename.split('.')[-1] if '.' in filename else 'unknown'
        
        conn.execute("""
            INSERT OR REPLACE INTO documents (id, filename, file_type, raw_path, uploaded_at, processed_status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            doc_id, 
            filename, 
            file_type, 
            raw_path, 
            datetime.now().isoformat(),
            'completed'
        ))
        
        # 2. Insert Chunks
        # Clear existing chunks if any (for updates)
        conn.execute("DELETE FROM document_chunks WHERE doc_id = ?", (doc_id,))
        
        for i, chunk in enumerate(chunks):
            conn.execute("""
                INSERT INTO document_chunks (doc_id, chunk_index, content, metadata)
                VALUES (?, ?, ?, ?)
            """, (
                doc_id,
                i,
                chunk.get("chunk_text") or "",
                json.dumps({k: v for k, v in chunk.items() if k != "chunk_text"})
            ))
            
        conn.commit()
    finally:
        conn.close()

def get_processed_document(doc_id: str) -> dict:
    """
    Retrieves stored document data from the database.
    """
    conn = get_connection()
    try:
        doc = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
        if not doc:
            return {}
        
        chunks_rows = conn.execute(
            "SELECT * FROM document_chunks WHERE doc_id = ? ORDER BY chunk_index ASC", 
            (doc_id,)
        ).fetchall()
        
        chunks = []
        for cr in chunks_rows:
            chunk = json.loads(cr['metadata'])
            chunk['chunk_text'] = cr['content']
            chunks.append(chunk)
            
        metadata = dict(doc)
        metadata['type'] = metadata.get('file_type', 'text')
        
        return {
            "metadata": metadata,
            "chunks": chunks
        }
    finally:
        conn.close()

def list_processed_documents():
    """
    Lists all processed documents with metadata from the database.
    """
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM documents ORDER BY uploaded_at DESC").fetchall()
        docs = []
        for r in rows:
            doc = dict(r)
            # Add chunks_count for compatibility
            count_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM document_chunks WHERE doc_id = ?", 
                (doc['id'],)
            ).fetchone()
            doc['chunks_count'] = count_row['cnt']
            
            # Map database fields to expected frontend/API names
            doc['type'] = doc.get('file_type', 'text')
            if doc.get('uploaded_at'):
                doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at']).timestamp() * 1000
            
            docs.append(doc)
        return docs
    finally:
        conn.close()

def delete_document(doc_id: str):
    """Deletes a document and its chunks from the database."""
    conn = get_connection()
    try:
        conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
    finally:
        conn.close()

def rename_document(doc_id: str, new_name: str):
    """Renames a document in the database."""
    conn = get_connection()
    try:
        conn.execute("UPDATE documents SET filename = ? WHERE id = ?", (new_name, doc_id))
        conn.commit()
    finally:
        conn.close()

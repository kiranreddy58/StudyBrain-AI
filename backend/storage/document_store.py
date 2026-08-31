import os
import json
from datetime import datetime
from backend.storage.database import get_connection, get_mongo_db

def save_processed_document(doc_id: str, chunks: list, raw_path: str = None):
    """
    Stores processed chunks in MongoDB Atlas or SQLite database.
    """
    filename = chunks[0].get('source', 'Unknown') if chunks else "Unknown"
    file_type = filename.split('.')[-1] if '.' in filename else 'unknown'
    uploaded_at = datetime.now().isoformat()

    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.documents.update_one(
                {"id": doc_id},
                {"$set": {
                    "id": doc_id,
                    "filename": filename,
                    "file_type": file_type,
                    "raw_path": raw_path,
                    "uploaded_at": uploaded_at,
                    "processed_status": "completed"
                }},
                upsert=True
            )
            mongo.document_chunks.delete_many({"doc_id": doc_id})
            if chunks:
                chunk_docs = []
                for i, chunk in enumerate(chunks):
                    chunk_docs.append({
                        "doc_id": doc_id,
                        "chunk_index": i,
                        "content": chunk.get("chunk_text") or "",
                        "metadata": {k: v for k, v in chunk.items() if k != "chunk_text"}
                    })
                mongo.document_chunks.insert_many(chunk_docs)
            return
        except Exception as e:
            print(f"MongoDB save_processed_document error: {e}")

    conn = get_connection()
    try:
        conn.execute("""
            INSERT OR REPLACE INTO documents (id, filename, file_type, raw_path, uploaded_at, processed_status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (doc_id, filename, file_type, raw_path, uploaded_at, 'completed'))
        
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
    """Retrieves stored document data from MongoDB or SQLite."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            doc = mongo.documents.find_one({"id": doc_id}, {"_id": 0})
            if not doc:
                return {}
            chunk_docs = list(mongo.document_chunks.find({"doc_id": doc_id}, {"_id": 0}).sort("chunk_index", 1))
            chunks = []
            for cd in chunk_docs:
                chunk = cd.get("metadata") or {}
                chunk["chunk_text"] = cd.get("content", "")
                chunks.append(chunk)
            metadata = dict(doc)
            metadata['type'] = metadata.get('file_type', 'text')
            return {"metadata": metadata, "chunks": chunks}
        except Exception as e:
            print(f"MongoDB get_processed_document error: {e}")

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
        return {"metadata": metadata, "chunks": chunks}
    finally:
        conn.close()

def list_processed_documents():
    """Lists all processed documents with metadata."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            docs = []
            cursor = mongo.documents.find({}, {"_id": 0}).sort("uploaded_at", -1)
            for doc in cursor:
                doc_dict = dict(doc)
                doc_dict['chunks_count'] = mongo.document_chunks.count_documents({"doc_id": doc_dict['id']})
                doc_dict['type'] = doc_dict.get('file_type', 'text')
                if doc_dict.get('uploaded_at'):
                    try:
                        doc_dict['uploaded_at'] = datetime.fromisoformat(doc_dict['uploaded_at']).timestamp() * 1000
                    except Exception:
                        pass
                docs.append(doc_dict)
            return docs
        except Exception as e:
            print(f"MongoDB list_processed_documents error: {e}")

    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM documents ORDER BY uploaded_at DESC").fetchall()
        docs = []
        for r in rows:
            doc = dict(r)
            count_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM document_chunks WHERE doc_id = ?", 
                (doc['id'],)
            ).fetchone()
            doc['chunks_count'] = count_row['cnt']
            doc['type'] = doc.get('file_type', 'text')
            if doc.get('uploaded_at'):
                try:
                    doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at']).timestamp() * 1000
                except Exception:
                    pass
            docs.append(doc)
        return docs
    finally:
        conn.close()

def delete_document(doc_id: str):
    """Deletes a document and its chunks."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.documents.delete_one({"id": doc_id})
            mongo.document_chunks.delete_many({"doc_id": doc_id})
            return
        except Exception as e:
            print(f"MongoDB delete_document error: {e}")

    conn = get_connection()
    try:
        conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
    finally:
        conn.close()

def rename_document(doc_id: str, new_name: str):
    """Renames a document."""
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.documents.update_one({"id": doc_id}, {"$set": {"filename": new_name}})
            return
        except Exception as e:
            print(f"MongoDB rename_document error: {e}")

    conn = get_connection()
    try:
        conn.execute("UPDATE documents SET filename = ? WHERE id = ?", (new_name, doc_id))
        conn.commit()
    finally:
        conn.close()

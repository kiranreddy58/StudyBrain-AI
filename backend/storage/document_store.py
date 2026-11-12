import os
import json
from datetime import datetime
from backend.storage.database import get_connection, get_mongo_db

def _check_raw_file_exists(raw_path: str) -> bool:
    if not raw_path:
        return False
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    basename = os.path.basename(raw_path)
    candidates = [
        raw_path,
        os.path.join(base_dir, raw_path),
        os.path.join(base_dir, "data", "uploads", basename),
        os.path.join("data", "uploads", basename),
        os.path.join("/tmp/uploads", basename)
    ]
    return any(os.path.exists(c) and os.path.isfile(c) for c in candidates)

def save_processed_document(doc_id: str, chunks: list, raw_path: str = None, user_id: str = "default", filename: str = None):
    """
    Stores processed chunks in MongoDB Atlas or SQLite database, isolated strictly by user_id.
    """
    if not filename:
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
                    "user_id": user_id,
                    "filename": filename,
                    "file_type": file_type,
                    "raw_path": raw_path,
                    "uploaded_at": uploaded_at,
                    "processed_status": "completed"
                }},
                upsert=True
            )
            mongo.document_chunks.delete_many({"doc_id": doc_id, "user_id": user_id})
            if chunks:
                chunk_docs = []
                for i, chunk in enumerate(chunks):
                    meta = {k: v for k, v in chunk.items() if k != "chunk_text"}
                    meta["user_id"] = user_id
                    chunk_docs.append({
                        "doc_id": doc_id,
                        "user_id": user_id,
                        "chunk_index": i,
                        "content": chunk.get("chunk_text") or "",
                        "metadata": meta
                    })
                mongo.document_chunks.insert_many(chunk_docs)
            return
        except Exception as e:
            print(f"MongoDB save_processed_document error: {e}")

    conn = get_connection()
    try:
        conn.execute("""
            INSERT OR REPLACE INTO documents (id, user_id, filename, file_type, raw_path, uploaded_at, processed_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (doc_id, user_id, filename, file_type, raw_path, uploaded_at, 'completed'))
        
        conn.execute("DELETE FROM document_chunks WHERE doc_id = ? AND user_id = ?", (doc_id, user_id))
        for i, chunk in enumerate(chunks):
            meta = {k: v for k, v in chunk.items() if k != "chunk_text"}
            meta["user_id"] = user_id
            conn.execute("""
                INSERT INTO document_chunks (doc_id, user_id, chunk_index, content, metadata)
                VALUES (?, ?, ?, ?, ?)
            """, (
                doc_id,
                user_id,
                i,
                chunk.get("chunk_text") or "",
                json.dumps(meta)
            ))
        conn.commit()
    finally:
        conn.close()

def get_processed_document(doc_id: str, user_id: str = None) -> dict:
    """Retrieves stored document data, verifying user ownership strictly."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            query = {"id": doc_id, "user_id": target_user}
            doc = mongo.documents.find_one(query, {"_id": 0})
            if not doc:
                return {}
            chunk_docs = list(mongo.document_chunks.find({"doc_id": doc_id, "user_id": target_user}, {"_id": 0}).sort("chunk_index", 1))
            chunks = []
            for cd in chunk_docs:
                chunk = cd.get("metadata") or {}
                chunk["chunk_text"] = cd.get("content", "")
                chunks.append(chunk)
            metadata = dict(doc)
            metadata['type'] = metadata.get('file_type', 'text')
            metadata['has_raw_file'] = _check_raw_file_exists(metadata.get('raw_path'))
            return {"metadata": metadata, "chunks": chunks}
        except Exception as e:
            print(f"MongoDB get_processed_document error: {e}")

    conn = get_connection()
    try:
        doc = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?", 
            (doc_id, target_user)
        ).fetchone()
        if not doc:
            return {}
        
        chunks_rows = conn.execute(
            "SELECT * FROM document_chunks WHERE doc_id = ? AND user_id = ? ORDER BY chunk_index ASC", 
            (doc_id, target_user)
        ).fetchall()
        
        chunks = []
        for cr in chunks_rows:
            chunk = json.loads(cr['metadata'])
            chunk['chunk_text'] = cr['content']
            chunks.append(chunk)
            
        metadata = dict(doc)
        metadata['type'] = metadata.get('file_type', 'text')
        metadata['has_raw_file'] = _check_raw_file_exists(metadata.get('raw_path'))
        return {"metadata": metadata, "chunks": chunks}
    finally:
        conn.close()

def list_processed_documents(user_id: str = None) -> list:
    """Lists processed documents belonging strictly to the specified user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            docs = []
            query = {"user_id": target_user}
            cursor = mongo.documents.find(query, {"_id": 0}).sort("uploaded_at", -1)
            for doc in cursor:
                doc_dict = dict(doc)
                doc_dict['chunks_count'] = mongo.document_chunks.count_documents({"doc_id": doc_dict['id'], "user_id": target_user})
                doc_dict['type'] = doc_dict.get('file_type', 'text')
                doc_dict['has_raw_file'] = _check_raw_file_exists(doc_dict.get('raw_path'))
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
        rows = conn.execute(
            "SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC",
            (target_user,)
        ).fetchall()
        docs = []
        for r in rows:
            doc = dict(r)
            count_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM document_chunks WHERE doc_id = ? AND user_id = ?", 
                (doc['id'], target_user)
            ).fetchone()
            doc['chunks_count'] = count_row['cnt'] if count_row else 1
            doc['type'] = doc.get('file_type', 'text')
            doc['has_raw_file'] = _check_raw_file_exists(doc.get('raw_path'))
            if doc.get('uploaded_at'):
                try:
                    doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at']).timestamp() * 1000
                except Exception:
                    pass
            docs.append(doc)
        return docs
    finally:
        conn.close()

def delete_document(doc_id: str, user_id: str = None):
    """Deletes a document and its chunks strictly for the user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.documents.delete_one({"id": doc_id, "user_id": target_user})
            mongo.document_chunks.delete_many({"doc_id": doc_id, "user_id": target_user})
            return
        except Exception as e:
            print(f"MongoDB delete_document error: {e}")

    conn = get_connection()
    try:
        conn.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", (doc_id, target_user))
        conn.execute("DELETE FROM document_chunks WHERE doc_id = ? AND user_id = ?", (doc_id, target_user))
        conn.commit()
    finally:
        conn.close()

def rename_document(doc_id: str, new_name: str, user_id: str = None):
    """Renames a document strictly for the user."""
    target_user = user_id or "default"
    mongo = get_mongo_db()
    if mongo is not None:
        try:
            mongo.documents.update_one({"id": doc_id, "user_id": target_user}, {"$set": {"filename": new_name}})
            return
        except Exception as e:
            print(f"MongoDB rename_document error: {e}")

    conn = get_connection()
    try:
        conn.execute("UPDATE documents SET filename = ? WHERE id = ? AND user_id = ?", (new_name, doc_id, target_user))
        conn.commit()
    finally:
        conn.close()

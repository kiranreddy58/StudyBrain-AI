from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Optional
import uuid
import os
from pydantic import BaseModel

from backend.ingestion.file_upload import save_upload_file
from backend.ingestion.file_detector import detect_file_type
from backend.parsers.pdf_parser import extract_pdf_text
from backend.parsers.code_parser import parse_code_file
from backend.ocr.image_ocr import extract_text_from_image
from backend.processing.text_cleaner import clean_text
from backend.processing.chunker import chunk_text
from backend.storage.document_store import (
    save_processed_document, 
    get_processed_document, 
    list_processed_documents, 
    delete_document, 
    rename_document
)
from backend.rag.embedding_model import generate_embeddings
from backend.rag.vector_store import vector_store
from backend.api.events import broadcast_update
from backend.api.auth_routes import get_current_user_optional

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = user["id"] if user else "default"
    file_path = await save_upload_file(file)
    doc_id = str(uuid.uuid4())
    filename = file.filename
    
    file_type = detect_file_type(file_path)
    all_chunks = []
    
    try:
        if file_type == 'pdf':
            pages = extract_pdf_text(file_path)
            for page in pages:
                cleaned = clean_text(page['text'])
                chunks = chunk_text(cleaned, filename, {"page": page['page_number'], "source": filename, "user_id": user_id})
                all_chunks.extend(chunks)
        elif file_type == 'image':
            text = extract_text_from_image(file_path)
            cleaned = clean_text(text)
            chunks = chunk_text(cleaned, filename, {"source": filename, "type": "image_ocr", "user_id": user_id})
            all_chunks.extend(chunks)
        elif file_type == 'code':
            parts = parse_code_file(file_path)
            for part in parts:
                cleaned = clean_text(part['content'])
                chunks = chunk_text(cleaned, filename, {"source": filename, "code_type": part['type'], "name": part.get('name', 'block'), "user_id": user_id})
                all_chunks.extend(chunks)
        elif file_type == 'text':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            cleaned = clean_text(text)
            chunks = chunk_text(cleaned, filename, {"source": filename, "user_id": user_id})
            all_chunks.extend(chunks)
            
        for c in all_chunks:
            c['user_id'] = user_id
            
        if all_chunks:
            chunk_texts = [c['chunk_text'] for c in all_chunks]
            embeddings = generate_embeddings(chunk_texts)
            vector_store.add_chunks(embeddings, all_chunks)
            vector_store.save()
            
        save_processed_document(doc_id, all_chunks, raw_path=file_path, user_id=user_id, filename=filename)
        
        await broadcast_update("DOCUMENT_UPLOADED", {"id": doc_id, "filename": filename, "user_id": user_id})
        
        return {
            "document_id": doc_id,
            "filename": filename,
            "type": file_type,
            "chunks_count": len(all_chunks),
            "status": "success"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@router.get("/documents")
async def list_documents(user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    return {"documents": list_processed_documents(user_id=user_id)}

@router.get("/document/{doc_id}")
async def get_document(doc_id: str, user: Optional[dict] = Depends(get_current_user_optional)):
    if not doc_id or doc_id in ("undefined", "null"):
        raise HTTPException(status_code=404, detail="Invalid document ID")
    user_id = user["id"] if user else "default"
    data = get_processed_document(doc_id, user_id=user_id)
    if not data:
        raise HTTPException(status_code=404, detail="Document not found")
    return data

@router.get("/document/{doc_id}/raw")
async def get_raw_document(
    doc_id: str, 
    token: Optional[str] = None,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    if not doc_id or doc_id in ("undefined", "null"):
        raise HTTPException(status_code=404, detail="Invalid document ID")
        
    from backend.storage.auth_store import verify_token
    from fastapi.responses import PlainTextResponse
    
    user_id = user["id"] if user else None
    if not user_id and token:
        payload = verify_token(token)
        if payload:
            user_id = payload.get("user_id")
            
    target_user = user_id or "default"
    data = get_processed_document(doc_id, user_id=target_user)
        
    if not data:
        raise HTTPException(status_code=404, detail="Document snapshot not found")
        
    raw_path = data.get("metadata", {}).get("raw_path")
    filename = data.get("metadata", {}).get("filename", "document.pdf")
    if raw_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        basename = os.path.basename(raw_path)
        candidates = [
            raw_path,
            os.path.join(base_dir, raw_path),
            os.path.join(base_dir, "data", "uploads", basename),
            os.path.join("data", "uploads", basename),
            os.path.join("/tmp/uploads", basename)
        ]
        for p in candidates:
            if p and os.path.exists(p) and os.path.isfile(p):
                ext = os.path.splitext(p)[1].lower()
                media_type = "application/pdf" if ext == ".pdf" else (
                    "image/png" if ext == ".png" else (
                        "image/jpeg" if ext in [".jpg", ".jpeg"] else None
                    )
                )
                headers = {
                    "Content-Disposition": f"inline; filename=\"{filename}\"",
                    "Accept-Ranges": "bytes"
                }
                return FileResponse(p, media_type=media_type, headers=headers)

    # Graceful fallback: return extracted text chunks instead of 404
    chunks = data.get("chunks", [])
    if chunks:
        full_text = "\n\n".join(c.get("chunk_text", "") for c in chunks)
        return PlainTextResponse(full_text)
        
    raise HTTPException(status_code=404, detail="Document content not available")

@router.delete("/document/{doc_id}")
async def remove_document(doc_id: str, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    delete_document(doc_id, user_id=user_id)
    await broadcast_update("DOCUMENT_DELETED", {"id": doc_id, "user_id": user_id})
    return {"status": "deleted"}

class RenameRequest(BaseModel):
    new_name: str

@router.patch("/document/{doc_id}")
async def update_document_name(doc_id: str, request: RenameRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "default"
    rename_document(doc_id, request.new_name, user_id=user_id)
    await broadcast_update("DOCUMENT_RENAMED", {"id": doc_id, "new_name": request.new_name, "user_id": user_id})
    return {"status": "renamed"}

@router.get("/search")
async def global_search(query: str, top_k: int = 5, user: Optional[dict] = Depends(get_current_user_optional)):
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    user_id = user["id"] if user else "default"
    query_vector = generate_embeddings([query])[0]
    results = vector_store.search(query_vector, top_k=top_k, user_id=user_id)
    return {"results": results}

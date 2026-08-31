from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
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
from backend.storage.document_store import save_processed_document, get_processed_document, list_processed_documents, delete_document, rename_document
from backend.rag.embedding_model import generate_embeddings
from backend.rag.vector_store import vector_store
from backend.api.events import broadcast_update

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = await save_upload_file(file)
    doc_id = str(uuid.uuid4())
    filename = file.filename
    
    file_type = detect_file_type(file_path)
    
    all_chunks = []
    
    try:
        print("Starting extraction...")
        if file_type == 'pdf':
            pages = extract_pdf_text(file_path)
            for page in pages:
                cleaned = clean_text(page['text'])
                chunks = chunk_text(cleaned, filename, {"page": page['page_number'], "source": filename})
                all_chunks.extend(chunks)
        elif file_type == 'image':
            print("OCR started...")
            text = extract_text_from_image(file_path)
            cleaned = clean_text(text)
            chunks = chunk_text(cleaned, filename, {"source": filename, "type": "image_ocr"})
            all_chunks.extend(chunks)
        elif file_type == 'code':
            print("Code parsing started...")
            parts = parse_code_file(file_path)
            for part in parts:
                cleaned = clean_text(part['content'])
                chunks = chunk_text(cleaned, filename, {"source": filename, "code_type": part['type'], "name": part.get('name', 'block')})
                all_chunks.extend(chunks)
        elif file_type == 'text':
            print("Text parsing started...")
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            cleaned = clean_text(text)
            chunks = chunk_text(cleaned, filename, {"source": filename})
            all_chunks.extend(chunks)
            
        print(f"Extracted {len(all_chunks)} chunks.")
        
        if all_chunks:
            print("Embedding started for {} chunks...".format(len(all_chunks)))
            chunk_texts = [c['chunk_text'] for c in all_chunks]
            embeddings = generate_embeddings(chunk_texts)
            print("Embedding done. Indexing...")
            
            vector_store.add_chunks(embeddings, all_chunks)
            vector_store.save()
            print("Indexing done and saved.")
        else:
            print("No chunks extracted from document.")
            
        print("Saving to SQL database...")
        save_processed_document(doc_id, all_chunks, raw_path=file_path)
        print("SQL Save complete.")
        
        print("Broadcasting update to SSE...")
        await broadcast_update("DOCUMENT_UPLOADED", {"id": doc_id, "filename": filename})
        print("Broadcast done.")
        
        return {
            "document_id": doc_id,
            "filename": filename,
            "type": file_type,
            "chunks_count": len(all_chunks),
            "status": "success"
        }
    except Exception as e:
        import traceback
        print("ERROR IN UPLOAD:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@router.get("/documents")
async def list_documents():
    return {"documents": list_processed_documents()}

@router.get("/document/{doc_id}")
async def get_document(doc_id: str):
    data = get_processed_document(doc_id)
    if not data:
        raise HTTPException(status_code=404, detail="Document not found")
    return data

@router.get("/document/{doc_id}/raw")
async def get_raw_document(doc_id: str):
    data = get_processed_document(doc_id)
    if not data:
        raise HTTPException(status_code=404, detail="Document snapshot not found")
        
    if "metadata" not in data or not data["metadata"].get("raw_path"):
        raise HTTPException(
            status_code=404, 
            detail="Raw document path not available (legacy format). Please re-upload or migrate the document."
        )
    
    file_path = data["metadata"]["raw_path"]
    if not os.path.exists(file_path):
        if os.path.isabs(file_path):
            basename = os.path.basename(file_path)
            potential_path = os.path.join("data", "uploads", basename)
            if os.path.exists(potential_path):
                file_path = potential_path
            else:
                raise HTTPException(status_code=404, detail=f"File missing on server: {basename}")
        else:
            raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(file_path)

@router.delete("/document/{doc_id}")
async def remove_document(doc_id: str):
    delete_document(doc_id)
    await broadcast_update("DOCUMENT_DELETED", {"id": doc_id})
    return {"status": "deleted"}

class RenameRequest(BaseModel):
    new_name: str

@router.patch("/document/{doc_id}")
async def update_document_name(doc_id: str, request: RenameRequest):
    rename_document(doc_id, request.new_name)
    await broadcast_update("DOCUMENT_RENAMED", {"id": doc_id, "new_name": request.new_name})
    return {"status": "renamed"}

@router.get("/search")
async def global_search(query: str, top_k: int = 5):
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    query_vector = generate_embeddings([query])[0]
    
    results = vector_store.search(query_vector, top_k=top_k)
    
    return {"results": results}

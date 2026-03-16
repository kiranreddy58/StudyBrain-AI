from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import os

from backend.ingestion.file_upload import save_upload_file
from backend.ingestion.file_detector import detect_file_type
from backend.parsers.pdf_parser import extract_pdf_text
from backend.parsers.code_parser import parse_code_file
from backend.ocr.image_ocr import extract_text_from_image
from backend.processing.text_cleaner import clean_text
from backend.processing.chunker import chunk_text
from backend.storage.document_store import save_processed_document, get_processed_document, list_processed_documents
from backend.rag.embedding_model import generate_embeddings
from backend.rag.vector_store import vector_store

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # 1. Save File
    file_path = await save_upload_file(file)
    doc_id = str(uuid.uuid4())
    filename = file.filename
    
    # 2. Detect Type
    file_type = detect_file_type(file_path)
    
    all_chunks = []
    
    try:
        # 3. Content Extraction
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
        
        # 4. Generate Embeddings & Index
        if all_chunks:
            print("Embedding started...")
            # Extract only text for embedding
            chunk_texts = [c['chunk_text'] for c in all_chunks]
            embeddings = generate_embeddings(chunk_texts)
            print("Embedding done. Indexing...")
            
            # Add to FAISS index
            vector_store.add_chunks(embeddings, all_chunks)
            vector_store.save()
            print("Indexing done.")
            
        # 5. Save Processed Data (JSON snapshot)
        save_processed_document(doc_id, all_chunks)
        print("Save complete.")
        
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
        raise HTTPException(status_code=500, detail=f"Ingegion failed: {str(e)}")

@router.get("/documents")
async def list_documents():
    return {"documents": list_processed_documents()}

@router.get("/document/{doc_id}")
async def get_document(doc_id: str):
    chunks = get_processed_document(doc_id)
    if not chunks:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"id": doc_id, "chunks": chunks}

import json
import os

STORAGE_DIR = "data/processed_documents"

def save_processed_document(doc_id: str, chunks: list):
    """
    Stores processed chunks as a JSON file.
    """
    if not os.path.exists(STORAGE_DIR):
        os.makedirs(STORAGE_DIR, exist_ok=True)
        
    file_path = os.path.join(STORAGE_DIR, f"{doc_id}.json")
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2)
        
    return file_path

def get_processed_document(doc_id: str) -> list:
    """
    Retrieves stored chunks for a document.
    """
    file_path = os.path.join(STORAGE_DIR, f"{doc_id}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def list_processed_documents():
    """
    Lists all processed documents with metadata.
    """
    if not os.path.exists(STORAGE_DIR):
        return []
    
    docs = []
    for f in os.listdir(STORAGE_DIR):
        if f.endswith(".json"):
            doc_id = f.replace(".json", "")
            file_path = os.path.join(STORAGE_DIR, f)
            try:
                with open(file_path, "r", encoding="utf-8") as j:
                    chunks = json.load(j)
                    if chunks:
                        # Chunks are flat dicts — source is a direct key
                        first = chunks[0]
                        source = first.get('source', doc_id)
                        # Detect type from metadata
                        if 'code_type' in first:
                            doc_type = 'code'
                        elif first.get('type') == 'image_ocr':
                            doc_type = 'image'
                        elif source.lower().endswith('.pdf'):
                            doc_type = 'pdf'
                        else:
                            doc_type = 'text'
                        docs.append({
                            "id": doc_id,
                            "filename": source,
                            "type": doc_type,
                            "chunks_count": len(chunks),
                            "uploaded_at": os.path.getmtime(file_path) * 1000
                        })
            except:
                continue
    return docs

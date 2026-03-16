import sys
import os
import traceback

# Add project root to sys.path
sys.path.append(os.getcwd())

print("Testing ingestion pipeline logic directly...")
try:
    from backend.api.routes import router
    from backend.ingestion.file_upload import save_upload_file
    from backend.ingestion.file_detector import detect_file_type
    from backend.parsers.pdf_parser import extract_pdf_text
    from backend.processing.text_cleaner import clean_text
    from backend.processing.chunker import chunk_text
    from backend.rag.embedding_model import generate_embeddings
    from backend.rag.vector_store import vector_store
    
    print("All basic imports successful.")
    
    # Mocking a chunk to test RAG parts
    test_chunks = [{"chunk_text": "Sample text", "source": "test.txt"}]
    print("Testing embedding generation...")
    texts = [c['chunk_text'] for c in test_chunks]
    embs = generate_embeddings(texts)
    print(f"SUCCESS: Generated embeddings shape: {embs.shape}")
    
    print("Testing vector store add...")
    vector_store.add_chunks(embs, test_chunks)
    vector_store.save()
    print("SUCCESS: Vector store save")
    
except Exception:
    print("FAILED with traceback:")
    traceback.print_exc()

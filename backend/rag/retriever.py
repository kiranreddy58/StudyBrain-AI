from backend.rag.vector_store import vector_store
from backend.rag.embedding_model import generate_query_embedding

def retrieve_context(query: str, top_k: int = 5) -> list:
    """
    Retrieves the most relevant document chunks for a given query.
    """
    # 1. Create query embedding
    query_vec = generate_query_embedding(query)
    
    # 2. Search vector store
    # Ensure store is loaded if indices exist
    if len(vector_store.metadata) == 0:
        vector_store.load()
        
    results = vector_store.search(query_vec, top_k)
    return results

def format_context_for_llm(retrieved_results: list) -> str:
    """
    Combines retrieved chunks into a single context block.
    """
    context_blocks = []
    for i, res in enumerate(retrieved_results):
        meta = res['metadata']
        text = meta.get('chunk_text', '')
        source = meta.get('source', 'Unknown')
        page = f" (Page {meta['page']})" if 'page' in meta else ""
        
        context_blocks.append(f"--- Document: {source}{page} ---\n{text}")
        
    return "\n\n".join(context_blocks)

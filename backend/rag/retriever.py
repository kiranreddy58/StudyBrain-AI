from backend.rag.vector_store import vector_store
from backend.rag.embedding_model import generate_query_embedding

def retrieve_context(query: str, top_k: int = 5, source: str = None) -> list:
    """
    Retrieves the most relevant document chunks for a given query.
    If source is provided, filters results to that specific document.
    """
    query_vec = generate_query_embedding(query)
    
    if len(vector_store.metadata) == 0:
        vector_store.load()
        
    search_k = top_k * 5 if source else top_k
    results = vector_store.search(query_vec, search_k)
    
    if source:
        results = [res for res in results if res['metadata'].get('source') == source][:top_k]
    else:
        results = results[:top_k]
        
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

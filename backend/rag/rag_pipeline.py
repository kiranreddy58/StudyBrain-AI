from backend.rag.retriever import retrieve_context, format_context_for_llm
from backend.llm.llm_interface import llm

async def run_rag_pipeline(query: str, provider: str = "auto", user_id: str = None):
    """
    Executes the full RAG pipeline: Query -> Retrieval -> Context -> Generation, isolated by user_id.
    """
    relevant_chunks = retrieve_context(query, top_k=3, user_id=user_id)
    
    context = format_context_for_llm(relevant_chunks)
    
    result = await llm.generate_answer(query, context, provider=provider)
    
    return result

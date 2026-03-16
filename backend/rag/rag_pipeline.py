from backend.rag.retriever import retrieve_context, format_context_for_llm
from backend.llm.llm_interface import llm

async def run_rag_pipeline(query: str, provider: str = "auto"):
    """
    Executes the full RAG pipeline: Query -> Retrieval -> Context -> Generation.
    """
    # 1. Retrieve
    relevant_chunks = retrieve_context(query, top_k=3)
    
    # 2. Format Context
    context = format_context_for_llm(relevant_chunks)
    
    # 3. Generate Answer
    result = await llm.generate_answer(query, context, provider=provider)
    
    return result

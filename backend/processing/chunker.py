import tiktoken

def chunk_text(text: str, source_file: str, metadata_base: dict = None) -> list:
    """
    Splits text into chunks of 500 tokens with 100 token overlap.
    """
    if not text:
        return []
        
    # Use tiktoken for accurate token counting (similar to GPT models)
    try:
        encoding = tiktoken.get_encoding("cl100k_base")
    except:
        encoding = tiktoken.get_encoding("gpt2")
        
    tokens = encoding.encode(text)
    
    chunk_size = 500
    overlap = 100
    
    chunks = []
    
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i : i + chunk_size]
        chunk_text = encoding.decode(chunk_tokens)
        
        chunk_meta = (metadata_base or {}).copy()
        chunk_meta.update({
            "chunk_id": f"{source_file}_{len(chunks)}",
            "chunk_text": chunk_text,
            "token_count": len(chunk_tokens)
        })
        
        chunks.append(chunk_meta)
        
        if i + chunk_size >= len(tokens):
            break
            
    return chunks

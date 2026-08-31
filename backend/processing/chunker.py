def chunk_text(text: str, source_file: str, metadata_base: dict = None) -> list:
    """
    Splits text into chunks of 500 tokens/words with 100 overlap.
    """
    if not text:
        return []
        
    try:
        import tiktoken
        try:
            encoding = tiktoken.get_encoding("cl100k_base")
        except Exception:
            encoding = tiktoken.get_encoding("gpt2")
        tokens = encoding.encode(text)
        chunk_size = 500
        overlap = 100
        chunks = []
        for i in range(0, len(tokens), chunk_size - overlap):
            chunk_tokens = tokens[i : i + chunk_size]
            chunk_txt = encoding.decode(chunk_tokens)
            chunk_meta = (metadata_base or {}).copy()
            chunk_meta.update({
                "chunk_id": f"{source_file}_{len(chunks)}",
                "chunk_text": chunk_txt,
                "token_count": len(chunk_tokens)
            })
            chunks.append(chunk_meta)
            if i + chunk_size >= len(tokens):
                break
        return chunks
    except Exception:
        words = text.split()
        chunk_size = 400
        overlap = 80
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i : i + chunk_size]
            chunk_txt = " ".join(chunk_words)
            chunk_meta = (metadata_base or {}).copy()
            chunk_meta.update({
                "chunk_id": f"{source_file}_{len(chunks)}",
                "chunk_text": chunk_txt,
                "token_count": int(len(chunk_words) * 1.3)
            })
            chunks.append(chunk_meta)
            if i + chunk_size >= len(words):
                break
        return chunks


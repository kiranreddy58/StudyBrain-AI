import numpy as np

_model = None

def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embeddings(text_list: list) -> np.ndarray:
    """
    Converts a list of text strings into a matrix of embeddings.
    """
    if not text_list:
        return np.array([])
        
    model = _get_model()
    embeddings = model.encode(text_list)
    return np.array(embeddings).astype('float32')

def generate_query_embedding(query: str) -> np.ndarray:
    """
    Converts a single query string into an embedding vector.
    """
    model = _get_model()
    embedding = model.encode([query])
    return np.array(embedding).astype('float32')

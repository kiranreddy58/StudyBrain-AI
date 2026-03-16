from sentence_transformers import SentenceTransformer
import numpy as np

# Load a lightweight, efficient embedding model
# 'all-MiniLM-L6-v2' is small (~80MB) and fast for local use
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embeddings(text_list: list) -> np.ndarray:
    """
    Converts a list of text strings into a matrix of embeddings.
    """
    if not text_list:
        return np.array([])
        
    embeddings = model.encode(text_list)
    return np.array(embeddings).astype('float32')

def generate_query_embedding(query: str) -> np.ndarray:
    """
    Converts a single query string into an embedding vector.
    """
    embedding = model.encode([query])
    return np.array(embedding).astype('float32')

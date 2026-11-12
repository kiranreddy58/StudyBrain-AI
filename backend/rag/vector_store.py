import os
import json

def _get_vector_paths():
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        return "/tmp/vector_index/study_brain.index", "/tmp/vector_index/metadata.json"
    local_idx = "data/vector_index/study_brain.index"
    local_meta = "data/vector_index/metadata.json"
    try:
        os.makedirs(os.path.dirname(local_idx), exist_ok=True)
        return local_idx, local_meta
    except (OSError, PermissionError):
        return "/tmp/vector_index/study_brain.index", "/tmp/vector_index/metadata.json"

INDEX_FILE, METADATA_FILE = _get_vector_paths()

class VectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.embeddings = []
        self.metadata = []

    def add_chunks(self, embeddings: list, chunk_metadata: list):
        """
        Adds embeddings and their corresponding metadata to the store.
        """
        if not embeddings:
            return
            
        self.dimension = len(embeddings[0])
        
        self.embeddings.extend(embeddings)
        self.metadata.extend(chunk_metadata)

    def search(self, query_embedding: list, top_k: int = 5, user_id: str = None):
        """
        Performs similarity search using pure Python L2 distance and returns top-k chunks,
        optionally filtered by user_id for multi-tenant isolation.
        """
        if not self.embeddings or not self.metadata or not query_embedding:
            return []
            
        q_vec = query_embedding
        
        candidates = []
        for idx, (emb, meta) in enumerate(zip(self.embeddings, self.metadata)):
            if user_id:
                chunk_user = meta.get("user_id")
                if chunk_user and chunk_user != user_id and chunk_user != "default":
                    continue
            dist = sum((x - y) ** 2 for x, y in zip(emb, q_vec))
            candidates.append((dist, meta))
            
        candidates.sort(key=lambda x: x[0])
        return [{"metadata": meta, "score": float(dist)} for dist, meta in candidates[:top_k]]

    def save(self):
        """
        Saves the embeddings (as .json) and metadata (as .json) to disk.
        """
        os.makedirs(os.path.dirname(INDEX_FILE), exist_ok=True)
        with open(INDEX_FILE + ".json", 'w', encoding='utf-8') as f:
            json.dump(self.embeddings, f)
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2)

    def load(self):
        """
        Loads the embeddings and metadata from disk.
        """
        json_path = INDEX_FILE + ".json"
        if os.path.exists(json_path) and os.path.exists(METADATA_FILE):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    self.embeddings = json.load(f)
                with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                if self.embeddings and len(self.embeddings) > 0:
                    self.dimension = len(self.embeddings[0])
                return True
            except Exception as e:
                print(f"Error loading JSON vector store: {e}")
        
        npy_path = INDEX_FILE + ".npy"
        if os.path.exists(npy_path) and os.path.exists(METADATA_FILE):
            try:
                import numpy as np
                self.embeddings = np.load(npy_path).tolist()
                with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                if self.embeddings and len(self.embeddings) > 0:
                    self.dimension = len(self.embeddings[0])
                return True
            except Exception as e:
                print(f"Failed to load legacy numpy index: {e}")
        return False

vector_store = VectorStore()

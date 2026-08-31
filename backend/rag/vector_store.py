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
        self.embeddings = []  # List of lists of floats
        self.metadata = []

    def add_chunks(self, embeddings: list, chunk_metadata: list):
        """
        Adds embeddings and their corresponding metadata to the store.
        """
        if not embeddings:
            return
            
        # Update dimension dynamically based on input embeddings
        self.dimension = len(embeddings[0])
        
        self.embeddings.extend(embeddings)
        self.metadata.extend(chunk_metadata)

    def search(self, query_embedding: list, top_k: int = 5):
        """
        Performs similarity search using pure Python L2 distance and returns top-k chunks.
        """
        if not self.embeddings or not self.metadata or not query_embedding:
            return []
            
        # Ensure query_embedding is a flat list
        q_vec = query_embedding
        
        # Calculate L2 distance: sum((a - b)^2)
        distances = []
        for emb in self.embeddings:
            dist = sum((x - y) ** 2 for x, y in zip(emb, q_vec))
            distances.append(dist)
        
        # Get top-k indices sorted by distance ascending
        top_k = min(top_k, len(distances))
        indices = sorted(range(len(distances)), key=lambda i: distances[i])[:top_k]
        
        results = []
        for idx in indices:
            if idx < len(self.metadata):
                results.append({
                    "metadata": self.metadata[idx],
                    "score": float(distances[idx])
                })
        return results

    def save(self):
        """
        Saves the embeddings (as .json) and metadata (as .json) to disk.
        """
        os.makedirs(os.path.dirname(INDEX_FILE), exist_ok=True)
        # Save embeddings as JSON list
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
        
        # Fallback to load legacy numpy format if numpy is installed
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

# Global instance
vector_store = VectorStore()

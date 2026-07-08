import numpy as np
import os
import json

if os.environ.get("VERCEL") == "1":
    INDEX_FILE = "/tmp/vector_index/study_brain.index"
    METADATA_FILE = "/tmp/vector_index/metadata.json"
else:
    INDEX_FILE = "data/vector_index/study_brain.index"
    METADATA_FILE = "data/vector_index/metadata.json"

class VectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.embeddings = None  # 2D numpy array of shape (N, dimension)
        self.metadata = []

    def add_chunks(self, embeddings: np.ndarray, chunk_metadata: list):
        """
        Adds embeddings and their corresponding metadata to the store.
        """
        if embeddings.shape[0] == 0:
            return
            
        # Update dimension dynamically based on input embeddings
        self.dimension = embeddings.shape[1]
        
        if self.embeddings is None or self.embeddings.shape[0] == 0:
            self.embeddings = embeddings.copy()
        else:
            self.embeddings = np.vstack([self.embeddings, embeddings])
            
        self.metadata.extend(chunk_metadata)

    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        """
        Performs similarity search using numpy L2 distance and returns top-k chunks.
        """
        if self.embeddings is None or self.embeddings.shape[0] == 0 or len(self.metadata) == 0:
            return []
            
        # query_embedding shape could be (1, dimension) or (dimension,)
        # Flatten to (dimension,) to ensure correct broadcasting
        q_vec = query_embedding.reshape(-1)
        
        # Calculate L2 distance: sum((a - b)^2) along rows (axis 1)
        distances = np.sum((self.embeddings - q_vec) ** 2, axis=1)
        
        # Get top-k indices sorted by distance ascending
        top_k = min(top_k, len(distances))
        indices = np.argsort(distances)[:top_k]
        
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
        Saves the embeddings (as .npy) and metadata (as .json) to disk.
        """
        os.makedirs(os.path.dirname(INDEX_FILE), exist_ok=True)
        if self.embeddings is not None:
            np.save(INDEX_FILE + ".npy", self.embeddings)
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2)

    def load(self):
        """
        Loads the embeddings and metadata from disk.
        """
        npy_path = INDEX_FILE + ".npy"
        if os.path.exists(npy_path) and os.path.exists(METADATA_FILE):
            try:
                self.embeddings = np.load(npy_path)
                with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                if self.embeddings is not None and len(self.embeddings) > 0:
                    self.dimension = self.embeddings.shape[1]
                return True
            except Exception as e:
                print(f"Error loading numpy vector store: {e}")
        elif os.path.exists(INDEX_FILE) and os.path.exists(METADATA_FILE):
            # Fallback to load legacy FAISS index if installed (for local dev consistency)
            try:
                import faiss
                index = faiss.read_index(INDEX_FILE)
                ntotal = index.ntotal
                if ntotal > 0:
                    self.embeddings = np.empty((ntotal, index.d), dtype='float32')
                    for i in range(ntotal):
                        self.embeddings[i] = index.reconstruct(i)
                else:
                    self.embeddings = np.empty((0, index.d), dtype='float32')
                
                with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                self.dimension = index.d
                return True
            except Exception as e:
                print(f"Failed to load legacy FAISS index: {e}")
        return False

# Global instance
vector_store = VectorStore()


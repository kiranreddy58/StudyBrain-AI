import faiss
import numpy as np
import os
import json

INDEX_FILE = "data/vector_index/study_brain.index"
METADATA_FILE = "data/vector_index/metadata.json"

class VectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.metadata = []  # List of dicts matching index order

    def add_chunks(self, embeddings: np.ndarray, chunk_metadata: list):
        """
        Adds embeddings and their corresponding metadata to the store.
        """
        if embeddings.shape[0] == 0:
            return
            
        self.index.add(embeddings)
        self.metadata.extend(chunk_metadata)

    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        """
        Performs similarity search and returns top-k chunks with metadata.
        """
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for i in range(len(indices[0])):
            idx = indices[0][i]
            if idx != -1 and idx < len(self.metadata):
                results.append({
                    "metadata": self.metadata[idx],
                    "score": float(distances[0][i])
                })
        return results

    def save(self):
        """
        Saves the FAISS index and metadata to disk.
        """
        os.makedirs(os.path.dirname(INDEX_FILE), exist_ok=True)
        faiss.write_index(self.index, INDEX_FILE)
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2)

    def load(self):
        """
        Loads the index and metadata from disk.
        """
        if os.path.exists(INDEX_FILE) and os.path.exists(METADATA_FILE):
            self.index = faiss.read_index(INDEX_FILE)
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
            return True
        return False

# Global instance
vector_store = VectorStore()

import numpy as np
import os
import requests
import time

def _get_local_model():
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer('all-MiniLM-L6-v2')
    except ImportError:
        return None

def generate_embeddings(text_list: list) -> np.ndarray:
    if not text_list:
        return np.array([]).astype('float32')

    # 1. Try Hugging Face Inference API first (extremely fast, matching local model dimensions)
    try:
        hf_token = os.environ.get("HF_API_KEY") or os.environ.get("HF_TOKEN")
        headers = {}
        if hf_token:
            headers["Authorization"] = f"Bearer {hf_token}"
        
        # Retry once if the model is loading
        for attempt in range(2):
            response = requests.post(
                "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
                headers=headers,
                json={"inputs": text_list},
                timeout=15
            )
            if response.status_code == 200:
                res_data = response.json()
                if isinstance(res_data, list) and len(res_data) > 0:
                    if isinstance(res_data[0], list):
                        return np.array(res_data).astype('float32')
                    elif isinstance(res_data[0], float):
                        return np.array([res_data]).astype('float32')
            elif response.status_code == 503:
                # Model is loading on HF servers, wait a bit and retry
                err_data = response.json()
                wait_time = min(err_data.get("estimated_time", 5), 5)
                print(f"Hugging Face model is loading. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            else:
                print(f"Hugging Face returned status {response.status_code}: {response.text}")
                break
    except Exception as e:
        print(f"Hugging Face embeddings failed: {e}")

    # 2. Try Gemini Embeddings API if key is available
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text_list,
                task_type="retrieval_document"
            )
            if "embedding" in result:
                embeddings = [e['values'] for e in result['embedding']]
                return np.array(embeddings).astype('float32')
        except Exception as e:
            print(f"Gemini embeddings failed: {e}")

    # 3. Fallback to local sentence-transformers if installed (e.g. for local dev)
    local_model = _get_local_model()
    if local_model is not None:
        try:
            embeddings = local_model.encode(text_list)
            return np.array(embeddings).astype('float32')
        except Exception as e:
            print(f"Local sentence-transformers embedding failed: {e}")

    # 4. Ultimate offline/no-key fallback: Generate dummy embeddings (hash-based) so it doesn't crash
    print("WARNING: All embedding providers failed. Generating dummy embeddings.")
    dim = 384
    dummy = []
    for text in text_list:
        state = np.random.RandomState(abs(hash(text)) % (2**32))
        dummy.append(state.randn(dim))
    return np.array(dummy).astype('float32')

def generate_query_embedding(query: str) -> np.ndarray:
    """
    Converts a single query string into an embedding vector.
    """
    return generate_embeddings([query])


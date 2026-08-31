import os
import requests
import time
import random

def _get_local_model():
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer('all-MiniLM-L6-v2')
    except ImportError:
        return None

def generate_embeddings(text_list: list) -> list:
    if not text_list:
        return []

    try:
        hf_token = os.environ.get("HF_API_KEY") or os.environ.get("HF_TOKEN")
        headers = {}
        if hf_token:
            headers["Authorization"] = f"Bearer {hf_token}"
        
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
                        return [[float(x) for x in emb] for emb in res_data]
                    elif isinstance(res_data[0], float):
                        return [[float(x) for x in res_data]]
            elif response.status_code == 503:
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

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key={api_key}"
            requests_payload = {
                "requests": [
                    {
                        "model": "models/text-embedding-004",
                        "content": {"parts": [{"text": text}]}
                    } for text in text_list
                ]
            }
            response = requests.post(url, json=requests_payload, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                if "embeddings" in res_data:
                    return [[float(x) for x in e["values"]] for e in res_data["embeddings"]]
        except Exception as e:
            print(f"Gemini embeddings REST call failed: {e}")

    local_model = _get_local_model()
    if local_model is not None:
        try:
            embeddings = local_model.encode(text_list)
            return [[float(x) for x in emb] for emb in embeddings.tolist()]
        except Exception as e:
            print(f"Local sentence-transformers embedding failed: {e}")

    print("WARNING: All embedding providers failed. Generating dummy embeddings.")
    dim = 384
    dummy = []
    for text in text_list:
        random.seed(abs(hash(text)) % (2**32))
        dummy.append([random.gauss(0, 1) for _ in range(dim)])
    return dummy

def generate_query_embedding(query: str) -> list:
    """
    Converts a single query string into an embedding vector.
    """
    embeddings = generate_embeddings([query])
    return embeddings[0] if embeddings else []

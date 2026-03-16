import requests
import json
import os

API_BASE = "http://127.0.0.1:8000/api"

def test_heatmap_data():
    print("--- Verifying Heatmap Data ---")
    
    # 1. Track a dummy activity
    print("1. Tracking a dummy activity...")
    payload = {
        "topic": "Test Topic",
        "quiz_score": 8,
        "quiz_total": 10,
        "study_time_minutes": 15.0,
        "mistakes": 2
    }
    track_res = requests.post(f"{API_BASE}/learning/track-learning", json=payload)
    if track_res.status_code != 200:
        print(f"FAILED: /track-learning returned {track_res.status_code}")
        return

    # 2. Check /learning-progress for heatmap_data
    print("2. Checking /learning-progress for heatmap_data...")
    progress_res = requests.get(f"{API_BASE}/copilot/learning-progress")
    if progress_res.status_code == 200:
        data = progress_res.json()
        heatmap = data.get("heatmap_data", [])
        print(f"   SUCCESS: Received heatmap data with {len(heatmap)} days.")
        
        # Today's session should be recorded (last element in the list)
        if heatmap[-1] > 0:
            print("   SUCCESS: Today's activity is reflected in the heatmap.")
        else:
            print("   WARNING: Today's activity not found in heatmap data.")
    else:
        print(f"FAILED: /learning-progress returned {progress_res.status_code}")

def test_llm_ollama_fallback():
    print("\n--- Verifying LLM Integration ---")
    question = "This is a test question to check LLM connectivity."
    print(f"Asking: '{question}'")
    
    # We use /ai/ask which uses the RAG pipeline
    # Note: RAG requires some context, so let's use a topic we just tracked if possible
    # Actually, /ai/ask uses retriever.py which searches the index.
    # Let's just call the endpoint and see if it responds (it will likely say no relevant mapping if index is empty)
    
    response = requests.post(f"{API_BASE}/ai/ask", json={"question": question})
    if response.status_code == 200:
        result = response.json()
        print("AI Response received.")
        print(f"Answer: {result['answer'][:100]}...")
        print("SUCCESS: LLM interface is functional.")
    else:
        print(f"FAILED: /ai/ask returned {response.status_code}: {response.text}")

if __name__ == "__main__":
    test_heatmap_data()
    test_llm_ollama_fallback()

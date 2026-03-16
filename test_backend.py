import requests
import os
import time

API_URL = "http://127.0.0.1:8000"

def test_backend_workflow():
    # 1. Create a sample test file
    test_filename = "test_study_material.txt"
    with open(test_filename, "w") as f:
        f.write("This is a test document for StudyBrain AI. " * 50)
        f.write("\n\nMachine learning is a subset of AI that focuses on building systems that learn from data.")
        
    print(f"Created test file: {test_filename}")
    
    # 2. Upload the file
    try:
        with open(test_filename, "rb") as f:
            files = {"file": (test_filename, f, "text/plain")}
            response = requests.post(f"{API_URL}/upload", files=files)
            
        if response.status_code == 200:
            data = response.json()
            doc_id = data["document_id"]
            print(f"Upload successful! Doc ID: {doc_id}")
            print(f"Chunks created: {data['chunks_count']}")
            
            # 3. Retrieve chunks
            get_response = requests.get(f"{API_URL}/document/{doc_id}")
            if get_response.status_code == 200:
                chunks_data = get_response.json()
                print(f"Successfully retrieved {len(chunks_data['chunks'])} chunks from storage.")
                print(f"Sample chunk: {chunks_data['chunks'][0]['chunk_text'][:100]}...")
            else:
                print(f"Failed to retrieve document: {get_response.text}")
        else:
            print(f"Upload failed: {response.text}")
            
    except Exception as e:
        print(f"Error during test: {e}")
    finally:
        if os.path.exists(test_filename):
            os.remove(test_filename)

if __name__ == "__main__":
    test_backend_workflow()

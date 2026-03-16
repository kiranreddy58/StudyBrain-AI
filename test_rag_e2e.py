import requests
import os
import time

API_BASE = "http://127.0.0.1:8000/api"

def test_rag_workflow():
    print("--- Starting Phase 3 RAG Verification ---")
    
    # 1. Create a detailed study document
    test_filename = "quantum_physics_intro.txt"
    content = """
    Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.
    
    Wave-Particle Duality: 
    This principle states that every particle or quantum entity may be described as either a particle or a wave. It expresses the inability of the classical concepts 'particle' or 'wave' to fully describe the behavior of quantum-scale objects.
    
    Schrödinger Equation:
    In quantum mechanics, the Schrödinger equation is a linear partial differential equation that governs the wave function of a quantum-mechanical system.
    """
    
    with open(test_filename, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"1. Created test document: {test_filename}")
    
    try:
        # 2. Upload and Index
        print("2. Uploading and Indexing document...")
        with open(test_filename, "rb") as f:
            files = {"file": (test_filename, f, "text/plain")}
            response = requests.post(f"{API_BASE}/ingestion/upload", files=files)
            
        if response.status_code != 200:
            print(f"FAILED: Upload failed with {response.status_code}: {response.text}")
            return
            
        data = response.json()
        doc_id = data["document_id"]
        print(f"   SUCCESS: Document {doc_id} indexed with {data['chunks_count']} chunks.")
        
        # Give a small buffer for disk I/O
        time.sleep(1)
        
        # 3. Ask a Semantic Question
        question = "What is wave-particle duality and what scale does quantum mechanics describe?"
        print(f"3. Asking Question: '{question}'")
        
        ask_response = requests.post(f"{API_BASE}/ai/ask", json={"question": question})
        
        if ask_response.status_code == 200:
            result = ask_response.json()
            print("\n--- AI RESPONSE ---")
            print(result["answer"])
            print("\nSources:", result["sources"])
            print("-------------------\n")
            
            if "Wave-Particle Duality" in result["answer"] or "atoms" in result["answer"]:
                print("E2E VERIFICATION: PASSED (Answer is grounded in context)")
            else:
                print("E2E VERIFICATION: FAILED (Answer does not contain expected context)")
        else:
            print(f"FAILED: /ask endpoint returned {ask_response.status_code}: {ask_response.text}")
            
    except Exception as e:
        print(f"ERROR during test: {e}")
    finally:
        if os.path.exists(test_filename):
            os.remove(test_filename)

if __name__ == "__main__":
    test_rag_workflow()

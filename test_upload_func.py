import sys
import os
import asyncio
from unittest.mock import MagicMock

# Add project root to path
sys.path.append(os.getcwd())

async def test_upload_function():
    print("Importing routes...")
    from backend.api.routes import upload_document
    
    mock_file = MagicMock()
    mock_file.filename = "test.txt"
    mock_file.file = MagicMock()
    
    # Mocking save_upload_file since it writes to disk
    async def mock_save(file):
        path = "data/uploads/test_file.txt"
        os.makedirs("data/uploads", exist_ok=True)
        with open(path, "w") as f:
            f.write("Quantum physics is the study of matter and energy at the most fundamental level.")
        return path
        
    print("Mocking save_upload_file...")
    import backend.api.routes
    backend.api.routes.save_upload_file = mock_save
    
    print("Calling upload_document...")
    try:
        result = await upload_document(mock_file)
        print(f"SUCCESS: {result}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_upload_function())

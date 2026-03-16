import os
import shutil
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "data/uploads"

async def save_upload_file(upload_file: UploadFile) -> str:
    # Ensure directory exists (should be created by init, but double check)
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

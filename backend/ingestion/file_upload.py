import os
import shutil
import uuid
from fastapi import UploadFile

def _get_upload_dir():
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        return "/tmp/uploads"
    local_dir = "data/uploads"
    try:
        os.makedirs(local_dir, exist_ok=True)
        return local_dir
    except (OSError, PermissionError):
        return "/tmp/uploads"

UPLOAD_DIR = _get_upload_dir()

async def save_upload_file(upload_file: UploadFile) -> str:
    global UPLOAD_DIR
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
    except (OSError, PermissionError):
        UPLOAD_DIR = "/tmp/uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

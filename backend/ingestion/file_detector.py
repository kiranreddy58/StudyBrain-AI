import os
import mimetypes

def detect_file_type(file_path: str) -> str:
    _, ext = os.path.splitext(file_path.lower())
    
    if ext == '.pdf':
        return 'pdf'
    
    if ext in ['.png', '.jpg', '.jpeg']:
        return 'image'
        
    if ext in ['.py', '.java', '.cpp', '.js', '.ts', '.css', '.html']:
        return 'code'
        
    if ext in ['.txt', '.md']:
        return 'text'
        
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
        if 'image' in mime_type: return 'image'
        if 'text' in mime_type: return 'text'
        if 'pdf' in mime_type: return 'pdf'
        
    return 'unknown'

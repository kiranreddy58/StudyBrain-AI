import re

def clean_text(text: str) -> str:
    """
    Cleans and normalizes extracted text.
    """
    if not text:
        return ""
        
    text = re.sub(r'\s+', ' ', text)
    
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    
    return text.strip()

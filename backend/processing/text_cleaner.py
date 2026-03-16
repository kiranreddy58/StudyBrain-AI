import re

def clean_text(text: str) -> str:
    """
    Cleans and normalizes extracted text.
    """
    if not text:
        return ""
        
    # 1. Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # 2. Normalize unicode (simple approach)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # 3. Remove duplicate lines (if text was multiline, which it isn't here due to sub above)
    # But let's handle multiline before the whitespace sub if needed.
    
    return text.strip()

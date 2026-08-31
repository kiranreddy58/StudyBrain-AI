import os

def extract_text_from_image(file_path: str) -> str:
    """
    Extracts text from an image using Tesseract OCR.
    """
    try:
        from PIL import Image
        import pytesseract
    except ImportError:
        print("OCR libraries (Pillow/pytesseract) are not installed or supported.")
        return "Error: Image OCR is not supported on this deployment."

    try:
        img = Image.open(file_path)
        
        img = img.convert('L')
        
        text = pytesseract.image_to_string(img)
        
        return text.strip()
    except Exception as e:
        print(f"Error in OCR for {file_path}: {e}")
        return ""

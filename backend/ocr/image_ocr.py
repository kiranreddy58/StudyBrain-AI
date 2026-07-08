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
        # 1. Open image
        img = Image.open(file_path)
        
        # 2. Basic preprocessing (could be expanded)
        # Convert to grayscale
        img = img.convert('L')
        
        # 3. Run OCR
        text = pytesseract.image_to_string(img)
        
        return text.strip()
    except Exception as e:
        print(f"Error in OCR for {file_path}: {e}")
        return ""

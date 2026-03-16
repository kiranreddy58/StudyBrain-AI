import fitz  # PyMuPDF

def extract_pdf_text(file_path: str) -> list:
    """
    Extracts text from PDF page by page.
    Returns: list of dicts {page_number, text}
    """
    results = []
    try:
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            results.append({
                "page_number": page_num + 1,
                "text": text
            })
        doc.close()
    except Exception as e:
        print(f"Error parsing PDF {file_path}: {e}")
        
    return results

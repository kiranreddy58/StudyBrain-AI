import pypdf

def extract_pdf_text(file_path: str) -> list:
    """
    Extracts text from PDF page by page.
    Returns: list of dicts {page_number, text}
    """
    results = []
    try:
        reader = pypdf.PdfReader(file_path)
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text = page.extract_text() or ""
            results.append({
                "page_number": page_num + 1,
                "text": text
            })
    except Exception as e:
        print(f"Error parsing PDF {file_path}: {e}")
        
    return results

def extract_pdf_text(file_path: str) -> list:
    """
    Extracts text from PDF page by page.
    Returns: list of dicts {page_number, text}
    """
    results = []
    
    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text = page.extract_text() or ""
            results.append({
                "page_number": page_num + 1,
                "text": text
            })
        if results:
            return results
    except Exception as e:
        print(f"pypdf extraction failed: {e}")

    try:
        import fitz
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text() or ""
            results.append({
                "page_number": page_num + 1,
                "text": text
            })
        doc.close()
        if results:
            return results
    except Exception as e:
        print(f"pymupdf extraction failed: {e}")

    return results


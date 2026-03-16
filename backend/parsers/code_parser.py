import re

def parse_code_file(file_path: str) -> list:
    """
    Extracts functions, classes, and comments from a code file using regex.
    Returns: list of dicts {type, name, content}
    """
    results = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract comments
        comments = re.findall(r'#.*|/\*.*?\*/|//.*', content, re.DOTALL)
        if comments:
            results.append({
                "type": "comments",
                "content": "\n".join(comments)
            })
            
        # Extract Pythonic functions/classes (simple regex)
        fns = re.findall(r'def\s+(\w+)\s*\(.*?\):', content)
        for fn in fns:
            # Note: capturing only names for now, full body parsing is complex
            results.append({
                "type": "function",
                "name": fn,
                "content": f"Function definition: {fn}"
            })
            
        cls = re.findall(r'class\s+(\w+).*?:', content)
        for c in cls:
            results.append({
                "type": "class",
                "name": c,
                "content": f"Class definition: {c}"
            })
            
        # If no structure found, just treat as raw code block
        if not results:
            results.append({
                "type": "code_block",
                "content": content
            })
            
    except Exception as e:
        print(f"Error parsing code file {file_path}: {e}")
        
    return results

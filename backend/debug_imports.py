import sys
import os
import traceback

sys.path.append(os.getcwd())

print("Testing imports...")
try:
    from api.routes import router
    print("SUCCESS: api.routes imported")
    from api.ask_route import router as ask_router
    print("SUCCESS: api.ask_route imported")
    from rag.rag_pipeline import run_rag_pipeline
    print("SUCCESS: rag.rag_pipeline imported")
except Exception:
    traceback.print_exc()

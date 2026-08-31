from fastapi import FastAPI
from dotenv import load_dotenv
import os
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
from backend.storage.database import init_db
from backend.api.routes import router as ingestion_router
from backend.api.ask_route import router as ask_router
from backend.api.learning_routes import router as learning_router
from backend.api.copilot_routes import router as copilot_router
from backend.api.events import router as events_router
from backend.api.settings_routes import router as settings_router

app = FastAPI(title="StudyBrain AI Backend", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        from backend.ingestion.file_upload import UPLOAD_DIR
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        from backend.rag.vector_store import vector_store
        vector_store.load()
    except Exception as e:
        print(f"Startup initialization note: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/api")
@app.get("/api/")
async def root():
    return {"message": "StudyBrain AI Backend is running", "status": "online"}

app.include_router(events_router, prefix="/api", tags=["Events"])
app.include_router(ingestion_router, prefix="/api", tags=["Ingestion"])
app.include_router(ask_router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(learning_router, prefix="/api/learning", tags=["Learning Analytics"])
app.include_router(copilot_router, prefix="/api/copilot", tags=["AI Copilot"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])

@app.get("/api/status")
async def get_status():
    """Checks the status of backend services."""
    import os
    groq_ok = bool(os.environ.get("GROQ_API_KEY"))
    
    return {
        "status": "online",
        "llm_provider": "Groq",
        "groq_available": groq_ok
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

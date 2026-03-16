from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as ingestion_router
from backend.api.ask_route import router as ask_router
from backend.api.learning_routes import router as learning_router
from backend.api.copilot_routes import router as copilot_router

app = FastAPI(title="StudyBrain AI Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "StudyBrain AI Backend is running"}

app.include_router(ingestion_router, prefix="/api", tags=["Ingestion"])
app.include_router(ask_router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(learning_router, prefix="/api/learning", tags=["Learning Analytics"])
app.include_router(copilot_router, prefix="/api/copilot", tags=["AI Copilot"])

@app.get("/api/status")
async def get_status():
    """Checks the status of various backend services."""
    from backend.llm.llm_interface import llm
    ollama_ok = await llm._call_ollama("test") is not None
    return {
        "status": "online",
        "llm_provider": "Ollama" if ollama_ok else "Gemini",
        "ollama_available": ollama_ok
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

# StudyBrain AI

A full-stack AI-powered study assistant application with a React frontend and FastAPI backend.

## Architecture

- **Frontend**: React + Vite, served on port 5000
- **Backend**: FastAPI (Python) with uvicorn, served on port 8000

## Features

- **Document Library**: Upload PDFs, images, code files, and text documents
- **AI Assistant**: RAG-powered Q&A using uploaded study materials
- **Learning Analytics**: Track study progress and document mastery
- **AI Copilot**: Additional AI assistance features
- **Dashboard**: Overview of study activity

## Project Structure

```
├── backend/               # FastAPI Python backend
│   ├── api/               # API route handlers
│   ├── ingestion/         # File upload and processing
│   ├── llm/               # LLM interface (Gemini + Ollama)
│   ├── ocr/               # Image OCR via Tesseract
│   ├── parsers/           # PDF, code, text parsers
│   ├── processing/        # Text chunking and cleaning
│   ├── rag/               # RAG pipeline, embeddings, vector store
│   ├── storage/           # Document persistence
│   └── main.py            # FastAPI app entry point
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── views/             # Page-level view components
│   ├── App.jsx            # Root app component (home + study modes)
│   └── main.jsx           # Vite entry point
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration (proxy to backend)
```

## Workflows

- **Start application**: `npm run dev` on port 5000 (webview)
- **Backend API**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000` (console)

## Key Technical Decisions

- **Lazy loading**: `sentence-transformers` (all-MiniLM-L6-v2) and `faiss` are loaded lazily on first use to allow fast server startup (3s instead of 29s)
- **LLM fallback**: Uses Ollama locally if available, falls back to Gemini API
- **Vector store**: FAISS index stored at `data/vector_index/`
- **API proxy**: Vite proxies `/api` requests to the backend at localhost:8000

## Dependencies

### Python
- `fastapi`, `uvicorn`: Web framework and server
- `sentence-transformers`: Embedding model (all-MiniLM-L6-v2, ~80MB, loaded lazily)
- `faiss-cpu`: Vector similarity search (loaded lazily)
- `google-generativeai`: Gemini LLM API
- `pymupdf`, `pytesseract`, `pillow`: Document parsing and OCR
- `tiktoken`: Token counting

### Node.js
- `react`, `react-dom`: UI framework
- `react-draggable`: Draggable windows in study workspace
- `lucide-react`: Icon library
- `vite`, `@vitejs/plugin-react`: Build tooling

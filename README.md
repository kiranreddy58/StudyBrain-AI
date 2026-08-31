# StudyBrain AI 🧠⚡

An intelligent, lightning-fast personal AI learning companion powered by **Groq Ultra-Fast AI Inference** and a **Multi-Modal Retrieval-Augmented Generation (RAG)** pipeline. StudyBrain AI transforms your study materials (PDFs, notes, textbooks, code) into a dynamic, interactive knowledge engine.

---

## 🌟 Key Features

- ⚡ **Groq Ultra-Fast AI Engine**: Sub-second AI inference powered by Groq LPU technology.
- 📚 **Multi-Modal RAG Pipeline**: Semantic document chunking, embeddings, and vector retrieval with source attribution.
- 📊 **Study Activity & Mastery Analytics**: Real-time study heatmaps, progress tracking, and concept mastery metrics.
- 🎯 **Adaptive Quiz & Learning Generator**: Dynamically generates tailored quizzes, summaries, and practice questions from your documents.
- 🪟 **Floating Multi-Window Assistant**: Multi-task across different subjects with draggable floating study windows.
- 🎨 **Modern Glassmorphic UI**: Sleek, responsive React design with dark mode and micro-interactions.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Vanilla CSS Design System |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **LLM Inference** | **Groq Cloud API** (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`) |
| **Vector Store & Retrieval** | FAISS, Sentence Transformers / Cloud MiniLM Embeddings |
| **Document Processing** | PyMuPDF, OCR Engine, Custom Text Chunkers |
| **Storage & Database** | SQLite, JSON Activity Store |
| **Deployment** | Vercel (Serverless Frontend & API) |

---

## 🚀 Quick Start & Run Commands

### 1. Prerequisites
- **Node.js 18+**
- **Python 3.10+**
- **Groq API Key** (Get free key from [Groq Console](https://console.groq.com/))

---

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

---

### 3. Start Backend Server

```powershell
# Navigate into the project folder
cd StudyBrain-AI

# Activate virtual environment (if using .venv)
..\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
python -m backend.main
```
> Backend runs at: `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`)

---

### 4. Start Frontend Development Server

Open a **separate terminal**:
```powershell
cd StudyBrain-AI

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

## 📂 Project Structure

```text
StudyBrain-AI/
├── api/                   # Serverless entrypoint for Vercel deployment
│   └── index.py
├── backend/               # FastAPI core backend
│   ├── api/               # API routes (ask, ingestion, learning, copilot, settings)
│   ├── ingestion/         # File upload & document parsers
│   ├── llm/               # Groq LLM interface & prompt management
│   ├── rag/               # Vector store & embedding pipeline
│   ├── storage/           # SQLite DB & activity models
│   └── main.py            # FastAPI main application
├── src/                   # React frontend application
│   ├── components/        # Reusable UI components & modules
│   ├── views/             # Main app views & dashboards
│   ├── App.jsx            # Main React entry & routing
│   └── index.css          # Design system & styles
├── public/                # Static assets
├── vercel.json            # Vercel deployment configuration
├── requirements.txt       # Python dependencies
└── package.json           # Node.js dependencies & scripts
```

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy StudyBrain AI with Groq AI integration"
   git push origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Add your `GROQ_API_KEY` in Vercel **Project Settings → Environment Variables**.
4. Click **Deploy**.

---

*Built with ❤️ for intelligent learning.*

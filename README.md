# StudyBrain AI 🧠

### 🚀 [Live Working Demo](http://18.188.200.96)

StudyBrain AI is a powerful, locally-hosted intelligent learning companion. It transforms your study materials (PDFs, notes, code) into a dynamic knowledge engine.

## 🚀 Features
- **Dynamic Heatmap & Analytics**: Track your study consistency with a real-time activity heatmap.
- **Multi-Modal RAG Pipeline**: Semantic search across your uploaded documents for grounded AI answers.
- **Ollama Integration**: Run your AI locally for privacy and cost savings, with an automatic Gemini fallback.
- **Adaptive Learning**: Mastery tracking that adjusts quiz difficulties based on your progress.
- **Floating AI Assistant**: Multi-task with multiple chat windows for different study topics.

## 🏗️ Architecture
- **Frontend**: React + Vite + Lucide Icons (Vanilla CSS for premium styling).
- **Backend**: FastAPI + Python.
- **Database**: SQLite (Activity & Mastery Tracking).
- **Vector Store**: FAISS (for Semantic Search).
- **LLM**: Local Ollama (llama3) or Google Gemini Flash.

## 🛠️ Installation & Run Commands

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (Optional, for local AI): [Download here](https://ollama.com/)

### 2. Setup Backend
Open a terminal in the project root:
```powershell
# Install dependencies
pip install -r requirements.txt

# Start the server
python -m backend.main
```

### 3. Setup Frontend
Open a **new** terminal in the project root:
```powershell
# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 4. Enable Local AI (Optional)
If you have Ollama installed:
```powershell
ollama serve
ollama pull llama3
```

## 📂 Project Structure
- `backend/`: FastAPI source code and logic.
- `src/`: React frontend components and views.
- `data/`: Local storage for processed documents and logs.
- `public/`: Static assets.

---
*Built with ❤️ for intelligent learning.*

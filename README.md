# StudyBrain AI 🧠⚡

<div align="center">

### 🌐 **Live Website**: [https://www.studybrainai.me](https://www.studybrainai.me)
*(Mirror: [https://studybrainai.me](https://studybrainai.me))*

**An intelligent, lightning-fast personal AI learning companion powered by Groq Ultra-Fast Inference, Multi-Modal RAG, and MongoDB Atlas Cloud.**

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](#-tech-stack--architecture)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?logo=fastapi&logoColor=white)](#-tech-stack--architecture)
[![AI Engine](https://img.shields.io/badge/AI%20Inference-Groq%20LPU-F55036?logo=groq&logoColor=white)](#-tech-stack--architecture)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](#-tech-stack--architecture)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white)](#-deployment)

</div>

---

## 🌟 Key Features

- ⚡ **Groq Ultra-Fast AI Engine**: Sub-second AI inference utilizing Groq LPU architecture (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`).
- 📚 **Multi-Modal RAG Pipeline**: Semantic document chunking, embeddings, and vector similarity search with direct source citations.
- 📊 **Study Activity & Mastery Analytics**: Real-time study heatmaps, progress tracking, and concept mastery metrics stored in the cloud.
- 🎯 **Adaptive Quiz & Learning Generator**: Dynamically generates tailored quizzes, flashcards, summaries, and practice questions from uploaded study materials.
- 🪟 **Floating Multi-Window Assistant**: Multi-task across multiple subjects with draggable, resizable floating study windows.
- 🍃 **MongoDB Atlas Cloud Database**: Persistent cloud storage for chat histories, processed documents, user settings, and learning stats.
- 🎨 **Modern Glassmorphic UI**: Sleek, responsive React design with dark mode, animations, and micro-interactions.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Vanilla CSS | Fast, responsive Single Page Application (SPA) |
| **Backend** | Python 3.10+, FastAPI, Uvicorn | High-performance asynchronous REST API |
| **LLM Inference** | **Groq Cloud API** | Sub-second AI completions and reasoning |
| **Cloud Database** | **MongoDB Atlas** | Persistent storage for users, chats, documents, and analytics |
| **Vector Store** | In-Memory / Vector Storage | Fast similarity search for document retrieval |
| **Document Processing** | PyMuPDF, OCR Engine, Custom Text Chunkers | Multi-format file parsing (PDFs, notes, textbooks) |
| **Hosting & DNS** | Vercel Serverless + Namecheap DNS | Global CDN edge hosting with custom domain SSL |

---

## 🚀 Quick Start & Local Run Commands

### 1. Prerequisites
- **Node.js 18+**
- **Python 3.10+**
- **Groq API Key** (Free from [Groq Console](https://console.groq.com/))
- **MongoDB Atlas Connection URI** (Free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

### 2. Environment Setup
Create a `.env` file in the root of the project:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/studybrain?retryWrites=true&w=majority
```

---

### 3. Run Backend (FastAPI)

```powershell
# Navigate to project directory
cd StudyBrain-AI

# (Optional) Activate your virtual environment
..\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m backend.main
```
> 🌐 Backend URL: `http://127.0.0.1:8000` (Swagger API Docs at `http://127.0.0.1:8000/docs`)

---

### 4. Run Frontend (React + Vite)

Open a **separate terminal window**:

```powershell
# Navigate to project directory
cd StudyBrain-AI

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
> 🌐 Frontend URL: `http://localhost:5173`

---

## 📂 Project Structure

```text
StudyBrain-AI/
├── api/                   # Serverless entrypoint for Vercel
│   └── index.py           # Serverless ASGI bridge
├── backend/               # FastAPI core backend
│   ├── api/               # API routes (ask, ingestion, learning, copilot, settings)
│   ├── ingestion/         # File upload & document parsers
│   ├── learning/          # Activity tracking & mastery engine
│   ├── llm/               # Groq LLM interface & prompt management
│   ├── processing/        # Chunking & text tokenization
│   ├── rag/               # Vector store & embedding pipeline
│   ├── storage/           # MongoDB Atlas & SQLite storage handlers
│   └── main.py            # FastAPI main application
├── src/                   # React frontend application
│   ├── components/        # Reusable UI modules & floating windows
│   ├── views/             # Main views (Dashboard, Assistant, Library, Progress, Settings)
│   ├── App.jsx            # Main React entry & routing
│   └── index.css          # Core design system & CSS tokens
├── public/                # Static assets
├── .vercelignore          # Vercel deployment exclusions
├── vercel.json            # Vercel routing & serverless configuration
├── requirements.txt       # Python dependencies (lightweight)
└── package.json           # Node.js dependencies & build scripts
```

---

## 🌐 Production Deployment

### **Deploying to Vercel with Custom Domain:**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy StudyBrain AI"
   git push origin main
   ```
2. **Import to Vercel**: Connect your GitHub repository on [Vercel](https://vercel.com).
3. **Set Environment Variables in Vercel Settings**:
   - `GROQ_API_KEY`: Your Groq API key
   - `MONGODB_URI`: Your MongoDB Atlas connection string
4. **Link Custom Domain**:
   - In Vercel Project Settings → Domains, add `studybrainai.me` and `www.studybrainai.me`.
   - In your DNS provider (e.g., Namecheap), configure the `A` record (`@` → `216.198.79.1` / `76.76.21.21`) and `CNAME` record (`www` → `cname.vercel-dns.com`).

---

*Built with ❤️ for intelligent, lightning-fast learning.*

import os
import requests
import json

API_KEY = "AIzaSyDeZAu2bTPouXmerAfNHGSLTDBc-K6Uz7s"

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3" 

class StudyBrainLLM:
    def __init__(self):
        self.gemini_model = None
        self._gemini_initialized = False

    def _init_gemini(self):
        if self._gemini_initialized:
            return
        self._gemini_initialized = True
        try:
            import google.generativeai as genai
            genai.configure(api_key=API_KEY)
            candidates = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-1.5-pro-latest', 'gemini-pro']
            for model_name in candidates:
                try:
                    print(f"Attempting to initialize Gemini model: {model_name}...")
                    self.gemini_model = genai.GenerativeModel(model_name)
                    break
                except Exception as e:
                    print(f"Failed to initialize {model_name}: {e}")
            if not self.gemini_model:
                print("WARNING: All Gemini model initializations failed.")
        except Exception as e:
            print(f"WARNING: Could not import google.generativeai: {e}")

    async def _call_ollama(self, prompt: str) -> str:
        """Calls the local Ollama API."""
        try:
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            }
            response = requests.post(OLLAMA_URL, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "")
            else:
                return None
        except Exception as e:
            print(f"Ollama connection error: {e}")
            return None

    async def generate_answer(self, query: str, context: str, provider: str = "auto") -> dict:
        """
        Generates a grounded answer.
        provider: "auto" (Ollama first), "ollama" (Strict), "gemini" (Strict)
        """
        if not context or str(context).strip() == "":
            return {
                "answer": "I'm sorry, I couldn't find any relevant information in your study materials to answer that question.",
                "sources": []
            }
            
        sources = set()
        for line in context.split('\n'):
            if line.startswith("Document: "):
                source = line.replace("Document: ", "").replace(" ---", "").strip()
                if source:
                    sources.add(source)

        prompt = (
            f"You are StudyBrain AI, a highly intelligent and helpful personal AI tutor.\n"
            f"You must answer the student's question ONLY using the information provided in the Context below. "
            f"If the Context does not contain the answer, politely say you cannot find it in their study materials.\n\n"
            f"Context:\n{context}\n\n"
            f"Student's Question:\n{query}\n\n"
            f"Provide a clear, educational, and well-structured answer."
        )
        
        answer_text = None
        
        if provider in ["auto", "ollama"]:
            answer_text = await self._call_ollama(prompt)
            if not answer_text and provider == "ollama":
                return {"answer": "Error: Local Ollama is not responding. Please check your Ollama service.", "sources": []}

        if not answer_text and provider in ["auto", "gemini"]:
            self._init_gemini()
            if provider == "auto": print("Ollama unavailable, using Gemini fallback...")
            try:
                response = await self.gemini_model.generate_content_async(prompt)
                answer_text = response.text
            except Exception as e:
                answer_text = f"An error occurred while contacting the AI: {str(e)}"

        return {
            "answer": answer_text,
            "sources": list(sources)
        }

# Global instance
llm = StudyBrainLLM()

import os
import requests
import json
import google.generativeai as genai

# Setup the Gemini API key
API_KEY = "AIzaSyDeZAu2bTPouXmerAfNHGSLTDBc-K6Uz7s"
genai.configure(api_key=API_KEY)

OLLAMA_URL = "http://localhost:11434/api/generate"
# You can change the model as per your local installation
OLLAMA_MODEL = "llama3" 

class StudyBrainLLM:
    def __init__(self):
        # Gemini setup - Try multiple variants to avoid 404
        candidates = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-1.5-pro', 'gemini-pro']
        self.gemini_model = None
        
        for model_name in candidates:
            try:
                print(f"Attempting to initialize Gemini model: {model_name}...")
                self.gemini_model = genai.GenerativeModel(model_name)
                # Test the model with a tiny request to ensure it exists
                # We do this because GenerativeModel initialization alone doesn't always trigger a 404
                # But here we'll just assign it and catch the error during generation if needed.
                # Actually, some SDK versions will 404 only on call.
                break
            except Exception as e:
                print(f"Failed to initialize {model_name}: {e}")
        
        if not self.gemini_model:
            print("WARNING: All Gemini model initializations failed.")

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
        
        # 1. Try Ollama if preferred or auto
        if provider in ["auto", "ollama"]:
            answer_text = await self._call_ollama(prompt)
            if not answer_text and provider == "ollama":
                return {"answer": "Error: Local Ollama is not responding. Please check your Ollama service.", "sources": []}

        # 2. Try Gemini if Ollama failed (auto) or Gemini was explicitly requested
        if not answer_text and provider in ["auto", "gemini"]:
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
